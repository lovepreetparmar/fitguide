import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Ellipse, Rect, Circle } from 'react-native-svg';
import { MUSCLE_GROUPS } from '@/constants/app';
import type { MuscleGroup } from '@/types';

interface BodyMapProps {
  onMusclePress: (muscle: MuscleGroup) => void;
  selectedMuscle?: MuscleGroup | null;
  view?: 'front' | 'back';
}

const MUSCLE_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  chest: { x: 55, y: 55, w: 90, h: 30 },
  abs: { x: 65, y: 90, w: 70, h: 40 },
  obliques: { x: 50, y: 90, w: 20, h: 35 },
  shoulders: { x: 30, y: 45, w: 30, h: 25 },
  biceps: { x: 20, y: 75, w: 20, h: 35 },
  forearms: { x: 15, y: 115, w: 18, h: 30 },
  quadriceps: { x: 55, y: 140, w: 35, h: 50 },
  calves: { x: 55, y: 195, w: 30, h: 35 },
  back: { x: 55, y: 55, w: 90, h: 45 },
  triceps: { x: 155, y: 75, w: 20, h: 35 },
  glutes: { x: 55, y: 130, w: 90, h: 30 },
  hamstrings: { x: 55, y: 165, w: 35, h: 40 },
};

export function BodyMap({ onMusclePress, selectedMuscle, view = 'front' }: BodyMapProps) {
  const [activeView, setActiveView] = useState(view);

  const visibleMuscles = activeView === 'front'
    ? ['chest', 'abs', 'obliques', 'shoulders', 'biceps', 'forearms', 'quadriceps', 'calves']
    : ['back', 'triceps', 'glutes', 'hamstrings', 'calves'];

  return (
    <View className="items-center">
      <View className="mb-4 flex-row gap-2">
        <TouchableOpacity
          onPress={() => setActiveView('front')}
          className={`rounded-full px-4 py-2 ${activeView === 'front' ? 'bg-primary' : 'bg-card'}`}
        >
          <Text className={activeView === 'front' ? 'text-white' : 'text-text-secondary'}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveView('back')}
          className={`rounded-full px-4 py-2 ${activeView === 'back' ? 'bg-primary' : 'bg-card'}`}
        >
          <Text className={activeView === 'back' ? 'text-white' : 'text-text-secondary'}>Back</Text>
        </TouchableOpacity>
      </View>

      <View className="relative">
        <Svg width={200} height={280} viewBox="0 0 200 280">
          <Ellipse cx="100" cy="25" rx="22" ry="25" fill="#2A2A2A" />
          <Rect x="70" y="48" width="60" height="80" rx="10" fill="#2A2A2A" />
          <Rect x="25" y="50" width="20" height="70" rx="8" fill="#2A2A2A" />
          <Rect x="155" y="50" width="20" height="70" rx="8" fill="#2A2A2A" />
          <Rect x="70" y="130" width="25" height="80" rx="8" fill="#2A2A2A" />
          <Rect x="105" y="130" width="25" height="80" rx="8" fill="#2A2A2A" />

          {visibleMuscles.map((muscleId) => {
            const pos = MUSCLE_POSITIONS[muscleId];
            if (!pos) return null;
            const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);
            const isSelected = selectedMuscle === muscleId;

            return (
              <Rect
                key={muscleId}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={6}
                fill={isSelected ? (muscle?.color ?? '#6C63FF') : `${muscle?.color ?? '#6C63FF'}60`}
                stroke={isSelected ? '#FFFFFF' : 'transparent'}
                strokeWidth={2}
                onPress={() => onMusclePress(muscleId as MuscleGroup)}
              />
            );
          })}
        </Svg>
      </View>

      {selectedMuscle && (
        <View className="mt-4 rounded-card bg-card px-4 py-2">
          <Text className="text-center text-sm font-semibold capitalize text-primary">
            {selectedMuscle}
          </Text>
        </View>
      )}
    </View>
  );
}
