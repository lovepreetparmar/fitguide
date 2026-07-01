import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ExerciseDemoThumbnail } from '@/components/exercise/ExerciseDemoPlayer';
import type { Exercise } from '@/types';
import { MUSCLE_GROUPS } from '@/constants/app';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const muscleColor =
    MUSCLE_GROUPS.find((m) => m.id === exercise.primary_muscle)?.color ?? '#6C63FF';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3 flex-row items-center">
        <ExerciseDemoThumbnail exercise={exercise} size={56} muscleColor={muscleColor} />
        <View className="flex-1">
          <Text className="text-base font-semibold text-text">{exercise.name}</Text>
          <View className="mt-1 flex-row items-center">
            <View
              className="mr-2 rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${muscleColor}30` }}
            >
              <Text className="text-xs font-medium" style={{ color: muscleColor }}>
                {exercise.primary_muscle}
              </Text>
            </View>
            <Text className="text-xs capitalize text-text-muted">{exercise.difficulty}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      </Card>
    </TouchableOpacity>
  );
}
