import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { NutritionCard } from '@/components/home/NutritionCard';
import { DiaryDayHeader } from '@/components/nutrition/DiaryDayHeader';
import { DiaryMealSection } from '@/components/nutrition/DiaryMealSection';
import { DiaryQuickAddSheet } from '@/components/nutrition/DiaryQuickAddSheet';
import { RecentFrequentList } from '@/components/nutrition/RecentFrequentList';
import { useAuthStore } from '@/store/authStore';
import { nutritionService } from '@/services/nutrition';
import { nutritionMealsService } from '@/services/nutritionMeals';
import { nutritionQueryKeys } from '@/constants/nutritionQueryKeys';
import type { MealType, SavedMeal } from '@/types';
import { canSyncUserToSupabase } from '@/utils/userId';
import {
  addDaysToDateString,
  todayDateString,
} from '@/utils/nutritionDate';
import type { FoodLogShortcut } from '@/services/mealFrequency';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function parseIntField(value: string, fallback = 0): number {
  const n = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function DiaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const userId = profile?.user_id ?? '';
  const [date, setDate] = useState(todayDateString());
  const [water, setWater] = useState('');
  const [saveMealFor, setSaveMealFor] = useState<MealType | null>(null);
  const [saveMealName, setSaveMealName] = useState('');
  const [quickAddMeal, setQuickAddMeal] = useState<MealType | null>(null);
  const [shortcutMeal, setShortcutMeal] = useState<MealType>('lunch');

  const targets = useMemo(() => nutritionService.calculateMacros(profile), [profile]);

  const { data: dayLog } = useQuery({
    queryKey: nutritionQueryKeys.log(userId, date),
    queryFn: () => nutritionService.getLogForDate(userId, date),
    enabled: Boolean(userId),
  });

  const { data: mealItems = [] } = useQuery({
    queryKey: nutritionQueryKeys.mealItems(userId, date),
    queryFn: () => nutritionMealsService.getMealItemsForDate(userId, date),
    enabled: Boolean(userId),
  });

  const { data: recentFoods = [] } = useQuery({
    queryKey: nutritionQueryKeys.recentFoods(userId),
    queryFn: () => nutritionMealsService.getRecentFoods(userId, 10),
    enabled: Boolean(userId),
  });

  const { data: frequentFoods = [] } = useQuery({
    queryKey: nutritionQueryKeys.frequentFoods(userId),
    queryFn: () => nutritionMealsService.getFrequentFoods(userId, 10),
    enabled: Boolean(userId),
  });

  const { data: savedMeals = [] } = useQuery({
    queryKey: ['saved-meals', userId],
    queryFn: () => nutritionMealsService.listSavedMeals(userId),
    enabled: Boolean(userId) && canSyncUserToSupabase(userId),
  });

  const mealMacroTotals = useMemo(
    () =>
      mealItems.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein_g: acc.protein_g + item.protein_g,
          carbs_g: acc.carbs_g + item.carbs_g,
          fat_g: acc.fat_g + item.fat_g,
          fiber_g: acc.fiber_g + item.fiber_g,
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
      ),
    [mealItems]
  );

  const baseLog = dayLog ?? {
    id: 'preview',
    user_id: userId,
    date,
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    water_ml: 0,
  };

  const displayLog =
    mealItems.length > 0
      ? {
          ...baseLog,
          calories: Math.round(mealMacroTotals.calories),
          protein_g: mealMacroTotals.protein_g,
          carbs_g: mealMacroTotals.carbs_g,
          fat_g: mealMacroTotals.fat_g,
          fiber_g: mealMacroTotals.fiber_g,
        }
      : baseLog;

  const caloriesRemaining = Math.max(0, targets.calories - displayLog.calories);

  const invalidateDiary = async () => {
    await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.log(userId, date) });
    await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.mealItems(userId, date) });
    await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.recentFoods(userId) });
    await queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.frequentFoods(userId) });
    if (date === todayDateString()) {
      await queryClient.invalidateQueries({ queryKey: ['nutrition', userId] });
      await queryClient.invalidateQueries({ queryKey: ['meal-items', userId] });
    }
  };

  const foodRoute = (path: string, meal?: MealType) => {
    const mealParam = meal ? `&meal=${meal}` : '';
    router.push(`${path}?date=${date}${mealParam}` as '/nutrition/add-food');
  };

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => nutritionMealsService.deleteMealItem(userId, itemId, date),
    onSuccess: invalidateDiary,
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const quickAddMutation = useMutation({
    mutationFn: (input: { meal: MealType; name?: string; calories: number; protein_g?: number }) =>
      nutritionMealsService.addQuickCalories(userId, date, input.meal, input),
    onSuccess: async () => {
      setQuickAddMeal(null);
      await invalidateDiary();
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const shortcutMutation = useMutation({
    mutationFn: (item: FoodLogShortcut) =>
      nutritionMealsService.logFoodShortcut(userId, date, shortcutMeal, item),
    onSuccess: invalidateDiary,
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const copyDayMutation = useMutation({
    mutationFn: () => {
      const fromDate = addDaysToDateString(date, -1);
      return nutritionMealsService.copyDay(userId, fromDate, date);
    },
    onSuccess: async (count) => {
      await invalidateDiary();
      Alert.alert('Copied', count ? `${count} item(s) copied from yesterday.` : 'Nothing to copy from yesterday.');
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const copyMealMutation = useMutation({
    mutationFn: (meal: MealType) => nutritionMealsService.copyMealFromYesterday(userId, meal, date),
    onSuccess: async (count) => {
      await invalidateDiary();
      if (count > 0) Alert.alert('Copied', `${count} item(s) copied.`);
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const applySavedMealMutation = useMutation({
    mutationFn: ({ meal, saved }: { meal: MealType; saved: SavedMeal }) =>
      nutritionMealsService.applySavedMeal(userId, saved, meal, date),
    onSuccess: async () => {
      await invalidateDiary();
      Alert.alert('Added', 'Saved meal applied.');
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const saveMealMutation = useMutation({
    mutationFn: ({ name, meal }: { name: string; meal: MealType }) => {
      const items = mealItems.filter((i) => i.meal_type === meal);
      if (!items.length) throw new Error('Log at least one food in that meal first.');
      return nutritionMealsService.createSavedMeal(
        userId,
        name,
        nutritionMealsService.mealItemsToTemplates(items)
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-meals'] });
      Alert.alert('Saved', 'Meal template saved.');
    },
    onError: (e: Error) => Alert.alert('Could not save', e.message),
  });

  const waterMutation = useMutation({
    mutationFn: () =>
      nutritionService.logNutritionForDate(userId, date, {
        water_ml: parseIntField(water || String(displayLog.water_ml)),
      }),
    onSuccess: async () => {
      await invalidateDiary();
      Alert.alert('Saved', 'Water updated.');
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const grouped = MEAL_TYPES.map((meal) => ({
    meal,
    items: mealItems.filter((i) => i.meal_type === meal),
  }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="px-5 pt-3">
        <Text className="text-2xl font-bold text-text">Diary</Text>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <DiaryDayHeader
          date={date}
          caloriesRemaining={caloriesRemaining}
          calorieTarget={targets.calories}
          onPrevDay={() => setDate((d) => addDaysToDateString(d, -1))}
          onNextDay={() => setDate((d) => addDaysToDateString(d, 1))}
          onToday={() => setDate(todayDateString())}
        />

        <Text className="mb-2 text-sm text-text-secondary">
          P {Math.max(0, targets.protein - displayLog.protein_g).toFixed(0)}g · C{' '}
          {Math.max(0, targets.carbs - displayLog.carbs_g).toFixed(0)}g · F{' '}
          {Math.max(0, targets.fat - displayLog.fat_g).toFixed(0)}g remaining
        </Text>

        <NutritionCard log={displayLog} targets={targets} />

        <View className="mb-3 mt-2 flex-row flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <Chip
              key={m}
              label={m}
              selected={shortcutMeal === m}
              onPress={() => setShortcutMeal(m)}
              size="sm"
            />
          ))}
        </View>

        <RecentFrequentList
          title="Recent"
          items={recentFoods}
          onSelect={(item) => shortcutMutation.mutate(item)}
        />
        <RecentFrequentList
          title="Frequent"
          items={frequentFoods}
          onSelect={(item) => shortcutMutation.mutate(item)}
        />

        <View className="mb-4 flex-row gap-2">
          <Button title="Add food" onPress={() => foodRoute('/nutrition/add-food')} className="flex-1" />
          <Button title="Quick add" variant="secondary" onPress={() => setQuickAddMeal(shortcutMeal)} className="flex-1" />
        </View>
        <View className="mb-4 flex-row gap-2">
          <Button title="Describe" variant="outline" onPress={() => foodRoute('/nutrition/describe-meal')} className="flex-1" />
          <Button title="Scan meal" variant="outline" onPress={() => foodRoute('/nutrition/scan-meal')} className="flex-1" />
        </View>

        <Button
          title={copyDayMutation.isPending ? 'Copying…' : 'Copy all meals from yesterday'}
          variant="outline"
          onPress={() => {
            Alert.alert('Copy yesterday', 'Append all meals from yesterday to this day?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Copy', onPress: () => copyDayMutation.mutate() },
            ]);
          }}
          disabled={copyDayMutation.isPending}
          fullWidth
          className="mb-4"
        />

        {saveMealFor ? (
          <Card className="mb-4">
            <Text className="mb-2 font-semibold text-text">Save {saveMealFor} template</Text>
            <Input label="Name" value={saveMealName} onChangeText={setSaveMealName} />
            <View className="flex-row gap-2">
              <Button title="Cancel" variant="outline" onPress={() => setSaveMealFor(null)} className="flex-1" />
              <Button
                title="Save"
                onPress={() => {
                  if (!saveMealName.trim()) return;
                  saveMealMutation.mutate(
                    { name: saveMealName.trim(), meal: saveMealFor },
                    { onSuccess: () => setSaveMealFor(null) }
                  );
                }}
                className="flex-1"
              />
            </View>
          </Card>
        ) : null}

        {canSyncUserToSupabase(userId) && savedMeals.length > 0 ? (
          <Card className="mb-4" padding="none">
            <Text className="border-b border-border px-4 py-3 font-semibold text-text">Saved meals</Text>
            {savedMeals.map((saved) => (
              <View key={saved.id} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <Text className="flex-1 text-text">{saved.name}</Text>
                <TouchableOpacity
                  onPress={() => applySavedMealMutation.mutate({ meal: shortcutMeal, saved })}
                >
                  <Text className="text-sm font-semibold text-primary">Apply</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        ) : null}

        {grouped.map(({ meal, items }) => (
          <DiaryMealSection
            key={meal}
            meal={meal}
            items={items}
            onAdd={() => foodRoute('/nutrition/add-food', meal)}
            onCopyYesterday={() => copyMealMutation.mutate(meal)}
            onSaveTemplate={() => {
              setSaveMealFor(meal);
              setSaveMealName(meal.charAt(0).toUpperCase() + meal.slice(1));
            }}
            showSaveTemplate={canSyncUserToSupabase(userId)}
            onDeleteItem={(id) => deleteMutation.mutate(id)}
          />
        ))}

        <Card className="mb-8">
          <Text className="mb-2 font-semibold text-text">Water</Text>
          <Input
            label="Water (ml)"
            value={water || String(displayLog.water_ml ?? 0)}
            onChangeText={setWater}
            keyboardType="number-pad"
          />
          <Button title="Save water" onPress={() => waterMutation.mutate()} disabled={waterMutation.isPending} />
        </Card>
      </ScrollView>

      <DiaryQuickAddSheet
        visible={quickAddMeal !== null}
        mealType={quickAddMeal ?? 'lunch'}
        onClose={() => setQuickAddMeal(null)}
        loading={quickAddMutation.isPending}
        onSubmit={(input) => {
          if (!quickAddMeal) return;
          quickAddMutation.mutate({ meal: quickAddMeal, ...input });
        }}
      />
    </SafeAreaView>
  );
}
