import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Difficulty,
  Exercise,
  Profile,
  RecoveryData,
  WorkoutExercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSet,
} from '@/types';
import { SAMPLE_EXERCISES } from '@/constants/exercises';

interface GenerateWorkoutParams {
  profile: Profile;
  recovery: RecoveryData[];
  workoutLengthMinutes: number;
  previousWorkouts?: WorkoutSession[];
}

export const workoutService = {
  async generateWorkout(params: GenerateWorkoutParams): Promise<WorkoutPlan> {
    const { profile, recovery, workoutLengthMinutes } = params;
    const exercises = await this.selectExercises(profile, recovery, workoutLengthMinutes);
    const workoutExercises = this.buildWorkoutExercises(exercises, profile);

    const plan: WorkoutPlan = {
      id: `plan_${Date.now()}`,
      user_id: profile.user_id,
      name: this.generateWorkoutName(profile),
      description: `AI-generated ${workoutLengthMinutes}-minute workout`,
      exercises: workoutExercises,
      estimated_duration_minutes: workoutLengthMinutes,
      difficulty: profile.experience ?? 'intermediate',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workout_plans').insert(plan).select().single();
      if (!error && data) return data as WorkoutPlan;
    }

    return plan;
  },

  async startSession(userId: string, plan: WorkoutPlan): Promise<WorkoutSession> {
    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      user_id: userId,
      plan_id: plan.id,
      name: plan.name,
      started_at: new Date().toISOString(),
      completed_at: null,
      duration_minutes: null,
      calories_burned: null,
      notes: null,
      sets: plan.exercises.flatMap((ex, exIndex) =>
        Array.from({ length: ex.sets }, (_, setIndex) => ({
          id: `set_${Date.now()}_${exIndex}_${setIndex}`,
          session_id: `session_${Date.now()}`,
          exercise_id: ex.exercise_id,
          exercise: ex.exercise,
          set_number: setIndex + 1,
          reps: typeof ex.reps === 'number' ? ex.reps : 10,
          weight_kg: ex.weight_kg,
          completed: false,
          rpe: null,
          notes: null,
        }))
      ),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workout_sessions').insert({
        user_id: session.user_id,
        plan_id: session.plan_id,
        name: session.name,
        started_at: session.started_at,
      }).select().single();
      if (!error && data) {
        session.id = data.id;
      }
    }

    return session;
  },

  async completeSession(sessionId: string, sets: WorkoutSet[]): Promise<WorkoutSession> {
    const completedSets = sets.filter((s) => s.completed);
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * s.reps,
      0
    );

    const updates = {
      completed_at: new Date().toISOString(),
      duration_minutes: Math.round(
        (Date.now() - new Date(sets[0]?.session_id ? Date.now() : Date.now()).getTime()) / 60000
      ),
      calories_burned: Math.round(totalVolume * 0.05),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      if (!error && data) return { ...data, sets } as WorkoutSession;
    }

    return {
      id: sessionId,
      user_id: '',
      plan_id: null,
      name: 'Workout',
      started_at: new Date().toISOString(),
      completed_at: updates.completed_at,
      duration_minutes: updates.duration_minutes,
      calories_burned: updates.calories_burned,
      notes: null,
      sets,
    };
  },

  async getRecentSessions(userId: string, limit = 5): Promise<WorkoutSession[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data as WorkoutSession[]) ?? [];
  },

  async saveSet(set: WorkoutSet): Promise<void> {
    if (!isSupabaseConfigured) return;

    await supabase.from('workout_sets').upsert({
      id: set.id,
      session_id: set.session_id,
      exercise_id: set.exercise_id,
      set_number: set.set_number,
      reps: set.reps,
      weight_kg: set.weight_kg,
      completed: set.completed,
      rpe: set.rpe,
      notes: set.notes,
    });
  },

  selectExercises(
    profile: Profile,
    recovery: RecoveryData[],
    durationMinutes: number
  ): Exercise[] {
    const fatiguedMuscles = new Set(
      recovery.filter((r) => r.status === 'needs_rest').map((r) => r.muscle_group)
    );

    let available = SAMPLE_EXERCISES.filter((ex) => {
      const hasEquipment = ex.equipment.some((eq) => profile.equipment.includes(eq));
      const muscleRecovered = !fatiguedMuscles.has(ex.primary_muscle);
      return hasEquipment && muscleRecovered;
    });

    if (available.length < 4) {
      available = SAMPLE_EXERCISES.filter((ex) =>
        ex.equipment.some((eq) => profile.equipment.includes(eq))
      );
    }

    const compound = available.filter((e) => e.secondary_muscles.length >= 2);
    const isolation = available.filter((e) => e.secondary_muscles.length < 2);

    const exerciseCount = Math.min(Math.floor(durationMinutes / 8), 8);
    const compoundCount = Math.ceil(exerciseCount * 0.6);

    const selected: Exercise[] = [];
    const usedMuscles = new Set<string>();

    for (const ex of shuffle(compound)) {
      if (selected.length >= compoundCount) break;
      if (!usedMuscles.has(ex.primary_muscle)) {
        selected.push(ex);
        usedMuscles.add(ex.primary_muscle);
      }
    }

    for (const ex of shuffle(isolation)) {
      if (selected.length >= exerciseCount) break;
      if (!usedMuscles.has(ex.primary_muscle)) {
        selected.push(ex);
        usedMuscles.add(ex.primary_muscle);
      }
    }

    return selected;
  },

  buildWorkoutExercises(exercises: Exercise[], profile: Profile): WorkoutExercise[] {
    const experienceSets: Record<Difficulty, number> = {
      beginner: 3,
      intermediate: 4,
      advanced: 5,
    };

    const sets = experienceSets[profile.experience ?? 'intermediate'];

    return exercises.map((exercise, index) => ({
      exercise_id: exercise.id,
      exercise,
      sets,
      reps: profile.experience === 'beginner' ? 12 : profile.experience === 'advanced' ? 6 : 10,
      weight_kg: this.estimateWeight(exercise, profile),
      rest_seconds: exercise.secondary_muscles.length >= 2 ? 120 : 90,
      notes: null,
      order: index,
    }));
  },

  estimateWeight(exercise: Exercise, profile: Profile): number | null {
    if (exercise.equipment.includes('bodyweight')) return null;
    const baseWeight = (profile.weight_kg ?? 70) * 0.3;
    const experienceMultiplier =
      profile.experience === 'beginner' ? 0.6 : profile.experience === 'advanced' ? 1.2 : 1;
    return Math.round(baseWeight * experienceMultiplier * 2) / 2;
  },

  generateWorkoutName(profile: Profile): string {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const goalNames: Record<string, string> = {
      build_muscle: 'Hypertrophy',
      get_stronger: 'Strength',
      lose_weight: 'Fat Burn',
      improve_endurance: 'Endurance',
      general_fitness: 'Full Body',
      athletic_performance: 'Performance',
    };
    return `${goalNames[profile.goal ?? 'general_fitness']} — ${day}`;
  },
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
