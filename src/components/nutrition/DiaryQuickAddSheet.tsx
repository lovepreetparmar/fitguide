import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MealType } from '@/types';

type Props = {
  visible: boolean;
  mealType: MealType;
  onClose: () => void;
  onSubmit: (input: { name?: string; calories: number; protein_g?: number }) => void;
  loading?: boolean;
};

export function DiaryQuickAddSheet({ visible, mealType, onClose, onSubmit, loading }: Props) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const handleSubmit = () => {
    const cal = parseInt(calories, 10);
    if (!Number.isFinite(cal) || cal <= 0) return;
    onSubmit({
      name: name.trim() || undefined,
      calories: cal,
      protein_g: parseFloat(protein) || undefined,
    });
    setName('');
    setCalories('');
    setProtein('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="rounded-t-3xl bg-background px-5 pb-8 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-text">Quick add · {mealType}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary">Close</Text>
            </TouchableOpacity>
          </View>
          <Input label="Name (optional)" value={name} onChangeText={setName} placeholder="Snack" />
          <Input
            label="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="number-pad"
            placeholder="250"
          />
          <Input
            label="Protein (g, optional)"
            value={protein}
            onChangeText={setProtein}
            keyboardType="decimal-pad"
          />
          <Button
            title={loading ? 'Adding…' : 'Add'}
            onPress={handleSubmit}
            disabled={loading}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
