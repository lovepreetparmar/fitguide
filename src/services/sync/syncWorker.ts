import { canSyncUserToSupabase } from '@/utils/userId';
import { workoutService } from '@/services/workout';
import { recoveryService, progressService } from '@/services/progress';
import { nutritionService } from '@/services/nutrition';
import { nutritionMealsService } from '@/services/nutritionMeals';
import { engagementService } from '@/services/engagement';
import {
  outboxService,
  type MeasurementLoggedPayload,
  type NutritionLoggedPayload,
  type MealItemAddedPayload,
  type OutboxMutation,
  type ProgressLoggedPayload,
  type WorkoutCompletedPayload,
} from './outbox';
import type { MuscleGroup } from '@/types';

async function handleWorkoutCompleted(item: OutboxMutation): Promise<void> {
  const { session, muscleVolumes } = item.payload as WorkoutCompletedPayload;
  await workoutService.syncCompletedSession(session, item.user_id);
  if (Object.keys(muscleVolumes).length > 0) {
    await recoveryService.updateRecoveryAfterWorkout(
      item.user_id,
      muscleVolumes as Record<MuscleGroup, number>
    );
  }
  await engagementService.refreshFromServer(item.user_id);
}

async function handleNutritionLogged(item: OutboxMutation): Promise<void> {
  const { log } = item.payload as NutritionLoggedPayload;
  await nutritionService.logNutrition(item.user_id, log);
}

async function handleMealItemAdded(mutation: OutboxMutation): Promise<void> {
  const { date, mealType, client_item_id, item } = mutation.payload as MealItemAddedPayload;
  await nutritionMealsService.syncMealItemFromOutbox(
    mutation.user_id,
    mealType,
    item,
    date,
    client_item_id
  );
}

async function handleProgressLogged(item: OutboxMutation): Promise<void> {
  const { entry } = item.payload as ProgressLoggedPayload;
  await progressService.logProgress(item.user_id, entry);
}

async function handleMeasurementLogged(item: OutboxMutation): Promise<void> {
  const { entry } = item.payload as MeasurementLoggedPayload;
  await progressService.logMeasurement(item.user_id, entry);
}

const HANDLERS: Record<string, (item: OutboxMutation) => Promise<void>> = {
  'workout.completed': handleWorkoutCompleted,
  'nutrition.logged': handleNutritionLogged,
  'meal.item.added': handleMealItemAdded,
  'progress.logged': handleProgressLogged,
  'measurement.logged': handleMeasurementLogged,
  'workout.set.updated': async () => {
    /* Sprint 2 */
  },
  'achievement.updated': async () => {
    /* Sprint 2 */
  },
  'settings.updated': async () => {
    /* Sprint 2 */
  },
};

export async function flushSyncOutbox(): Promise<{ synced: number; failed: number }> {
  const items = await outboxService.list();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    if (item.status !== 'pending') continue;

    const handler = HANDLERS[item.operation_type];
    if (!handler) {
      failed++;
      continue;
    }

    if (!canSyncUserToSupabase(item.user_id)) {
      failed++;
      continue;
    }

    try {
      await handler(item);
      await outboxService.remove(item.id);
      synced++;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sync failed';
      await outboxService.markAttempt(item.id, message);
      failed++;
    }
  }

  return { synced, failed };
}
