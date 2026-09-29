import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { useAuthStore } from '@/store/authStore';
import {
  describeMeal,
  describedItemToMealInput,
  type DescribedMealItem,
} from '@/services/mealDescribe';
import { nutritionMealsService } from '@/services/nutritionMeals';
import { canSyncUserToSupabase } from '@/utils/userId';
import { nutritionQueryKeys } from '@/constants/nutritionQueryKeys';
import { todayDateString } from '@/utils/nutritionDate';
import type { MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function DescribeMealScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const userId = profile?.user_id ?? '';
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const logDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayDateString();
  const [mealType, setMealType] = useState<MealType>(
    (MEAL_TYPES.includes(params.meal as MealType) ? params.meal : 'lunch') as MealType
  );
  const [text, setText] = useState('');
  const [items, setItems] = useState<DescribedMealItem[]>([]);

  const analyzeMutation = useMutation({
    mutationFn: (opts: { useAi?: boolean }) => describeMeal(text, opts),
    onSuccess: (result) => {
      if (!result.length) {
        Alert.alert('Nothing found', 'Try foods like "2 rotis and dal" or "1 cup rice".');
        return;
      }
      setItems(result);
    },
    onError: (e: Error) => Alert.alert('Could not analyze', e.message),
  });

  const addAllMutation = useMutation({
    mutationFn: async () => {
      for (const item of items) {
        await nutritionMealsService.addMealItem(
          userId,
          mealType,
          describedItemToMealInput(item),
          logDate
        );
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.log(userId, logDate) });
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.mealItems(userId, logDate) });
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.recentFoods(userId) });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Could not log', e.message),
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Describe meal</Text>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View className="mb-4 flex-row flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <Chip
              key={m}
              label={m.charAt(0).toUpperCase() + m.slice(1)}
              selected={mealType === m}
              onPress={() => setMealType(m)}
              size="sm"
            />
          ))}
        </View>

        <Input
          label="What did you eat?"
          value={text}
          onChangeText={setText}
          placeholder="2 rotis, dal, and Greek yogurt"
          multiline
        />

        <View className="mb-4 flex-row gap-2">
          <Button
            title={analyzeMutation.isPending ? 'Analyzing…' : 'Analyze'}
            onPress={() => analyzeMutation.mutate({})}
            disabled={!text.trim() || analyzeMutation.isPending}
            className="flex-1"
          />
          {canSyncUserToSupabase(userId) ? (
            <Button
              title="AI"
              variant="secondary"
              onPress={() => analyzeMutation.mutate({ useAi: true })}
              disabled={!text.trim() || analyzeMutation.isPending}
              className="px-6"
            />
          ) : null}
        </View>

        {items.map((item, index) => (
          <View key={`${item.name}-${index}`} className="mb-3 rounded-card bg-card p-4">
            <Text className="font-semibold text-text">{item.name}</Text>
            <Text className="text-sm text-text-secondary">
              {item.quantity} {item.unit} · {item.calories} kcal · P {item.protein_g}g
            </Text>
            {item.note ? <Text className="mt-1 text-xs text-text-secondary">{item.note}</Text> : null}
            <Text className="mt-1 text-xs capitalize text-primary">Confidence: {item.confidence}</Text>
          </View>
        ))}

        {items.length > 0 ? (
          <Button
            title={addAllMutation.isPending ? 'Logging…' : `Add ${items.length} item(s) to ${mealType}`}
            onPress={() => addAllMutation.mutate()}
            disabled={addAllMutation.isPending}
            fullWidth
            className="mb-8"
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
