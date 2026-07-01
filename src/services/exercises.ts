import { supabase } from './supabase';
import type { Exercise, ExerciseCategory, MuscleGroup } from '@/types';

export const exerciseService = {
  async getExercises(filters?: {
    muscle?: MuscleGroup;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
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
    if (error) {
      throw new Error(
        error.code === '42P01' || error.code === 'PGRST205'
          ? 'Exercise library not set up. Run database/setup_supabase.sql in Supabase SQL Editor.'
          : error.message
      );
    }
    if (!data?.length) {
      throw new Error('No exercises in database. Run database/setup_supabase.sql in Supabase SQL Editor.');
    }
    return data as Exercise[];
  },

  async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data as Exercise | null;
  },

  async getExerciseBySlug(slug: string): Promise<Exercise | null> {
    const { data, error } = await supabase.from('exercises').select('*').eq('slug', slug).maybeSingle();
    if (error) return null;
    return data as Exercise | null;
  },

  async getCategories(): Promise<ExerciseCategory[]> {
    const { data, error } = await supabase.from('exercise_categories').select('*').order('name');
    if (error) throw error;
    return (data as ExerciseCategory[]) ?? [];
  },

  async getExercisesByMuscle(muscle: MuscleGroup): Promise<Exercise[]> {
    return this.getExercises({ muscle });
  },
};
