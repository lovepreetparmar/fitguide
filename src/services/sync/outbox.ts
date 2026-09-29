import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { MealType, MuscleGroup, NutritionLog, ProgressEntry, WorkoutSession } from '@/types';
import type { Measurement } from '@/types';

const OUTBOX_KEY = 'fitguide-sync-outbox';

export type OutboxOperationType =
  | 'workout.completed'
  | 'workout.set.updated'
  | 'nutrition.logged'
  | 'meal.item.added'
  | 'progress.logged'
  | 'measurement.logged'
  | 'achievement.updated'
  | 'settings.updated';

export type OutboxStatus = 'pending' | 'failed';

export interface OutboxMutation {
  id: string;
  user_id: string;
  operation_type: OutboxOperationType;
  payload: unknown;
  created_at: string;
  retry_count: number;
  status: OutboxStatus;
  last_error?: string;
  idempotency_key: string;
}

export type WorkoutCompletedPayload = {
  session: WorkoutSession;
  muscleVolumes: Partial<Record<MuscleGroup, number>>;
};

export type NutritionLoggedPayload = {
  log: Partial<NutritionLog>;
};

export type MealItemAddedPayload = {
  date: string;
  mealType: MealType;
  client_item_id: string;
  item: {
    food_id?: string | null;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
};

export type ProgressLoggedPayload = {
  entry: Omit<ProgressEntry, 'id' | 'user_id'>;
};

export type MeasurementLoggedPayload = {
  entry: Omit<Measurement, 'id' | 'user_id'>;
};

/** @deprecated legacy shape */
type LegacyOutboxItem = {
  id: string;
  type: 'complete_workout';
  createdAt: string;
  attempts: number;
  payload: WorkoutCompletedPayload & { userId: string };
};

function normalizeLegacy(item: LegacyOutboxItem): OutboxMutation {
  const session = item.payload.session;
  return {
    id: item.id,
    user_id: item.payload.userId,
    operation_type: 'workout.completed',
    payload: {
      session,
      muscleVolumes: item.payload.muscleVolumes,
    },
    created_at: item.createdAt,
    retry_count: item.attempts,
    status: 'pending',
    idempotency_key: `workout.completed:${session.id}`,
  };
}

function isLegacyItem(raw: unknown): raw is LegacyOutboxItem {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as LegacyOutboxItem).type === 'complete_workout'
  );
}

async function readOutbox(): Promise<OutboxMutation[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((item) => (isLegacyItem(item) ? normalizeLegacy(item) : item as OutboxMutation));
  } catch {
    return [];
  }
}

async function writeOutbox(items: OutboxMutation[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export const outboxService = {
  async enqueue(mutation: Omit<OutboxMutation, 'id' | 'created_at' | 'retry_count' | 'status'>): Promise<string> {
    const items = await readOutbox();
    const existingIdx = items.findIndex(
      (i) => i.idempotency_key === mutation.idempotency_key && i.status === 'pending'
    );
    const id = existingIdx >= 0 ? items[existingIdx].id : Crypto.randomUUID();
    const entry: OutboxMutation = {
      ...mutation,
      id,
      created_at: existingIdx >= 0 ? items[existingIdx].created_at : new Date().toISOString(),
      retry_count: existingIdx >= 0 ? items[existingIdx].retry_count : 0,
      status: 'pending',
      last_error: undefined,
    };
    if (existingIdx >= 0) {
      items[existingIdx] = entry;
    } else {
      items.push(entry);
    }
    await writeOutbox(items);
    return id;
  },

  async enqueueCompleteWorkout(
    session: WorkoutSession,
    userId: string,
    muscleVolumes: Partial<Record<MuscleGroup, number>>
  ): Promise<void> {
    await this.enqueue({
      user_id: userId,
      operation_type: 'workout.completed',
      idempotency_key: `workout.completed:${session.id}`,
      payload: { session, muscleVolumes },
    });
  },

  async enqueueMealItemAdded(
    userId: string,
    payload: MealItemAddedPayload
  ): Promise<void> {
    await this.enqueue({
      user_id: userId,
      operation_type: 'meal.item.added',
      idempotency_key: `meal.item.added:${payload.client_item_id}`,
      payload,
    });
  },

  async enqueueNutritionLog(userId: string, log: Partial<NutritionLog>, dateKey: string): Promise<void> {
    await this.enqueue({
      user_id: userId,
      operation_type: 'nutrition.logged',
      idempotency_key: `nutrition.logged:${userId}:${dateKey}`,
      payload: { log },
    });
  },

  async enqueueProgressLog(
    userId: string,
    entry: Omit<ProgressEntry, 'id' | 'user_id'>
  ): Promise<void> {
    await this.enqueue({
      user_id: userId,
      operation_type: 'progress.logged',
      idempotency_key: `progress.logged:${userId}:${entry.date}`,
      payload: { entry },
    });
  },

  async enqueueMeasurementLog(
    userId: string,
    entry: Omit<Measurement, 'id' | 'user_id'>
  ): Promise<void> {
    await this.enqueue({
      user_id: userId,
      operation_type: 'measurement.logged',
      idempotency_key: `measurement.logged:${userId}:${entry.date}`,
      payload: { entry },
    });
  },

  async list(): Promise<OutboxMutation[]> {
    return readOutbox();
  },

  async listFailed(): Promise<OutboxMutation[]> {
    return (await readOutbox()).filter((i) => i.status === 'failed');
  },

  async remove(id: string): Promise<void> {
    const items = await readOutbox();
    await writeOutbox(items.filter((i) => i.id !== id));
  },

  async markAttempt(id: string, errorMessage?: string): Promise<void> {
    const items = await readOutbox();
    await writeOutbox(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              retry_count: i.retry_count + 1,
              status: errorMessage ? 'failed' : i.status,
              last_error: errorMessage ?? i.last_error,
            }
          : i
      )
    );
  },

  async retry(id: string): Promise<void> {
    const items = await readOutbox();
    await writeOutbox(
      items.map((i) =>
        i.id === id ? { ...i, status: 'pending' as const, last_error: undefined } : i
      )
    );
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(OUTBOX_KEY);
  },

  async pendingCount(): Promise<number> {
    return (await readOutbox()).filter((i) => i.status === 'pending').length;
  },

  async rewriteUserId(fromUserId: string, toUserId: string): Promise<void> {
    const items = await readOutbox();
    const updated = items.map((item) => {
      if (item.user_id !== fromUserId) return item;
      const payload = item.payload as Record<string, unknown>;
      if (item.operation_type === 'workout.completed' && payload.session) {
        const session = payload.session as WorkoutSession;
        return {
          ...item,
          user_id: toUserId,
          payload: {
            ...payload,
            session: { ...session, user_id: toUserId },
          },
          idempotency_key: item.idempotency_key.replace(fromUserId, toUserId),
        };
      }
      return {
        ...item,
        user_id: toUserId,
        idempotency_key: item.idempotency_key.replace(fromUserId, toUserId),
      };
    });
    await writeOutbox(updated);
  },
};
