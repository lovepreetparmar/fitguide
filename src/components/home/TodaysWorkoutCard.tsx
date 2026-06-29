import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WorkoutPlan } from '@/types';
import { formatDuration } from '@/utils/format';

interface TodaysWorkoutCardProps {
  plan: WorkoutPlan | null;
  onStart: () => void;
  onGenerate: () => void;
  loading?: boolean;
}

export function TodaysWorkoutCard({ plan, onStart, onGenerate, loading }: TodaysWorkoutCardProps) {
  if (!plan) {
    return (
      <Card className="mb-4">
        <View className="items-center py-4">
          <Ionicons name="barbell-outline" size={48} color="#6C63FF" />
          <Text className="mt-3 text-lg font-semibold text-text">No Workout Planned</Text>
          <Text className="mt-1 text-center text-sm text-text-secondary">
            Generate a personalized workout based on your goals and recovery
          </Text>
          <Button
            title="Generate Workout"
            onPress={onGenerate}
            loading={loading}
            className="mt-4"
          />
        </View>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
            Today's Workout
          </Text>
          <Text className="mt-1 text-lg font-bold text-text">{plan.name}</Text>
        </View>
        <View className="rounded-full bg-primary/20 px-3 py-1">
          <Text className="text-sm font-medium text-primary">
            {formatDuration(plan.estimated_duration_minutes)}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        {plan.exercises.slice(0, 3).map((ex, i) => (
          <View key={ex.exercise_id} className="flex-row items-center py-2">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-border">
              <Text className="text-xs font-bold text-text-secondary">{i + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text">
                {ex.exercise?.name ?? 'Exercise'}
              </Text>
              <Text className="text-xs text-text-secondary">
                {ex.sets} sets × {ex.reps} reps
              </Text>
            </View>
          </View>
        ))}
        {plan.exercises.length > 3 && (
          <Text className="mt-1 text-xs text-text-muted">
            +{plan.exercises.length - 3} more exercises
          </Text>
        )}
      </View>

      <Button title="Start Workout" onPress={onStart} fullWidth icon={
        <Ionicons name="play" size={18} color="#FFFFFF" />
      } />
    </Card>
  );
}
