import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const chipShadow = {
  shadowColor: '#6C63FF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
};

function FloatingChip({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: object;
}) {
  return (
    <View
      className={`rounded-2xl border border-white/10 bg-card/95 px-2.5 py-2 ${className ?? ''}`}
      style={[chipShadow, style]}
    >
      {children}
    </View>
  );
}

function CalorieRing() {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.65;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2A2A2A"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6C63FF"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-[10px] font-bold text-text">420</Text>
      <Text className="text-[8px] text-text-muted">kcal</Text>
    </View>
  );
}

export function AuthLandingHero() {
  return (
    <View className="relative mb-2 h-[268px] w-full items-center justify-center">
      <FloatingChip
        className="absolute left-0 top-[58%] z-20"
        style={{ transform: [{ rotate: '-4deg' }] }}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="walk-outline" size={14} color="#6C63FF" />
          <View>
            <Text className="text-[9px] font-semibold text-text">7,532</Text>
            <Text className="text-[8px] text-text-muted">Steps</Text>
          </View>
        </View>
      </FloatingChip>

      <FloatingChip
        className="absolute right-0 top-[8%] z-20"
        style={{ transform: [{ rotate: '3deg' }] }}
      >
        <View className="flex-row items-center gap-1">
          <Ionicons name="flame" size={14} color="#F59E0B" />
          <Text className="text-[10px] font-semibold text-text">420 kcal</Text>
        </View>
      </FloatingChip>

      <View
        className="absolute right-1 top-[38%] z-20 h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-card"
        style={[chipShadow, { transform: [{ rotate: '6deg' }] }]}
      >
        <Ionicons name="restaurant" size={18} color="#EC4899" />
      </View>

      <FloatingChip
        className="absolute -right-1 bottom-[18%] z-20"
        style={{ transform: [{ rotate: '-2deg' }] }}
      >
        <View className="flex-row items-center gap-1">
          <Ionicons name="trending-up" size={14} color="#22C55E" />
          <Text className="text-[9px] font-semibold text-success">+12%</Text>
        </View>
        <Text className="text-[8px] text-text-muted">This Week</Text>
      </FloatingChip>

      <View
        className="z-10 w-[152px] rounded-3xl border border-white/10 bg-card p-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold text-text">Today</Text>
          <Text className="text-[8px] text-text-muted">Sat, 28 Sep</Text>
        </View>

        <View className="mb-2 flex-row items-center gap-2">
          <CalorieRing />
          <View className="flex-1 gap-1">
            <MacroRow color="#6C63FF" label="Protein" value="82g" />
            <MacroRow color="#FBBF24" label="Carbs" value="120g" />
            <MacroRow color="#EC4899" label="Fats" value="45g" />
          </View>
        </View>

        <View className="mb-1.5 flex-row items-center gap-2 rounded-xl bg-background/80 px-2 py-1.5">
          <View className="h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
            <Ionicons name="barbell" size={12} color="#6C63FF" />
          </View>
          <View className="flex-1">
            <Text className="text-[9px] font-medium text-text">Upper Body</Text>
            <Text className="text-[8px] text-text-muted">3 exercises</Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-center gap-2 rounded-xl bg-background/80 px-2 py-1.5">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-pink-500/20">
            <Ionicons name="nutrition" size={12} color="#EC4899" />
          </View>
          <View className="flex-1">
            <Text className="text-[9px] font-medium text-text">Grilled Chicken Bowl</Text>
            <Text className="text-[8px] text-text-muted">Lunch · 480 kcal</Text>
          </View>
        </View>

        <View>
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[8px] text-text-muted">Daily Goal</Text>
            <Text className="text-[8px] font-medium text-primary">78%</Text>
          </View>
          <View className="h-1.5 overflow-hidden rounded-full bg-border">
            <View className="h-full w-[78%] rounded-full bg-primary" />
          </View>
        </View>
      </View>
    </View>
  );
}

function MacroRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="flex-1 text-[8px] text-text-muted">{label}</Text>
      <Text className="text-[8px] font-medium text-text">{value}</Text>
    </View>
  );
}
