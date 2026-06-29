import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '@/services/exercises';
import { workoutService } from '@/services/workout';
import { recoveryService, progressService } from '@/services/progress';
import { nutritionService } from '@/services/nutrition';
import type { MuscleGroup } from '@/types';

export function useExercises(filters?: {
  muscle?: MuscleGroup;
  search?: string;
}) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => exerciseService.getExercises(filters),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseService.getExerciseById(id),
    enabled: !!id,
  });
}

export function useRecovery(userId: string) {
  return useQuery({
    queryKey: ['recovery', userId],
    queryFn: () => recoveryService.getRecoveryData(userId),
    enabled: !!userId,
  });
}

export function useProgress(userId: string, period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['progress', userId, period],
    queryFn: () => progressService.getProgress(userId, period),
    enabled: !!userId,
  });
}

export function useNutrition(userId: string) {
  return useQuery({
    queryKey: ['nutrition', userId],
    queryFn: () => nutritionService.getTodayLog(userId),
    enabled: !!userId,
  });
}

export function useLogWater(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountMl: number) => nutritionService.logWater(userId, amountMl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', userId] });
    },
  });
}
