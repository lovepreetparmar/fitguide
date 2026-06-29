import { supabase, isSupabaseConfigured } from './supabase';
import type { Exercise, ExerciseCategory, MuscleGroup } from '@/types';
import { SAMPLE_EXERCISES } from '@/constants/exercises';

export const exerciseService = {
  async getExercises(filters?: {
    muscle?: MuscleGroup;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    if (!isSupabaseConfigured) {
      return filterLocalExercises(SAMPLE_EXERCISES, filters);
    }

    let query = supabase.from('exercises').select('*').order('name');

    if (filters?.muscle) {
      query = query.or(`primary_muscle.eq.${filters.muscle},secondary_muscles.cs.{${filters.muscle}}`);
    }
    if (filters?.equipment) {
      query = query.contains('equipment', [filters.equipment]);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Exercise[]) ?? [];
  },

  async getExerciseById(id: string): Promise<Exercise | null> {
    if (!isSupabaseConfigured) {
      return SAMPLE_EXERCISES.find((e) => e.id === id) ?? null;
    }

    const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single();
    if (error) return null;
    return data as Exercise;
  },

  async getExerciseBySlug(slug: string): Promise<Exercise | null> {
    if (!isSupabaseConfigured) {
      return SAMPLE_EXERCISES.find((e) => e.slug === slug) ?? null;
    }

    const { data, error } = await supabase.from('exercises').select('*').eq('slug', slug).single();
    if (error) return null;
    return data as Exercise;
  },

  async getCategories(): Promise<ExerciseCategory[]> {
    if (!isSupabaseConfigured) {
      return [
        { id: '1', name: 'Compound', slug: 'compound', icon: 'barbell' },
        { id: '2', name: 'Isolation', slug: 'isolation', icon: 'fitness' },
        { id: '3', name: 'Cardio', slug: 'cardio', icon: 'heart' },
        { id: '4', name: 'Bodyweight', slug: 'bodyweight', icon: 'body' },
        { id: '5', name: 'Stretching', slug: 'stretching', icon: 'expand' },
      ];
    }

    const { data, error } = await supabase.from('exercise_categories').select('*').order('name');
    if (error) throw error;
    return (data as ExerciseCategory[]) ?? [];
  },

  async getExercisesByMuscle(muscle: MuscleGroup): Promise<Exercise[]> {
    return this.getExercises({ muscle });
  },
};

function filterLocalExercises(
  exercises: Exercise[],
  filters?: { muscle?: MuscleGroup; equipment?: string; difficulty?: string; search?: string }
): Exercise[] {
  let result = [...exercises];

  if (filters?.muscle) {
    result = result.filter(
      (e) => e.primary_muscle === filters.muscle || e.secondary_muscles.includes(filters.muscle!)
    );
  }
  if (filters?.equipment) {
    result = result.filter((e) => e.equipment.includes(filters.equipment as Exercise['equipment'][number]));
  }
  if (filters?.difficulty) {
    result = result.filter((e) => e.difficulty === filters.difficulty);
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    result = result.filter((e) => e.name.toLowerCase().includes(search));
  }

  return result;
}
