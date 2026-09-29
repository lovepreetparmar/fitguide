import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useAuthStore } from '@/store/authStore';
import { nutritionMealsService, scaleFoodMacros } from '@/services/nutritionMeals';
import type { MealType } from '@/types';
import { canSyncUserToSupabase } from '@/utils/userId';
import { nutritionQueryKeys } from '@/constants/nutritionQueryKeys';
import { todayDateString } from '@/utils/nutritionDate';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function AddFoodScreen() {
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
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const { data: foods = [] } = useQuery({
    queryKey: ['foods-search', userId, search],
    queryFn: () => nutritionMealsService.searchFoods(userId, search),
    enabled: Boolean(userId),
  });

  const { data: savedFoods = [] } = useQuery({
    queryKey: ['saved-foods', userId],
    queryFn: () => nutritionMealsService.listSavedFoods(userId),
    enabled: Boolean(userId),
  });

  const addMutation = useMutation({
    mutationFn: (payload: {
      food_id?: string | null;
      name: string;
      quantity: number;
      unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
    }) => nutritionMealsService.addMealItem(userId, mealType, payload, logDate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.log(userId, logDate) });
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.mealItems(userId, logDate) });
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.recentFoods(userId) });
      await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.frequentFoods(userId) });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Could not add food', e.message),
  });

  const saveFoodMutation = useMutation({
    mutationFn: ({ foodId, saved }: { foodId: string; saved: boolean }) =>
      nutritionMealsService.saveFood(userId, foodId, saved),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
      await queryClient.invalidateQueries({ queryKey: ['foods-search'] });
    },
  });

  const saveCustomFoodMutation = useMutation({
    mutationFn: () =>
      nutritionMealsService.createCustomFood(userId, {
        name: name.trim(),
        serving_amount: parseFloat(quantity) || 1,
        serving_unit: 'serving',
        calories: parseInt(calories, 10) || 0,
        protein_g: parseFloat(protein) || 0,
        carbs_g: parseFloat(carbs) || 0,
        fat_g: parseFloat(fat) || 0,
        fiber_g: 0,
        is_saved: true,
      }),
    onSuccess: async (food) => {
      await queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
      const qty = parseFloat(quantity) || 1;
      const macros = scaleFoodMacros(food, qty, 'serving');
      addMutation.mutate({
        food_id: food.id,
        name: food.name,
        quantity: qty,
        unit: 'serving',
        ...macros,
        fiber_g: macros.fiber_g,
      });
    },
    onError: (e: Error) => Alert.alert('Could not save food', e.message),
  });

  const pickFood = (foodId: string) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food) return;
    const qty = parseFloat(quantity) || 1;
    const macros = scaleFoodMacros(food, qty, 'serving');
    addMutation.mutate({
      food_id: food.id,
      name: food.name,
      quantity: qty,
      unit: 'serving',
      ...macros,
      fiber_g: macros.fiber_g,
    });
  };

  const addManual = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter a food name.');
      return;
    }
    addMutation.mutate({
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: 'serving',
      calories: parseInt(calories, 10) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      fiber_g: 0,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card">
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Add food</Text>
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

        {canSyncUserToSupabase(userId) && savedFoods.length > 0 ? (
          <>
            <Text className="mb-2 text-sm font-semibold text-text-secondary">Saved foods</Text>
            {savedFoods.slice(0, 8).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => pickFood(item.id)}
                className="mb-2 rounded-card bg-card px-4 py-3"
              >
                <Text className="font-medium text-text">{item.name}</Text>
                <Text className="text-xs text-text-secondary">
                  {item.calories} kcal · P {item.protein_g}g per {item.serving_unit}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        <Input label="Search foods" value={search} onChangeText={setSearch} placeholder="Dal, roti, paneer…" icon="search-outline" />

        {foods.length === 0 ? (
          <Text className="mb-4 text-sm text-text-secondary">No matches. Use manual entry below.</Text>
        ) : (
          foods.map((item) => (
            <View key={item.id} className="mb-2 flex-row items-center rounded-card bg-card px-4 py-3">
              <TouchableOpacity className="flex-1" onPress={() => pickFood(item.id)}>
                <Text className="font-medium text-text">{item.name}</Text>
                <Text className="text-xs text-text-secondary">
                  {item.calories} kcal · P {item.protein_g}g per {item.serving_unit}
                </Text>
              </TouchableOpacity>
              {item.user_id === userId ? (
                <TouchableOpacity
                  onPress={() =>
                    saveFoodMutation.mutate({ foodId: item.id, saved: !item.is_saved })
                  }
                  accessibilityLabel={item.is_saved ? 'Unsave food' : 'Save food'}
                >
                  <Ionicons
                    name={item.is_saved ? 'bookmark' : 'bookmark-outline'}
                    size={22}
                    color="#6C63FF"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}

        <Text className="mb-2 mt-4 text-lg font-semibold text-text">Manual entry</Text>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Food name" />
        <Input label="Servings" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
        <Input label="Calories" value={calories} onChangeText={setCalories} keyboardType="number-pad" />
        <View className="flex-row gap-3">
          <Input label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" className="flex-1" />
          <Input label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" className="flex-1" />
        </View>
        <Input label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" />
        <Button
          title={addMutation.isPending ? 'Adding…' : 'Add to meal'}
          onPress={addManual}
          fullWidth
          className="mb-3"
          disabled={addMutation.isPending}
        />
        {canSyncUserToSupabase(userId) ? (
          <Button
            title={saveCustomFoodMutation.isPending ? 'Saving…' : 'Save food & add'}
            variant="secondary"
            onPress={() => {
              if (!name.trim()) {
                Alert.alert('Name required', 'Enter a food name.');
                return;
              }
              saveCustomFoodMutation.mutate();
            }}
            fullWidth
            className="mb-8"
            disabled={saveCustomFoodMutation.isPending}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
