import type { AIRecommendation, Profile, RecoveryData, WorkoutSession } from '@/types';
import { recoveryService } from './progress';

interface CoachContext {
  profile: Profile;
  recovery: RecoveryData[];
  recentWorkouts: WorkoutSession[];
  streak: number;
  lastChestWorkout?: string;
}

export const aiCoachService = {
  generateRecommendations(context: CoachContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const { profile, recovery, recentWorkouts, streak } = context;

    const overallRecovery = recoveryService.getOverallRecoveryScore(recovery);

    if (overallRecovery < 60) {
      recommendations.push({
        id: 'rec_recovery_low',
        type: 'recovery',
        title: 'Recovery Alert',
        message: `Your recovery score is ${overallRecovery}%. Consider reducing volume today or focusing on mobility work.`,
        priority: 'high',
        action_label: 'View Recovery',
        action_route: '/(tabs)/progress',
      });
    }

    const fatiguedMuscles = recovery.filter((r) => r.status === 'needs_rest');
    if (fatiguedMuscles.length > 0) {
      recommendations.push({
        id: 'rec_muscle_rest',
        type: 'recovery',
        title: 'Muscles Need Rest',
        message: `Your ${fatiguedMuscles.map((m) => m.muscle_group).join(', ')} need more recovery time. Train other muscle groups today.`,
        priority: 'medium',
      });
    }

    if (streak >= 7) {
      recommendations.push({
        id: 'rec_streak',
        type: 'motivation',
        title: 'Great Streak!',
        message: `You're on a ${streak}-day workout streak. Keep the momentum going!`,
        priority: 'low',
      });
    }

    if (recentWorkouts.length === 0) {
      recommendations.push({
        id: 'rec_first_workout',
        type: 'workout',
        title: 'Ready to Train?',
        message: "You haven't logged a workout yet. Let's get started with a personalized session!",
        priority: 'high',
        action_label: 'Start Workout',
        action_route: '/(tabs)/workout',
      });
    }

    const daysSinceLastWorkout = recentWorkouts[0]
      ? Math.floor(
          (Date.now() - new Date(recentWorkouts[0].started_at).getTime()) / 86400000
        )
      : 999;

    if (daysSinceLastWorkout >= 3 && daysSinceLastWorkout < 999) {
      recommendations.push({
        id: 'rec_inactive',
        type: 'motivation',
        title: 'Time to Move',
        message: `It's been ${daysSinceLastWorkout} days since your last workout. Your body is ready — let's go!`,
        priority: 'medium',
        action_label: 'Quick Start',
        action_route: '/(tabs)/workout',
      });
    }

    if (profile.goal === 'build_muscle') {
      recommendations.push({
        id: 'rec_hypertrophy',
        type: 'workout',
        title: 'Hypertrophy Tip',
        message: 'Aim for 8-12 reps with 60-90 seconds rest for optimal muscle growth.',
        priority: 'low',
      });
    }

    if (profile.goal === 'get_stronger') {
      recommendations.push({
        id: 'rec_strength',
        type: 'workout',
        title: 'Strength Tip',
        message: 'Focus on compound movements with 3-5 reps and 3-5 minute rest periods.',
        priority: 'low',
      });
    }

    return recommendations.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  },

  generateWeeklySummary(context: CoachContext): string {
    const { recentWorkouts, streak, profile } = context;
    const workoutCount = recentWorkouts.length;
    const totalVolume = recentWorkouts.reduce((sum, w) => {
      return sum + (w.sets?.reduce((s, set) => s + (set.weight_kg ?? 0) * set.reps, 0) ?? 0);
    }, 0);

    return `Weekly Summary for ${profile.name}:

You completed ${workoutCount} workout${workoutCount !== 1 ? 's' : ''} this week with a total volume of ${Math.round(totalVolume)}kg. Your current streak is ${streak} day${streak !== 1 ? 's' : ''}.

${workoutCount >= (profile.workout_days ?? 3) ? 'Excellent work hitting your weekly goal!' : `You're ${(profile.workout_days ?? 3) - workoutCount} workout${(profile.workout_days ?? 3) - workoutCount !== 1 ? 's' : ''} away from your weekly target.`}

Keep pushing toward your ${profile.goal?.replace('_', ' ') ?? 'fitness'} goal!`;
  },

  generateExerciseRecommendation(
    exerciseName: string,
    currentWeight: number,
    lastReps: number,
    targetReps: number
  ): string {
    if (lastReps >= targetReps + 2) {
      const increase = exerciseName.toLowerCase().includes('dumbbell') ? 2 : 2.5;
      return `Great work! Increase ${exerciseName} by ${increase} kg next session.`;
    }
    if (lastReps < targetReps - 2) {
      return `Consider reducing weight on ${exerciseName} by 2.5 kg to maintain proper form.`;
    }
    return `Maintain ${currentWeight} kg on ${exerciseName}. Focus on controlled reps.`;
  },
};
