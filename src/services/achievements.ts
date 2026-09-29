import { supabase } from './supabase';
import { canSyncUserToSupabase } from '@/utils/userId';

export const ACHIEVEMENT_CATALOG: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  first_workout: {
    title: 'First Step',
    description: 'Completed your first workout',
    icon: 'trophy',
  },
  ten_workouts: {
    title: 'On a Roll',
    description: '10-day workout streak',
    icon: 'flame',
  },
  thirty_day_streak: {
    title: 'Unstoppable',
    description: '30-day workout streak',
    icon: 'medal',
  },
  first_pr: {
    title: 'New PR',
    description: 'Set a personal record',
    icon: 'barbell',
  },
};

export const achievementsService = {
  async list(userId: string) {
    if (!canSyncUserToSupabase(userId)) return [];
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async unlock(userId: string, achievementType: string) {
    const meta = ACHIEVEMENT_CATALOG[achievementType];
    if (!meta) return;

    if (!canSyncUserToSupabase(userId)) return;

    const { error } = await supabase.from('achievements').upsert(
      {
        user_id: userId,
        achievement_type: achievementType,
        title: meta.title,
        description: meta.description,
        icon: meta.icon,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,achievement_type' }
    );

    if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
      console.warn('achievement unlock failed', error.message);
    }
  },
};
