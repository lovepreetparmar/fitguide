import { supabase } from './supabase';
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
import { exerciseService } from './exercises';

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

    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: profile.user_id,
        name: this.generateWorkoutName(profile),
        description: `AI-generated ${workoutLengthMinutes}-minute workout`,
        exercises: workoutExercises,
        estimated_duration_minutes: workoutLengthMinutes,
        difficulty: profile.experience ?? 'intermediate',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...(data as WorkoutPlan),
      exercises: workoutExercises,
    };
  },

  async startSession(userId: string, plan: WorkoutPlan): Promise<WorkoutSession> {
    const { data: sessionRow, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        name: plan.name,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    const sessionId = sessionRow.id as string;
    const setsPayload = plan.exercises.flatMap((ex, exIndex) =>
      Array.from({ length: ex.sets }, (_, setIndex) => ({
        session_id: sessionId,
        exercise_id: ex.exercise_id,
        set_number: setIndex + 1,
        reps: typeof ex.reps === 'number' ? ex.reps : 10,
        weight_kg: ex.weight_kg,
        completed: false,
        rpe: null,
        notes: null,
      }))
    );

    const { data: setRows, error: setsError } = await supabase
      .from('workout_sets')
      .insert(setsPayload)
      .select();

    if (setsError) throw setsError;

    const exerciseById = new Map(plan.exercises.map((ex) => [ex.exercise_id, ex.exercise]));

    const sets: WorkoutSet[] = (setRows ?? []).map((row) => ({
      id: row.id,
      session_id: row.session_id,
      exercise_id: row.exercise_id,
      exercise: exerciseById.get(row.exercise_id),
      set_number: row.set_number,
      reps: row.reps,
      weight_kg: row.weight_kg,
      completed: row.completed,
      rpe: row.rpe,
      notes: row.notes,
    }));

    return {
      id: sessionId,
      user_id: userId,
      plan_id: plan.id,
      name: plan.name,
      started_at: sessionRow.started_at,
      completed_at: null,
      duration_minutes: null,
      calories_burned: null,
      notes: null,
      sets,
    };
  },

  async completeSession(
    sessionId: string,
    sets: WorkoutSet[],
    startedAt?: string
  ): Promise<WorkoutSession> {
    const completedSets = sets.filter((s) => s.completed);
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * s.reps,
      0
    );

    const startTime = startedAt ? new Date(startedAt).getTime() : Date.now();
    const updates = {
      completed_at: new Date().toISOString(),
      duration_minutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      calories_burned: Math.round(totalVolume * 0.05),
    };

    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    for (const set of completedSets) {
      await this.saveSet(set);
    }

    return { ...(data as WorkoutSession), sets };
  },

  async getRecentSessions(userId: string, limit = 20): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data as WorkoutSession[]) ?? [];
  },

  async saveSet(set: WorkoutSet): Promise<void> {
    const { error } = await supabase.from('workout_sets').upsert({
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

    if (error) throw error;
  },

  async selectExercises(
    profile: Profile,
    recovery: RecoveryData[],
    durationMinutes: number
  ): Promise<Exercise[]> {
    const allExercises = await exerciseService.getExercises();

    const fatiguedMuscles = new Set(
      recovery.filter((r) => r.status === 'needs_rest').map((r) => r.muscle_group)
    );

    let available = allExercises.filter((ex) => {
      const hasEquipment = ex.equipment.some((eq) => profile.equipment.includes(eq));
      const muscleRecovered = !fatiguedMuscles.has(ex.primary_muscle);
      return hasEquipment && muscleRecovered;
    });

    if (available.length < 4) {
      available = allExercises.filter((ex) =>
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

  async getExerciseHistory(userId: string, exerciseId: string) {
    const { data, error } = await supabase
      .from('workout_sets')
      .select('*, workout_sessions!inner(id, name, completed_at, started_at, user_id)')
      .eq('exercise_id', exerciseId)
      .eq('completed', true)
      .eq('workout_sessions.user_id', userId)
      .order('set_number', { ascending: true });

    if (error) return [];

    return (data ?? []).map((row) => ({
      sessionId: row.workout_sessions.id,
      sessionName: row.workout_sessions.name,
      date: row.workout_sessions.completed_at ?? row.workout_sessions.started_at,
      set: {
        id: row.id,
        session_id: row.session_id,
        exercise_id: row.exercise_id,
        set_number: row.set_number,
        reps: row.reps,
        weight_kg: row.weight_kg,
        completed: row.completed,
        rpe: row.rpe,
        notes: row.notes,
      },
    }));
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
