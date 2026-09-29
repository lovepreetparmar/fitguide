import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { FoodLogShortcut } from '@/services/mealFrequency';

type Props = {
  title: string;
  items: FoodLogShortcut[];
  onSelect: (item: FoodLogShortcut) => void;
};

export function RecentFrequentList({ title, items, onSelect }: Props) {
  if (!items.length) return null;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text-secondary">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => (
          <TouchableOpacity
            key={`${item.food_id ?? item.name}`}
            onPress={() => onSelect(item)}
            className="mr-2 rounded-full bg-card px-4 py-2"
          >
            <Text className="text-sm font-medium text-text">{item.name}</Text>
            <Text className="text-xs text-text-secondary">{item.calories} kcal</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
