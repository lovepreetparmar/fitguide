import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { progressService } from '@/services/progress';

function parseOptional(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = parseFloat(trimmed.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export default function MeasurementsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const userId = profile?.user_id ?? '';
  const today = new Date().toISOString().split('T')[0];

  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');

  const { data: history = [] } = useQuery({
    queryKey: ['measurements', userId],
    queryFn: () => progressService.getMeasurements(userId),
    enabled: Boolean(userId),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      progressService.logMeasurement(userId, {
        date: today,
        chest_cm: parseOptional(chest),
        waist_cm: parseOptional(waist),
        arms_cm: parseOptional(arms),
        legs_cm: parseOptional(legs),
        shoulders_cm: null,
        neck_cm: null,
        body_fat_percent: null,
        weight_kg: null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['measurements'] });
      Alert.alert('Saved', 'Measurements logged for today.');
      setChest('');
      setWaist('');
      setArms('');
      setLegs('');
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
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
        <Text className="text-xl font-bold text-text">Body measurements</Text>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <Text className="mb-4 text-sm text-text-secondary">All values in centimeters.</Text>
        <Input label="Chest" value={chest} onChangeText={setChest} keyboardType="decimal-pad" />
        <Input label="Waist" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" />
        <Input label="Arms" value={arms} onChangeText={setArms} keyboardType="decimal-pad" />
        <Input label="Legs" value={legs} onChangeText={setLegs} keyboardType="decimal-pad" />
        <Button
          title={saveMutation.isPending ? 'Saving…' : 'Save today'}
          onPress={() => saveMutation.mutate()}
          fullWidth
          className="mb-6"
        />

        <Text className="mb-3 text-lg font-semibold text-text">Recent</Text>
        {history.length === 0 ? (
          <Text className="text-sm text-text-secondary">No measurements yet.</Text>
        ) : (
          history.map((row) => (
            <Card key={row.id} className="mb-2">
              <Text className="mb-1 font-semibold text-text">{row.date}</Text>
              <Text className="text-sm text-text-secondary">
                Chest {row.chest_cm ?? '—'} · Waist {row.waist_cm ?? '—'} · Arms {row.arms_cm ?? '—'}{' '}
                · Legs {row.legs_cm ?? '—'}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
