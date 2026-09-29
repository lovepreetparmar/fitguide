import { supabase } from './supabase';
import { canSyncUserToSupabase } from '@/utils/userId';
import { useAppStore } from '@/store/appStore';

export interface UserEngagement {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
  updated_at: string;
}

/** Calendar-day streak from sorted unique workout dates (UTC date strings). */
export function computeStreakFromWorkoutDates(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
} {
  const unique = [...new Set(dates)].sort();
  if (!unique.length) {
    return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const cur = new Date(unique[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run++;
      longest = Math.max(longest, run);
    } else if (diffDays > 1) {
      run = 1;
    }
  }

  const last = unique[unique.length - 1];
  let current = 1;
  for (let i = unique.length - 2; i >= 0; i--) {
    const prev = new Date(unique[i]);
    const cur = new Date(unique[i + 1]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) current++;
    else break;
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (last !== today && last !== yesterdayStr) {
    current = 0;
  }

  return { currentStreak: current, longestStreak: longest, lastWorkoutDate: last };
}

export const engagementService = {
  async fetch(userId: string): Promise<UserEngagement | null> {
    if (!canSyncUserToSupabase(userId)) return null;
    const { data, error } = await supabase
      .from('user_engagement')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return null;
      throw error;
    }
    return data as UserEngagement | null;
  },

  async refreshFromServer(userId: string): Promise<UserEngagement | null> {
    if (!canSyncUserToSupabase(userId)) return null;

    const { error: engError } = await supabase.rpc('recompute_user_engagement', {
      p_user_id: userId,
    });
    if (engError && engError.code !== '42883') {
      console.warn('recompute_user_engagement', engError.message);
    }

    const { error: achError } = await supabase.rpc('recompute_achievements', {
      p_user_id: userId,
    });
    if (achError && achError.code !== '42883') {
      console.warn('recompute_achievements', achError.message);
    }

    const row = await this.fetch(userId);
    if (row) {
      useAppStore.getState().setEngagementCache(row.current_streak, row.last_workout_date);
    }
    return row;
  },
};
