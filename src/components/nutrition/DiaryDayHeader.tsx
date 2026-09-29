import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from '@/components/ui/Chip';
import { formatDiaryLabel, todayDateString } from '@/utils/nutritionDate';

type Props = {
  date: string;
  caloriesRemaining: number;
  calorieTarget: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
};

export function DiaryDayHeader({
  date,
  caloriesRemaining,
  calorieTarget,
  onPrevDay,
  onNextDay,
  onToday,
}: Props) {
  const isToday = date === todayDateString();

  return (
    <View className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={onPrevDay} className="h-10 w-10 items-center justify-center rounded-full bg-card">
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text">{formatDiaryLabel(date)}</Text>
        <TouchableOpacity
          onPress={onNextDay}
          disabled={isToday}
          className="h-10 w-10 items-center justify-center rounded-full bg-card"
          style={{ opacity: isToday ? 0.35 : 1 }}
        >
          <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!isToday ? (
        <View className="mb-3 items-center">
          <Chip label="Jump to today" onPress={onToday} size="sm" />
        </View>
      ) : null}

      <View className="rounded-card bg-card px-5 py-4">
        <Text className="text-center text-3xl font-bold text-text">
          {caloriesRemaining.toLocaleString()}
        </Text>
        <Text className="mt-1 text-center text-sm text-text-secondary">kcal remaining</Text>
        <Text className="mt-2 text-center text-xs text-text-secondary">
          Daily goal {calorieTarget.toLocaleString()} kcal
        </Text>
      </View>
    </View>
  );
}
