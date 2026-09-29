import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ExerciseDemoThumbnail } from '@/components/exercise/ExerciseDemoPlayer';
import type { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  variant?: 'list' | 'grid';
}

const ACCENT = '#0076FC';
const CARD_BACKGROUND = '#111111';
const CARD_BORDER = 'rgba(255,255,255,0.05)';
const SECONDARY_TEXT = '#9CA3AF';

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getExerciseMetadata(exercise: Exercise) {
  const name = exercise.name.toLowerCase();
  const tags = new Set<string>();

  if (
    /bench|squat|deadlift|row|pull-up|pull up|press|dip|lunge|thrust|clean|snatch/.test(name)
  ) {
    tags.add('Compound');
  } else {
    tags.add('Isolation');
  }

  if (/stretch|mobility|rotation|twist|yoga|flow/.test(name)) {
    tags.add('Mobility');
  } else if (/run|bike|jump|burpee|cardio|rope/.test(name)) {
    tags.add('Cardio');
  } else {
    tags.add('Strength');
  }

  if (['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms'].includes(exercise.primary_muscle)) {
    tags.add('Upper Body');
  } else if (['glutes', 'quadriceps', 'hamstrings', 'calves'].includes(exercise.primary_muscle)) {
    tags.add('Lower Body');
  } else {
    tags.add('Core');
  }

  return Array.from(tags).slice(0, 3);
}

export function ExerciseCard({ exercise, onPress, variant = 'list' }: ExerciseCardProps) {
  const equipment = exercise.equipment[0] ? formatLabel(exercise.equipment[0]) : 'Bodyweight';
  const difficulty = formatLabel(exercise.difficulty);
  const metadata = getExerciseMetadata(exercise);
  const isGrid = variant === 'grid';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        marginBottom: 14,
        width: isGrid ? '48.5%' : '100%',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        backgroundColor: CARD_BACKGROUND,
        padding: isGrid ? 12 : 14,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: isGrid ? 0.1 : 0.14,
        shadowRadius: 22,
        elevation: isGrid ? 4 : 6,
      }}
    >
      <LinearGradient
        colors={['rgba(74,163,255,0.18)', 'rgba(0,118,252,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
        }}
      />
      {isGrid ? (
        <View>
          <View
            className="mb-3 overflow-hidden rounded-[20px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <View className="h-[148px] items-center justify-center">
              <ExerciseDemoThumbnail exercise={exercise} size={148} muscleColor={ACCENT} />
            </View>
          </View>
          <Text className="text-base font-semibold text-white" numberOfLines={2}>
            {exercise.name}
          </Text>
          <Text className="mt-1 text-sm text-[#9CA3AF]" numberOfLines={1}>
            {formatLabel(exercise.primary_muscle)} • {equipment}
          </Text>
          <View className="mt-3 flex-row flex-wrap">
            {metadata.slice(0, 2).map((item) => (
              <View
                key={item}
                className="mb-2 mr-2 rounded-full px-2.5 py-1"
                style={{ backgroundColor: 'rgba(0,118,252,0.14)' }}
              >
                <Text className="text-[11px] font-medium text-[#DCEBFF]">{item}</Text>
              </View>
            ))}
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-[#9CA3AF]">{difficulty}</Text>
            <View
              className="rounded-full px-3 py-2"
              style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
            >
              <Text className="text-xs font-semibold text-[#DCEBFF]">Preview</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center">
          <View
            className="mr-4 overflow-hidden rounded-[20px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <View className="h-[96px] w-[96px] items-center justify-center">
              <ExerciseDemoThumbnail exercise={exercise} size={88} muscleColor={ACCENT} />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[17px] font-semibold text-white" numberOfLines={1}>
              {exercise.name}
            </Text>
            <View className="mt-1 flex-row flex-wrap items-center">
              <Text className="text-sm font-medium text-white">{formatLabel(exercise.primary_muscle)}</Text>
              <Text className="mx-2 text-sm text-[#4B5563]">•</Text>
              <Text className="text-sm text-[#9CA3AF]">{equipment}</Text>
              <Text className="mx-2 text-sm text-[#4B5563]">•</Text>
              <Text className="text-sm text-[#9CA3AF]">{difficulty}</Text>
            </View>
            <View className="mt-3 flex-row flex-wrap">
              {metadata.map((item) => (
                <View
                  key={item}
                  className="mb-2 mr-2 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: item === 'Strength' ? 'rgba(0,118,252,0.14)' : 'rgba(255,255,255,0.06)' }}
                >
                  <Text className="text-[11px] font-medium text-[#D1D5DB]">{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <View
            className="ml-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,118,252,0.12)' }}
          >
            <Ionicons name="chevron-forward" size={18} color="#DCEBFF" />
          </View>
        </View>
      )}

      {isGrid ? (
        <View
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <Ionicons name="play" size={14} color="#FFFFFF" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
