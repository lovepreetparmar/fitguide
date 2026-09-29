import { computeStreakFromWorkoutDates } from '../engagement';

describe('computeStreakFromWorkoutDates', () => {
  it('returns zero for empty dates', () => {
    expect(computeStreakFromWorkoutDates([])).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
    });
  });

  it('counts consecutive days in longest streak', () => {
    const result = computeStreakFromWorkoutDates([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-10',
    ]);
    expect(result.longestStreak).toBe(3);
  });
});
