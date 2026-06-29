import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { NutritionLog } from '@/types';

interface NutritionCardProps {
  log: NutritionLog;
  targets?: { calories: number; protein: number; carbs: number; fat: number; water: number };
}

export function NutritionCard({ log, targets }: NutritionCardProps) {
  const targetCalories = targets?.calories ?? 2200;
  const targetProtein = targets?.protein ?? 150;
  const targetCarbs = targets?.carbs ?? 250;
  const targetFat = targets?.fat ?? 70;
  const targetWater = targets?.water ?? 2500;

  const macros = [
    { label: 'Calories', current: log.calories, target: targetCalories, unit: 'kcal', color: '#FF5252' },
    { label: 'Protein', current: log.protein_g, target: targetProtein, unit: 'g', color: '#6C63FF' },
    { label: 'Carbs', current: log.carbs_g, target: targetCarbs, unit: 'g', color: '#FFC107' },
    { label: 'Fat', current: log.fat_g, target: targetFat, unit: 'g', color: '#00D9A5' },
    { label: 'Water', current: log.water_ml, target: targetWater, unit: 'ml', color: '#45B7D1' },
  ];

  return (
    <Card>
      <Text className="mb-4 text-base font-semibold text-text">Today's Nutrition</Text>
      {macros.map((macro) => (
        <View key={macro.label} className="mb-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">{macro.label}</Text>
            <Text className="text-sm font-medium text-text">
              {macro.current}/{macro.target} {macro.unit}
            </Text>
          </View>
          <ProgressBar
            progress={(macro.current / macro.target) * 100}
            color={macro.color}
            height={6}
          />
        </View>
      ))}
    </Card>
  );
}
