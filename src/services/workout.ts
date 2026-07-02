import { supabase, isSupabaseConfigured } from './supabase';
import { SAMPLE_EXERCISES } from '@/constants/exercises';
import type {
  Difficulty,
  Equipment,
  Exercise,
  Profile,
  RecoveryData,
  WorkoutExercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSet,
} from '@/types';
import { exerciseService } from './exercises';
import { getStartOfTodayIso } from '@/utils/workoutPlan';

interface GenerateWorkoutParams {
  profile: Profile;
  recovery: RecoveryData[];
  workoutLengthMinutes: number;
  focus?: string;
  workoutLevel?: Difficulty;
  equipment?: Equipment[];
  previousWorkouts?: WorkoutSession[];
}

function matchesWorkoutLevel(exerciseDifficulty: Difficulty, level: Difficulty) {
  const order: Record<Difficulty, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };

  return order[exerciseDifficulty] <= order[level];
}

function shouldPersistWorkoutsRemotely(userId: string) {
  return isSupabaseConfigured && userId !== 'guest';
}

function buildLocalWorkoutPlan(
  profile: Profile,
  workoutExercises: WorkoutExercise[],
  workoutLengthMinutes: number,
  level: Difficulty,
  name: string
): WorkoutPlan {
  return {
    id: `local_plan_${Date.now()}`,
    user_id: profile.user_id,
    name,
    description: `AI-generated ${workoutLengthMinutes}-minute workout`,
    exercises: workoutExercises,
    estimated_duration_minutes: workoutLengthMinutes,
    difficulty: level,
    created_at: new Date().toISOString(),
  };
}

function buildLocalWorkoutSession(userId: string, plan: WorkoutPlan): WorkoutSession {
  const sessionId = `local_session_${Date.now()}`;
  const startedAt = new Date().toISOString();
  const exerciseById = new Map(plan.exercises.map((exercise) => [exercise.exercise_id, exercise.exercise]));

  const sets: WorkoutSet[] = plan.exercises.flatMap((exercise) =>
    Array.from({ length: exercise.sets }, (_, setIndex) => ({
      id: `${sessionId}_${exercise.exercise_id}_${setIndex + 1}`,
      session_id: sessionId,
      exercise_id: exercise.exercise_id,
      exercise: exerciseById.get(exercise.exercise_id),
      set_number: setIndex + 1,
      reps: typeof exercise.reps === 'number' ? exercise.reps : 10,
      weight_kg: exercise.weight_kg,
      completed: false,
      rpe: null,
      notes: null,
    }))
  );

  return {
    id: sessionId,
    user_id: userId,
    plan_id: plan.id,
    name: plan.name,
    started_at: startedAt,
    completed_at: null,
    duration_minutes: null,
    calories_burned: null,
    notes: null,
    sets,
  };
}

export const workoutService = {
  async generateWorkout(params: GenerateWorkoutParams): Promise<WorkoutPlan> {
    const { profile, recovery, workoutLengthMinutes, focus, workoutLevel, equipment } = params;
    const level = workoutLevel ?? profile.experience ?? 'intermediate';
    const availableEquipment = equipment?.length ? equipment : profile.equipment;
    const exercises = await this.selectExercises(
      profile,
      recovery,
      workoutLengthMinutes,
      focus,
      level,
      availableEquipment
    );
    const workoutExercises = this.buildWorkoutExercises(exercises, profile, level);

    if (!workoutExercises.length) {
      throw new Error('No exercises matched your filters. Try different equipment, type, or level.');
    }

    const planName = this.generateWorkoutName(profile, focus);
    const localPlan = buildLocalWorkoutPlan(
      profile,
      workoutExercises,
      workoutLengthMinutes,
      level,
      planName
    );

    if (!shouldPersistWorkoutsRemotely(profile.user_id)) {
      return localPlan;
    }

    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: profile.user_id,
        name: localPlan.name,
        description: localPlan.description,
        exercises: workoutExercises,
        estimated_duration_minutes: workoutLengthMinutes,
        difficulty: level,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to save workout plan to your account.');
    }

    return {
      ...(data as WorkoutPlan),
      exercises: workoutExercises,
    };
  },

  async getTodaysPlan(userId: string): Promise<WorkoutPlan | null> {
    if (!shouldPersistWorkoutsRemotely(userId)) return null;

    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', getStartOfTodayIso())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const plan = data as WorkoutPlan;
    const exercises = await this.hydrateWorkoutExercises(plan.exercises ?? []);

    return { ...plan, exercises };
  },

  async hydrateWorkoutExercises(exercises: WorkoutExercise[]): Promise<WorkoutExercise[]> {
    return Promise.all(
      exercises.map(async (item) => {
        if (item.exercise) return item;

        const exercise = await exerciseService.getExerciseById(item.exercise_id);
        return { ...item, exercise: exercise ?? undefined };
      })
    );
  },

  async startSession(userId: string, plan: WorkoutPlan): Promise<WorkoutSession> {
    const localSession = buildLocalWorkoutSession(userId, plan);

    if (!shouldPersistWorkoutsRemotely(userId)) {
      return localSession;
    }

    const { data: sessionRow, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        plan_id: plan.id.startsWith('local_plan_') ? null : plan.id,
        name: plan.name,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(sessionError.message || 'Failed to start workout session.');
    }

    const sessionId = sessionRow.id as string;
    const setsPayload = plan.exercises.flatMap((ex) =>
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

    if (setsError) {
      throw new Error(setsError.message || 'Failed to save workout sets.');
    }

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

  async completeSession(session: WorkoutSession): Promise<WorkoutSession> {
    const completedSets = session.sets.filter((s) => s.completed);
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * s.reps,
      0
    );

    const startTime = session.started_at ? new Date(session.started_at).getTime() : Date.now();
    const updates = {
      completed_at: new Date().toISOString(),
      duration_minutes:
        session.duration_minutes ??
        Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      calories_burned: Math.round(totalVolume * 0.05),
    };

    const completedSession: WorkoutSession = {
      ...session,
      ...updates,
      sets: session.sets,
    };

    if (
      !shouldPersistWorkoutsRemotely(session.user_id) ||
      session.id.startsWith('local_session_')
    ) {
      return completedSession;
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;

    for (const set of completedSets) {
      await this.saveSet(set);
    }

    return { ...(data as WorkoutSession), sets: session.sets };
  },

  async abandonSession(userId: string, sessionId: string): Promise<void> {
    if (!shouldPersistWorkoutsRemotely(userId)) return;
    if (sessionId.startsWith('local_session_')) return;

    await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('completed_at', null);
  },

  async getRecentSessions(userId: string, limit = 24): Promise<WorkoutSession[]> {
    if (!shouldPersistWorkoutsRemotely(userId)) return [];

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        `
        *,
        workout_sets (
          id,
          session_id,
          exercise_id,
          set_number,
          reps,
          weight_kg,
          completed,
          rpe,
          notes,
          exercises (
            id,
            name,
            slug,
            primary_muscle,
            secondary_muscles,
            difficulty,
            equipment
          )
        )
      `
      )
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row) => {
      const session = row as WorkoutSession & {
        workout_sets?: Array<
          WorkoutSet & {
            exercises?: WorkoutSet['exercise'];
          }
        >;
      };

      const sets: WorkoutSet[] = (session.workout_sets ?? []).map((setRow) => ({
        id: setRow.id,
        session_id: setRow.session_id,
        exercise_id: setRow.exercise_id,
        exercise: setRow.exercises ?? undefined,
        set_number: setRow.set_number,
        reps: setRow.reps,
        weight_kg: setRow.weight_kg,
        completed: setRow.completed,
        rpe: setRow.rpe,
        notes: setRow.notes,
      }));

      return {
        id: session.id,
        user_id: session.user_id,
        plan_id: session.plan_id,
        name: session.name,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_minutes: session.duration_minutes,
        calories_burned: session.calories_burned,
        notes: session.notes,
        sets,
      };
    });
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
    durationMinutes: number,
    focus?: string,
    level: Difficulty = 'intermediate',
    equipment: Equipment[] = profile.equipment
  ): Promise<Exercise[]> {
    let allExercises: Exercise[];

    try {
      allExercises = await exerciseService.getExercises();
    } catch {
      allExercises = SAMPLE_EXERCISES;
    }

    const fatiguedMuscles = new Set(
      recovery.filter((r) => r.status === 'needs_rest').map((r) => r.muscle_group)
    );

    let available = allExercises.filter((ex) => {
      const hasEquipment = ex.equipment.some((eq) => equipment.includes(eq));
      const muscleRecovered = !fatiguedMuscles.has(ex.primary_muscle);
      const matchesLevel = matchesWorkoutLevel(ex.difficulty, level);
      return hasEquipment && muscleRecovered && matchesLevel;
    });

    if (available.length < 4) {
      available = allExercises.filter(
        (ex) =>
          ex.equipment.some((eq) => equipment.includes(eq)) &&
          matchesWorkoutLevel(ex.difficulty, level)
      );
    }

    const focusMuscles = getFocusMuscles(focus);
    if (focusMuscles?.length) {
      const prioritized = available.filter((ex) => focusMuscles.includes(ex.primary_muscle));
      const secondary = available.filter((ex) => !focusMuscles.includes(ex.primary_muscle));
      available = prioritized.length >= 3 ? [...prioritized, ...secondary] : available;
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

    if (selected.length < exerciseCount) {
      for (const ex of shuffle(available)) {
        if (selected.length >= exerciseCount) break;
        if (!selected.some((item) => item.id === ex.id)) {
          selected.push(ex);
        }
      }
    }

    if (!selected.length) {
      return shuffle(
        allExercises.filter(
          (exercise) =>
            exercise.equipment.some((item) => equipment.includes(item)) &&
            matchesWorkoutLevel(exercise.difficulty, level)
        )
      ).slice(0, Math.max(4, Math.min(Math.floor(durationMinutes / 8), 8)));
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

  buildWorkoutExercises(exercises: Exercise[], profile: Profile, level: Difficulty): WorkoutExercise[] {
    const experienceSets: Record<Difficulty, number> = {
      beginner: 3,
      intermediate: 4,
      advanced: 5,
    };

    const sets = experienceSets[level];

    return exercises.map((exercise, index) => ({
      exercise_id: exercise.id,
      exercise,
      sets,
      reps: level === 'beginner' ? 12 : level === 'advanced' ? 6 : 10,
      weight_kg: this.estimateWeight(exercise, profile, level),
      rest_seconds: exercise.secondary_muscles.length >= 2 ? 120 : 90,
      notes: null,
      order: index,
    }));
  },

  estimateWeight(exercise: Exercise, profile: Profile, level: Difficulty): number | null {
    if (exercise.equipment.includes('bodyweight')) return null;
    const baseWeight = (profile.weight_kg ?? 70) * 0.3;
    const experienceMultiplier = level === 'beginner' ? 0.6 : level === 'advanced' ? 1.2 : 1;
    return Math.round(baseWeight * experienceMultiplier * 2) / 2;
  },

  generateWorkoutName(profile: Profile, focus?: string): string {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const goalNames: Record<string, string> = {
      build_muscle: 'Hypertrophy',
      get_stronger: 'Strength',
      lose_weight: 'Fat Burn',
      improve_endurance: 'Endurance',
      general_fitness: 'Full Body',
      athletic_performance: 'Performance',
    };
    const focusLabel = focus && focus !== 'Full Body' && focus !== 'Custom' ? focus : null;
    return `${focusLabel ?? goalNames[profile.goal ?? 'general_fitness']} — ${day}`;
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

function getFocusMuscles(focus?: string): Exercise['primary_muscle'][] | null {
  const focusMap: Record<string, Exercise['primary_muscle'][]> = {
    Push: ['chest', 'shoulders', 'triceps'],
    Pull: ['back', 'biceps', 'forearms'],
    Legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    Upper: ['chest', 'back', 'shoulders', 'triceps', 'biceps', 'forearms'],
    Lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    'Full Body': [],
    Arms: ['biceps', 'triceps', 'forearms'],
    Chest: ['chest'],
    Back: ['back'],
    Shoulders: ['shoulders'],
    Custom: [],
  };

  return focus ? (focusMap[focus] ?? null) : null;
}
