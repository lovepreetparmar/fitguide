import { supabase } from './supabase';
import type { Measurement, MuscleGroup, ProgressEntry, RecoveryData, RecoveryStatus } from '@/types';
import { MUSCLE_GROUPS } from '@/constants/app';
import { canSyncUserToSupabase } from '@/utils/userId';
import { useAppStore } from '@/store/appStore';
import { outboxService } from '@/services/sync/outbox';

const RECOVERY_THRESHOLDS = {
  recovered: 80,
  recovering: 50,
};

export const recoveryService = {
  async getRecoveryData(userId: string): Promise<RecoveryData[]> {
    if (!canSyncUserToSupabase(userId)) {
      return this.generateDefaultRecovery().map((row) => ({ ...row, user_id: userId }));
    }

    const { data, error } = await supabase
      .from('recovery')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return [];
      throw error;
    }

    if (!data?.length) {
      await this.initializeForUser(userId);
      const { data: seeded } = await supabase
        .from('recovery')
        .select('*')
        .eq('user_id', userId);
      return (seeded as RecoveryData[]) ?? [];
    }

    return data as RecoveryData[];
  },

  async initializeForUser(userId: string): Promise<void> {
    if (!canSyncUserToSupabase(userId)) return;

    const rows = MUSCLE_GROUPS.map((muscle) => ({
      user_id: userId,
      muscle_group: muscle.id,
      status: 'recovered' as RecoveryStatus,
      score: 85,
      last_trained_at: null,
      volume_last_7_days: 0,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('recovery').upsert(rows, {
      onConflict: 'user_id,muscle_group',
    });
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
  },

  generateDefaultRecovery(): RecoveryData[] {
    const baseScores: Record<string, number> = {
      chest: 91,
      back: 85,
      shoulders: 85,
      triceps: 91,
      biceps: 98,
      forearms: 90,
      abs: 88,
      obliques: 87,
      glutes: 86,
      quadriceps: 84,
      hamstrings: 83,
      calves: 92,
    };

    return MUSCLE_GROUPS.map((muscle) => ({
      id: `recovery_${muscle.id}`,
      user_id: 'local',
      muscle_group: muscle.id as MuscleGroup,
      status: 'recovered' as RecoveryStatus,
      score: baseScores[muscle.id] ?? 85,
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
    if (!canSyncUserToSupabase(userId)) return;

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

    const { error } = await supabase.from('recovery').upsert(updates, {
      onConflict: 'user_id,muscle_group',
    });
    if (error) throw error;
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

function filterProgressByPeriod(
  entries: ProgressEntry[],
  period: 'week' | 'month' | 'year'
): ProgressEntry[] {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const start = startDate.toISOString().split('T')[0];
  return entries.filter((e) => e.date >= start).sort((a, b) => a.date.localeCompare(b.date));
}

export const progressService = {
  async getProgress(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ProgressEntry[]> {
    const local = useAppStore
      .getState()
      .localProgress.filter((p) => p.user_id === userId);

    if (!canSyncUserToSupabase(userId)) {
      return filterProgressByPeriod(local, period);
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

    if (error) return filterProgressByPeriod(local, period);
    const remote = (data as ProgressEntry[]) ?? [];
    const merged = new Map<string, ProgressEntry>();
    for (const row of [...local, ...remote]) merged.set(row.date, row);
    return filterProgressByPeriod([...merged.values()], period);
  },

  async logProgress(userId: string, entry: Omit<ProgressEntry, 'id' | 'user_id'>): Promise<ProgressEntry> {
    const draft: ProgressEntry = {
      id: `local_${userId}_${entry.date}`,
      user_id: userId,
      ...entry,
    };

    if (!canSyncUserToSupabase(userId)) {
      useAppStore.getState().addLocalProgress(draft);
      return draft;
    }

    const newEntry = { ...entry, user_id: userId };

    const { data, error } = await supabase.from('progress').insert(newEntry).select().single();
    if (error) {
      useAppStore.getState().addLocalProgress(draft);
      await outboxService.enqueueProgressLog(userId, entry);
      return draft;
    }
    const saved = data as ProgressEntry;
    useAppStore.getState().addLocalProgress(saved);
    return saved;
  },

  async getMeasurements(userId: string) {
    if (!canSyncUserToSupabase(userId)) return [];
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (error) return [];
    return (data as Measurement[]) ?? [];
  },

  async logMeasurement(
    userId: string,
    entry: Omit<Measurement, 'id' | 'user_id'>
  ): Promise<Measurement> {
    if (!canSyncUserToSupabase(userId)) {
      throw new Error('Sign in to sync body measurements.');
    }
    const { data, error } = await supabase
      .from('measurements')
      .insert({ ...entry, user_id: userId })
      .select()
      .single();
    if (error) {
      await outboxService.enqueueMeasurementLog(userId, entry);
      throw new Error('Saved locally; will sync when online.');
    }
    return data as Measurement;
  },
};
