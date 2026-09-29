import {
  detectPersonalRecords,
  estimateOneRepMax,
  roundToPlate,
  summarizeExerciseHistory,
  suggestWorkingWeight,
} from '../progression';
import type { Profile } from '@/types';

const baseProfile: Profile = {
  id: 'p1',
  user_id: 'u1',
  name: 'Test',
  age: 30,
  height_cm: 180,
  weight_kg: 80,
  gender: 'male',
  goal: 'build_muscle',
  experience: 'intermediate',
  workout_days: 4,
  workout_time_minutes: 60,
  equipment: ['barbell'],
  medical_limitations: null,
  previous_injuries: null,
  avatar_url: null,
  units: 'metric',
  onboarding_completed: true,
  created_at: '',
  updated_at: '',
};

describe('progression', () => {
  it('estimates 1RM', () => {
    expect(estimateOneRepMax(100, 5)).toBeGreaterThan(100);
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('rounds to plate increment', () => {
    expect(roundToPlate(82.3)).toBe(82.5);
  });

  it('summarizes history', () => {
    const summary = summarizeExerciseHistory([
      {
        date: '2026-01-01',
        set: { reps: 8, weight_kg: 60, set_number: 1, rpe: null },
      },
      {
        date: '2026-02-01',
        set: { reps: 10, weight_kg: 62.5, set_number: 1, rpe: null },
      },
    ]);
    expect(summary.lastWeightKg).toBe(62.5);
    expect(summary.bestWeightKg).toBe(62.5);
  });

  it('suggests progressive overload for hypertrophy', () => {
    const summary = summarizeExerciseHistory([
      {
        date: '2026-02-01',
        set: { reps: 10, weight_kg: 60, set_number: 1, rpe: null },
      },
    ]);
    expect(suggestWorkingWeight(summary, baseProfile, 50)).toBe(62.5);
  });

  it('detects weight PR', () => {
    const prior = new Map([
      [
        'ex1',
        summarizeExerciseHistory([
          {
            date: '2026-01-01',
            set: { reps: 8, weight_kg: 50, set_number: 1, rpe: null },
          },
        ]),
      ],
    ]);
    const hits = detectPersonalRecords(
      [
        {
          id: '1',
          session_id: 's',
          exercise_id: 'ex1',
          set_number: 1,
          reps: 8,
          weight_kg: 55,
          completed: true,
          rpe: null,
          notes: null,
        },
      ],
      prior,
      new Map([['ex1', 'Bench']])
    );
    expect(hits.some((h) => h.type === 'weight')).toBe(true);
  });
});
