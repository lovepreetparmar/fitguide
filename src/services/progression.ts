import type { Profile, WorkoutSet } from '@/types';

export interface HistorySetEntry {
  date: string;
  set: Pick<WorkoutSet, 'reps' | 'weight_kg' | 'set_number' | 'rpe'>;
}

export interface ExercisePerformanceSummary {
  lastWeightKg: number | null;
  lastReps: number;
  lastDate: string | null;
  bestWeightKg: number | null;
  bestEstimated1Rm: number;
  setCount: number;
}

export interface PersonalRecordHit {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'e1rm';
  value: number;
  previousBest: number;
}

/** Brzycki formula (reps 1–12). */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const cappedReps = Math.min(reps, 12);
  return Math.round((weightKg * (36 / (37 - cappedReps))) * 10) / 10;
}

export function roundToPlate(weightKg: number, increment = 2.5): number {
  return Math.round(weightKg / increment) * increment;
}

export function summarizeExerciseHistory(entries: HistorySetEntry[]): ExercisePerformanceSummary {
  if (!entries.length) {
    return {
      lastWeightKg: null,
      lastReps: 0,
      lastDate: null,
      bestWeightKg: null,
      bestEstimated1Rm: 0,
      setCount: 0,
    };
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestDate = sorted[0]?.date ?? null;
  const latestSessionSets = sorted.filter((e) => e.date === latestDate);
  const lastSet = latestSessionSets.reduce((best, entry) => {
    const w = entry.set.weight_kg ?? 0;
    const bw = best.set.weight_kg ?? 0;
    return w > bw ? entry : best;
  }, latestSessionSets[0]);

  let bestWeight = 0;
  let bestE1rm = 0;
  for (const entry of entries) {
    const w = entry.set.weight_kg ?? 0;
    const r = entry.set.reps ?? 0;
    if (w > bestWeight) bestWeight = w;
    const e1rm = estimateOneRepMax(w, r);
    if (e1rm > bestE1rm) bestE1rm = e1rm;
  }

  return {
    lastWeightKg: lastSet?.set.weight_kg ?? null,
    lastReps: lastSet?.set.reps ?? 0,
    lastDate: latestDate,
    bestWeightKg: bestWeight > 0 ? bestWeight : null,
    bestEstimated1Rm: bestE1rm,
    setCount: entries.length,
  };
}

export function suggestWorkingWeight(
  summary: ExercisePerformanceSummary | undefined,
  profile: Profile,
  fallbackKg: number | null
): number | null {
  if (!summary?.lastWeightKg) return fallbackKg;
  const progressiveGoals =
    profile.goal === 'build_muscle' || profile.goal === 'get_stronger';
  if (!progressiveGoals) return summary.lastWeightKg;
  return roundToPlate(summary.lastWeightKg + 2.5);
}

export function detectPersonalRecords(
  completedSets: WorkoutSet[],
  priorSummaries: Map<string, ExercisePerformanceSummary>,
  exerciseNames: Map<string, string>
): PersonalRecordHit[] {
  const hits: PersonalRecordHit[] = [];
  const byExercise = new Map<string, WorkoutSet[]>();

  for (const set of completedSets) {
    if (!set.completed) continue;
    const list = byExercise.get(set.exercise_id) ?? [];
    list.push(set);
    byExercise.set(set.exercise_id, list);
  }

  for (const [exerciseId, sets] of byExercise) {
    const prior = priorSummaries.get(exerciseId);
    const priorBestWeight = prior?.bestWeightKg ?? 0;
    const priorBestE1rm = prior?.bestEstimated1Rm ?? 0;

    const sessionBestWeight = Math.max(...sets.map((s) => s.weight_kg ?? 0));
    const sessionBestE1rm = Math.max(
      ...sets.map((s) => estimateOneRepMax(s.weight_kg ?? 0, s.reps))
    );

    const name = exerciseNames.get(exerciseId) ?? 'Exercise';

    if (sessionBestWeight > 0 && sessionBestWeight > priorBestWeight) {
      hits.push({
        exerciseId,
        exerciseName: name,
        type: 'weight',
        value: sessionBestWeight,
        previousBest: priorBestWeight,
      });
    }

    if (sessionBestE1rm > 0 && sessionBestE1rm > priorBestE1rm + 0.05) {
      hits.push({
        exerciseId,
        exerciseName: name,
        type: 'e1rm',
        value: sessionBestE1rm,
        previousBest: priorBestE1rm,
      });
    }
  }

  return hits;
}

export function formatLastPerformance(summary: ExercisePerformanceSummary | undefined): string | null {
  if (!summary?.lastDate || summary.lastWeightKg == null) return null;
  return `Last: ${summary.lastWeightKg} kg × ${summary.lastReps} reps`;
}
