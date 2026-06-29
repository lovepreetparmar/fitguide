import { supabase, isSupabaseConfigured } from './supabase';
import type { MuscleGroup, ProgressEntry, RecoveryData, RecoveryStatus } from '@/types';
import { MUSCLE_GROUPS } from '@/constants/app';

const RECOVERY_THRESHOLDS = {
  recovered: 80,
  recovering: 50,
};

export const recoveryService = {
  async getRecoveryData(userId: string): Promise<RecoveryData[]> {
    if (!isSupabaseConfigured) {
      return this.generateDefaultRecovery();
    }

    const { data, error } = await supabase
      .from('recovery')
      .select('*')
      .eq('user_id', userId);

    if (error || !data?.length) {
      return this.generateDefaultRecovery();
    }

    return data as RecoveryData[];
  },

  generateDefaultRecovery(): RecoveryData[] {
    return MUSCLE_GROUPS.map((muscle) => ({
      id: `recovery_${muscle.id}`,
      user_id: 'local',
      muscle_group: muscle.id as MuscleGroup,
      status: 'recovered' as RecoveryStatus,
      score: 85 + Math.floor(Math.random() * 15),
      last_trained_at: null,
      volume_last_7_days: 0,
      updated_at: new Date().toISOString(),
    }));
  },

  calculateRecoveryScore(
    lastTrainedAt: string | null,
    volumeLast7Days: number,
    restDays: number
  ): { score: number; status: RecoveryStatus } {
    let score = 100;

    if (lastTrainedAt) {
      const hoursSince = (Date.now() - new Date(lastTrainedAt).getTime()) / 3600000;
      const recoveryHours = 48 + volumeLast7Days * 0.5;
      score = Math.min(100, Math.round((hoursSince / recoveryHours) * 100));
    }

    score = Math.min(100, score + restDays * 5);

    let status: RecoveryStatus = 'recovered';
    if (score < RECOVERY_THRESHOLDS.recovering) {
      status = 'needs_rest';
    } else if (score < RECOVERY_THRESHOLDS.recovered) {
      status = 'recovering';
    }

    return { score, status };
  },

  async updateRecoveryAfterWorkout(
    userId: string,
    muscleVolumes: Record<MuscleGroup, number>
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const updates = Object.entries(muscleVolumes).map(([muscle, volume]) => {
      const { score, status } = this.calculateRecoveryScore(
        new Date().toISOString(),
        volume,
        0
      );
      return {
        user_id: userId,
        muscle_group: muscle,
        status,
        score,
        last_trained_at: new Date().toISOString(),
        volume_last_7_days: volume,
        updated_at: new Date().toISOString(),
      };
    });

    await supabase.from('recovery').upsert(updates);
  },

  getOverallRecoveryScore(recovery: RecoveryData[]): number {
    if (!recovery.length) return 100;
    return Math.round(recovery.reduce((sum, r) => sum + r.score, 0) / recovery.length);
  },

  getRecoveryColor(status: RecoveryStatus): string {
    const colors: Record<RecoveryStatus, string> = {
      recovered: '#00D9A5',
      recovering: '#FFC107',
      needs_rest: '#FF5252',
    };
    return colors[status];
  },
};

export const progressService = {
  async getProgress(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ProgressEntry[]> {
    if (!isSupabaseConfigured) {
      return this.generateSampleProgress(period);
    }

    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) return this.generateSampleProgress(period);
    return (data as ProgressEntry[]) ?? [];
  },

  generateSampleProgress(period: 'week' | 'month' | 'year'): ProgressEntry[] {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    const entries: ProgressEntry[] = [];
    const baseWeight = 75;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (period === 'year') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      entries.push({
        id: `progress_${i}`,
        user_id: 'local',
        date: date.toISOString().split('T')[0],
        weight_kg: baseWeight + (days - i) * 0.05 + (Math.random() - 0.5) * 0.5,
        body_fat_percent: 18 - (days - i) * 0.02 + (Math.random() - 0.5) * 0.3,
        muscle_mass_kg: 35 + (days - i) * 0.03,
        calories: 2000 + Math.floor(Math.random() * 500),
        workout_volume_kg: Math.floor(Math.random() * 5000) + 2000,
        notes: null,
      });
    }

    return entries;
  },

  async logProgress(userId: string, entry: Omit<ProgressEntry, 'id' | 'user_id'>): Promise<ProgressEntry> {
    const newEntry = { ...entry, user_id: userId };

    if (!isSupabaseConfigured) {
      return { ...newEntry, id: `progress_${Date.now()}` };
    }

    const { data, error } = await supabase.from('progress').insert(newEntry).select().single();
    if (error) throw error;
    return data as ProgressEntry;
  },

  async getMeasurements(userId: string) {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (error) return [];
    return data ?? [];
  },
};
