import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { outboxService } from '@/services/sync/outbox';
import { isLocalAppUserId } from '@/utils/userId';
import type { Profile } from '@/types';

const MIGRATION_MARKER_PREFIX = 'fitguide-migrated:';

export async function migrateLocalGuestToSupabaseUser(
  fromLocalUserId: string,
  toSupabaseUserId: string,
  profile: Profile | null
): Promise<{ migrated: boolean; error?: string }> {
  if (!isLocalAppUserId(fromLocalUserId)) {
    return { migrated: false };
  }

  const marker = `${MIGRATION_MARKER_PREFIX}${fromLocalUserId}->${toSupabaseUserId}`;
  const done = await AsyncStorage.getItem(marker);
  if (done === 'ok') {
    return { migrated: false };
  }

  try {
    const app = useAppStore.getState();
    const workout = useWorkoutStore.getState();

    if (profile) {
      useAppStore.setState({
        cachedNutrition: app.cachedNutrition?.user_id === fromLocalUserId
          ? { ...app.cachedNutrition, user_id: toSupabaseUserId }
          : app.cachedNutrition,
        localProgress: app.localProgress.map((p) =>
          p.user_id === fromLocalUserId ? { ...p, user_id: toSupabaseUserId } : p
        ),
        cachedWorkouts: app.cachedWorkouts.map((s) =>
          s.user_id === fromLocalUserId ? { ...s, user_id: toSupabaseUserId } : s
        ),
      });
    }

    if (workout.activeSession?.user_id === fromLocalUserId) {
      useWorkoutStore.setState({
        activeSession: {
          ...workout.activeSession,
          user_id: toSupabaseUserId,
        },
      });
    }

    await outboxService.rewriteUserId(fromLocalUserId, toSupabaseUserId);
    await AsyncStorage.setItem(marker, 'ok');
    return { migrated: true };
  } catch (e) {
    return {
      migrated: false,
      error: e instanceof Error ? e.message : 'Migration failed',
    };
  }
}

export async function runPostAuthMigration(
  previousUserId: string | undefined,
  newUserId: string,
  profile: Profile | null
): Promise<void> {
  if (!previousUserId || previousUserId === newUserId) return;
  if (!isLocalAppUserId(previousUserId)) return;
  await migrateLocalGuestToSupabaseUser(previousUserId, newUserId, profile);
}
