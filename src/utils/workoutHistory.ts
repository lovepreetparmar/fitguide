import type { WorkoutSession } from '@/types';

export type HistoryPeriod = 'week' | 'month' | 'year' | 'lifetime';

export type PersonalRecord = {
  id: string;
  exerciseId: string;
  title: string;
  value: string;
  detail: string;
};

function getPeriodStart(period: HistoryPeriod) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === 'week') {
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    return start;
  }

  if (period === 'month') {
    start.setDate(start.getDate() - 29);
    return start;
  }

  if (period === 'year') {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }

  return null;
}

export function mergeWorkoutSessions(
  remoteSessions: WorkoutSession[],
  cachedSessions: WorkoutSession[]
): WorkoutSession[] {
  const byId = new Map<string, WorkoutSession>();

  for (const session of remoteSessions) {
    byId.set(session.id, session);
  }

  for (const session of cachedSessions) {
    if (!session.completed_at) continue;
    const existing = byId.get(session.id);
    if (!existing || (session.sets?.length ?? 0) > (existing.sets?.length ?? 0)) {
      byId.set(session.id, session);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = new Date(a.completed_at ?? a.started_at).getTime();
    const bTime = new Date(b.completed_at ?? b.started_at).getTime();
    return bTime - aTime;
  });
}

export function filterSessionsByPeriod(
  sessions: WorkoutSession[],
  period: HistoryPeriod
): WorkoutSession[] {
  const start = getPeriodStart(period);
  if (!start) return sessions;

  return sessions.filter((session) => {
    if (!session.completed_at) return false;
    return new Date(session.completed_at) >= start;
  });
}

export function getSessionVolumeKg(session: WorkoutSession) {
  return (session.sets ?? [])
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + (set.weight_kg ?? 0) * set.reps, 0);
}

export function getTotalVolumeKg(sessions: WorkoutSession[]) {
  return sessions.reduce((sum, session) => sum + getSessionVolumeKg(session), 0);
}

export function getWorkoutsThisWeek(sessions: WorkoutSession[]) {
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  return sessions.filter(
    (session) => session.completed_at && new Date(session.completed_at) >= startOfWeek
  ).length;
}

export function getTrainingDays(sessions: WorkoutSession[]) {
  return new Set(
    sessions
      .map((session) => session.completed_at?.split('T')[0])
      .filter((date): date is string => Boolean(date))
  ).size;
}

export function getWeeklyActivity(sessions: WorkoutSession[]) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = labels.map((label) => ({ label, value: 0 }));

  sessions.forEach((session) => {
    if (!session.completed_at) return;
    const day = new Date(session.completed_at).getDay();
    const index = day === 0 ? 6 : day - 1;
    counts[index].value += 1;
  });

  return counts;
}

export function buildPersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const bestByExercise = new Map<
    string,
    { exerciseId: string; title: string; weight: number; reps: number }
  >();

  for (const session of sessions) {
    for (const set of session.sets ?? []) {
      if (!set.completed) continue;

      const title = set.exercise?.name ?? 'Exercise';
      const existing = bestByExercise.get(set.exercise_id);
      const weight = set.weight_kg ?? 0;
      const volume = weight * set.reps;
      const existingVolume = existing ? existing.weight * existing.reps : -1;

      if (!existing || volume > existingVolume || (volume === existingVolume && weight > existing.weight)) {
        bestByExercise.set(set.exercise_id, {
          exerciseId: set.exercise_id,
          title,
          weight,
          reps: set.reps,
        });
      }
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.weight * b.reps - a.weight * a.reps)
    .slice(0, 8)
    .map((record) => ({
      id: record.exerciseId,
      exerciseId: record.exerciseId,
      title: record.title,
      value: record.weight > 0 ? `${record.weight} kg` : `${record.reps} reps`,
      detail:
        record.weight > 0
          ? `${record.reps} reps • best set volume`
          : 'Bodyweight best set',
    }));
}

export function getAverageDurationMinutes(sessions: WorkoutSession[]) {
  if (!sessions.length) return 0;
  const total = sessions.reduce((sum, session) => sum + (session.duration_minutes ?? 0), 0);
  return Math.round(total / sessions.length);
}

export function getTotalCaloriesBurned(sessions: WorkoutSession[]) {
  return sessions.reduce((sum, session) => sum + (session.calories_burned ?? 0), 0);
}

export function getCoachInsight(options: {
  sessions: WorkoutSession[];
  recoveryScore: number;
  streak: number;
  workoutsThisWeek: number;
  weeklyTarget: number;
  period: HistoryPeriod;
}) {
  const { sessions, recoveryScore, streak, workoutsThisWeek, weeklyTarget, period } = options;
  const periodLabel =
    period === 'week'
      ? 'this week'
      : period === 'month'
        ? 'this month'
        : period === 'year'
          ? 'this year'
          : 'so far';

  if (!sessions.length) {
    return 'Complete your first workout to unlock training insights, personal records, and weekly trends.';
  }

  const volume = getTotalVolumeKg(sessions);
  const avgDuration = getAverageDurationMinutes(sessions);

  if (workoutsThisWeek >= weeklyTarget) {
    return `You hit your weekly target with ${workoutsThisWeek} sessions. ${Math.round(volume).toLocaleString()} kg moved ${periodLabel} at ~${avgDuration} min per workout.`;
  }

  if (recoveryScore < 60) {
    return 'Recovery is trending lower. Consider a lighter session or an extra rest day before pushing volume again.';
  }

  if (streak >= 7) {
    return `Strong ${streak}-day streak. You logged ${sessions.length} workout${sessions.length === 1 ? '' : 's'} ${periodLabel} with ${Math.round(volume).toLocaleString()} kg total volume.`;
  }

  return `You completed ${sessions.length} workout${sessions.length === 1 ? '' : 's'} ${periodLabel}. Keep building consistency — you're ${Math.max(weeklyTarget - workoutsThisWeek, 0)} session${weeklyTarget - workoutsThisWeek === 1 ? '' : 's'} from this week's goal.`;
}
