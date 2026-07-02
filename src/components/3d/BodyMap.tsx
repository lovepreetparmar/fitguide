import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import { MUSCLE_GROUPS } from '@/constants/app';
import type { MuscleGroup } from '@/types';

interface BodyMapProps {
  onMusclePress: (muscle: MuscleGroup) => void;
  selectedMuscle?: MuscleGroup | null;
  view?: 'front' | 'back';
  muscleColors?: Partial<Record<MuscleGroup, string>>;
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

const MAP_WIDTH = 220;
const MAP_HEIGHT = 320;
const ACCENT = '#0076FC';

export function BodyMap({
  onMusclePress,
  selectedMuscle,
  view = 'front',
  muscleColors,
}: BodyMapProps) {
  const [activeView, setActiveView] = useState(view);

  const visibleMuscles = activeView === 'front'
    ? ['chest', 'abs', 'obliques', 'shoulders', 'biceps', 'forearms', 'quadriceps', 'calves']
    : ['back', 'triceps', 'glutes', 'hamstrings', 'calves'];

  return (
    <View className="items-center">
      <View
        className="mb-5 flex-row rounded-full p-1"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveView('front')}
          className="rounded-full px-5 py-2.5"
          style={{
            backgroundColor: activeView === 'front' ? 'rgba(0,118,252,0.95)' : 'transparent',
          }}
          accessibilityRole="button"
          accessibilityLabel="Front view"
        >
          <Text className={activeView === 'front' ? 'font-semibold text-white' : 'font-medium text-[#9CA3AF]'}>
            Front
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveView('back')}
          className="rounded-full px-5 py-2.5"
          style={{
            backgroundColor: activeView === 'back' ? 'rgba(0,118,252,0.95)' : 'transparent',
          }}
          accessibilityRole="button"
          accessibilityLabel="Back view"
        >
          <Text className={activeView === 'back' ? 'font-semibold text-white' : 'font-medium text-[#9CA3AF]'}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="relative overflow-hidden rounded-[32px] px-4 py-5"
        style={{
          width: MAP_WIDTH + 28,
          backgroundColor: '#111111',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.18,
          shadowRadius: 30,
          elevation: 8,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 18,
            left: 32,
            width: 90,
            height: 90,
            borderRadius: 999,
            backgroundColor: 'rgba(0,118,252,0.14)',
          }}
        />
        <View
          className="relative self-center"
          style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        >
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
          <Defs>
            <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#27272A" />
              <Stop offset="100%" stopColor="#171717" />
            </LinearGradient>
            <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#4AA3FF" />
              <Stop offset="100%" stopColor="#0076FC" />
            </LinearGradient>
          </Defs>
          <Ellipse cx="110" cy="28" rx="24" ry="26" fill="url(#bodyGradient)" />
          <Rect x="78" y="56" width="64" height="92" rx="18" fill="url(#bodyGradient)" />
          <Rect x="28" y="60" width="22" height="82" rx="10" fill="url(#bodyGradient)" />
          <Rect x="170" y="60" width="22" height="82" rx="10" fill="url(#bodyGradient)" />
          <Rect x="78" y="150" width="28" height="104" rx="12" fill="url(#bodyGradient)" />
          <Rect x="114" y="150" width="28" height="104" rx="12" fill="url(#bodyGradient)" />

          {visibleMuscles.map((muscleId) => {
            const pos = MUSCLE_POSITIONS[muscleId];
            if (!pos) return null;
            const isSelected = selectedMuscle === muscleId;
            const tone = muscleColors?.[muscleId as MuscleGroup] ?? 'rgba(255,255,255,0.12)';
            const stroke = isSelected ? '#DCEBFF' : `${tone}55`;

            return (
              <Rect
                key={muscleId}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={12}
                fill={isSelected ? 'url(#glowGradient)' : tone}
                opacity={isSelected ? 1 : 0.92}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1}
              />
            );
          })}
        </Svg>

        {visibleMuscles.map((muscleId) => {
          const pos = MUSCLE_POSITIONS[muscleId];
          if (!pos) return null;
          const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);

          return (
            <TouchableOpacity
              key={`touch-${muscleId}`}
              onPress={() => onMusclePress(muscleId as MuscleGroup)}
              accessibilityRole="button"
              accessibilityLabel={`${muscle?.label ?? muscleId} muscle`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: pos.w,
                height: pos.h,
              }}
            />
          );
        })}
        </View>
      </View>

      {selectedMuscle && (
        <View
          className="mt-4 rounded-full px-4 py-2"
          style={{
            backgroundColor: 'rgba(0,118,252,0.14)',
            borderWidth: 1,
            borderColor: 'rgba(74,163,255,0.3)',
          }}
        >
          <Text className="text-center text-sm font-semibold capitalize text-[#DCEBFF]">
            {MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label ?? selectedMuscle}
          </Text>
        </View>
      )}
    </View>
  );
}
