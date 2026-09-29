import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type { MealLogItem, MealType } from '@/types';

type Props = {
  meal: MealType;
  items: MealLogItem[];
  onAdd: () => void;
  onCopyYesterday?: () => void;
  onSaveTemplate?: () => void;
  onDeleteItem: (id: string) => void;
  showSaveTemplate?: boolean;
};

export function DiaryMealSection({
  meal,
  items,
  onAdd,
  onCopyYesterday,
  onSaveTemplate,
  onDeleteItem,
  showSaveTemplate,
}: Props) {
  const subtotal = items.reduce((sum, i) => sum + i.calories, 0);

  return (
    <Card className="mb-3" padding="none">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View>
          <Text className="font-semibold capitalize text-text">{meal}</Text>
          <Text className="text-xs text-text-secondary">{subtotal} kcal</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {onCopyYesterday ? (
            <TouchableOpacity onPress={onCopyYesterday}>
              <Text className="text-xs font-semibold text-text-secondary">Copy yday</Text>
            </TouchableOpacity>
          ) : null}
          {showSaveTemplate && items.length > 0 && onSaveTemplate ? (
            <TouchableOpacity onPress={onSaveTemplate}>
              <Text className="text-xs font-semibold text-text-secondary">Save</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onAdd}>
            <Text className="text-sm font-semibold text-primary">+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      {items.length === 0 ? (
        <Text className="px-4 py-3 text-sm text-text-secondary">No foods logged</Text>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between border-b border-border px-4 py-3"
          >
            <View className="flex-1 pr-2">
              <Text className="text-text">{item.name}</Text>
              <Text className="text-xs text-text-secondary">
                {item.calories} kcal · P {item.protein_g}g
              </Text>
            </View>
            <TouchableOpacity onPress={() => onDeleteItem(item.id)} accessibilityLabel={`Remove ${item.name}`}>
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </Card>
  );
}
