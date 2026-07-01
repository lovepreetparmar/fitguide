import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MUSCLE_GROUPS } from '@/constants/app';
import { getExerciseDemoUrl } from '@/utils/exerciseMedia';
import type { Exercise, MuscleGroup } from '@/types';

interface ExerciseDemoPlayerProps {
  exercise: Pick<Exercise, 'name' | 'primary_muscle' | 'thumbnail_url' | 'video_url'>;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export function ExerciseDemoPlayer({
  exercise,
  height = 256,
  showLabel = false,
  className = '',
}: ExerciseDemoPlayerProps) {
  const demoUrl = useMemo(() => getExerciseDemoUrl(exercise), [exercise]);
  const [loadFailed, setLoadFailed] = useState(false);
  const muscle = MUSCLE_GROUPS.find((m) => m.id === exercise.primary_muscle);
  const muscleColor = muscle?.color ?? '#6C63FF';

  if (demoUrl && !loadFailed) {
    return (
      <View className={`overflow-hidden bg-card ${className}`} style={{ height }}>
        <Image
          source={{ uri: demoUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
          accessibilityLabel={`${exercise.name} demonstration`}
          onError={() => setLoadFailed(true)}
        />
        {showLabel && (
          <View className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1">
            <Text className="text-xs font-medium text-text-secondary">Form demo</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      className={`items-center justify-center bg-card ${className}`}
      style={{ height }}
      accessibilityLabel={`${exercise.name} — demo unavailable`}
    >
      <View
        className="h-28 w-28 items-center justify-center rounded-3xl"
        style={{ backgroundColor: `${muscleColor}30` }}
      >
        <Ionicons name="body-outline" size={56} color={muscleColor} />
      </View>
      <Text className="mt-3 px-6 text-center text-sm text-text-muted">
        Movement demo coming soon
      </Text>
    </View>
  );
}

export function ExerciseDemoThumbnail({
  exercise,
  size = 56,
  muscleColor = '#6C63FF',
}: {
  exercise: Pick<Exercise, 'name' | 'thumbnail_url' | 'video_url' | 'primary_muscle'>;
  size?: number;
  muscleColor?: string;
}) {
  const demoUrl = getExerciseDemoUrl(exercise);
  const [loadFailed, setLoadFailed] = useState(false);

  if (demoUrl && !loadFailed) {
    return (
      <View
        className="overflow-hidden rounded-button bg-card"
        style={{ width: size, height: size }}
      >
        <Image
          source={{ uri: demoUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={`${exercise.name} preview`}
          onError={() => setLoadFailed(true)}
        />
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center rounded-button"
      style={{ width: size, height: size, backgroundColor: `${muscleColor}20` }}
    >
      <Ionicons name="barbell" size={size * 0.4} color={muscleColor} />
    </View>
  );
}

export function ExerciseDemoLoader({ height = 256 }: { height?: number }) {
  return (
    <View className="items-center justify-center bg-card" style={{ height }}>
      <ActivityIndicator color="#6C63FF" />
    </View>
  );
}

export function muscleColorFor(group: MuscleGroup): string {
  return MUSCLE_GROUPS.find((m) => m.id === group)?.color ?? '#6C63FF';
}
