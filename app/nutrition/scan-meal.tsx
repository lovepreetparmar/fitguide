import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useAuthStore } from '@/store/authStore';
import {
  analyzeMealImage,
  captureMealPhoto,
  pickMealPhotoFromLibrary,
  requestMealPhotoPermissions,
} from '@/services/mealImageScan';
import { describedItemToMealInput, type DescribedMealItem } from '@/services/mealDescribe';
import { nutritionMealsService } from '@/services/nutritionMeals';
import { canSyncUserToSupabase } from '@/utils/userId';
import { nutritionQueryKeys } from '@/constants/nutritionQueryKeys';
import { todayDateString } from '@/utils/nutritionDate';
import type { MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function ScanMealScreen() {
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
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [items, setItems] = useState<DescribedMealItem[]>([]);

  const analyzeMutation = useMutation({
    mutationFn: async (source: 'camera' | 'library') => {
      if (!canSyncUserToSupabase(userId)) {
        throw new Error('Sign in to scan meal photos (AI runs on your account).');
      }
      const granted = await requestMealPhotoPermissions();
      if (!granted) throw new Error('Camera or photo library permission is required.');

      const picked =
        source === 'camera' ? await captureMealPhoto() : await pickMealPhotoFromLibrary();
      if (!picked) return null;

      setPreviewUri(`data:${picked.mimeType};base64,${picked.base64}`);
      return analyzeMealImage(picked.base64, picked.mimeType);
    },
    onSuccess: (result) => {
      if (result === null) return;
      if (!result.length) {
        Alert.alert('Nothing found', 'Try a clearer photo with foods visible.');
        return;
      }
      setItems(result);
    },
    onError: (e: Error) => Alert.alert('Could not scan meal', e.message),
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

  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Scan meal</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        <Text className="mb-3 text-sm text-text-secondary">
          Take a photo of your plate or fruits (e.g. apple, banana). We estimate each food and its
          calories.
        </Text>

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

        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            className="mb-4 h-48 w-full rounded-card bg-card"
            resizeMode="cover"
          />
        ) : (
          <View className="mb-4 h-48 items-center justify-center rounded-card bg-card">
            <Ionicons name="restaurant-outline" size={40} color="#666" />
            <Text className="mt-2 text-sm text-text-secondary">No photo yet</Text>
          </View>
        )}

        <View className="mb-4 flex-row gap-2">
          <Button
            title="Take photo"
            onPress={() => analyzeMutation.mutate('camera')}
            disabled={analyzeMutation.isPending}
            className="flex-1"
          />
          <Button
            title="Photo library"
            variant="secondary"
            onPress={() => analyzeMutation.mutate('library')}
            disabled={analyzeMutation.isPending}
            className="flex-1"
          />
        </View>

        {analyzeMutation.isPending ? (
          <View className="mb-4 flex-row items-center justify-center gap-2">
            <ActivityIndicator color="#6C63FF" />
            <Text className="text-sm text-text-secondary">Analyzing foods…</Text>
          </View>
        ) : null}

        {items.length > 0 ? (
          <>
            <Text className="mb-2 font-semibold text-text">
              Found {items.length} item(s) · ~{totalCalories} kcal
            </Text>
            {items.map((item, index) => (
              <View key={`${item.name}-${index}`} className="mb-3 rounded-card bg-card p-4">
                <Text className="font-semibold text-text">{item.name}</Text>
                <Text className="text-sm text-text-secondary">
                  {item.quantity} {item.unit} · {item.calories} kcal · P {item.protein_g}g
                </Text>
                {item.note ? <Text className="mt-1 text-xs text-text-secondary">{item.note}</Text> : null}
              </View>
            ))}
            <Button
              title={addAllMutation.isPending ? 'Logging…' : `Add to ${mealType}`}
              onPress={() => addAllMutation.mutate()}
              disabled={addAllMutation.isPending}
              fullWidth
              className="mb-8"
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
