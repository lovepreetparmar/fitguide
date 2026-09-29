import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Chip } from '@/components/ui/Chip';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimpleLineChart } from '@/components/ui/SimpleLineChart';
import { RecoveryScore } from '@/components/home/RecoveryScore';
import { useAuthStore } from '@/store/authStore';
import { progressService, recoveryService } from '@/services/progress';
import { MUSCLE_GROUPS } from '@/constants/app';
import { getRecoveryColor, getRecoveryLabel } from '@/utils/format';

export default function ProgressScreen() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', profile?.user_id, period],
    queryFn: () => progressService.getProgress(profile?.user_id ?? '', period),
    enabled: !!profile,
  });

  const { data: recovery = [] } = useQuery({
    queryKey: ['recovery', profile?.user_id],
    queryFn: () => recoveryService.getRecoveryData(profile?.user_id ?? ''),
    enabled: !!profile,
  });

  const chartData = progress.map((p, i) => ({
    x: i + 1,
    y: p.weight_kg ?? 0,
  }));

  const latestWeight = progress[progress.length - 1]?.weight_kg ?? profile?.weight_kg ?? 0;
  const latestBodyFatEntry = progress[progress.length - 1]?.body_fat_percent;
  const recoveryScore = recoveryService.getOverallRecoveryScore(recovery);

  const logMutation = useMutation({
    mutationFn: async () => {
      const userId = profile?.user_id ?? '';
      const weight = parseFloat(weightInput.replace(',', '.'));
      const bodyFat = bodyFatInput.trim()
        ? parseFloat(bodyFatInput.replace(',', '.'))
        : null;
      if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error('Enter a valid weight in kg.');
      }
      const today = new Date().toISOString().split('T')[0];
      return progressService.logProgress(userId, {
        date: today,
        weight_kg: weight,
        body_fat_percent: bodyFat,
        muscle_mass_kg: null,
        calories: null,
        workout_volume_kg: null,
        notes: null,
      });
    },
    onSuccess: async () => {
      setWeightInput('');
      setBodyFatInput('');
      await queryClient.invalidateQueries({ queryKey: ['progress'] });
      Alert.alert('Logged', 'Weight entry saved.');
    },
    onError: (err: Error) => Alert.alert('Could not save', err.message),
  });

  const handleLogWeight = () => {
    logMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 pt-2 text-2xl font-bold text-text">Progress</Text>
        <Text className="mb-4 text-text-secondary">Track your fitness journey</Text>

        <View className="mb-4 flex-row gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <Chip
              key={p}
              label={p.charAt(0).toUpperCase() + p.slice(1)}
              selected={period === p}
              onPress={() => setPeriod(p)}
            />
          ))}
        </View>

        <View className="mb-4 flex-row gap-3">
          <StatCard label="Weight" value={latestWeight.toFixed(1)} unit="kg" icon="scale-outline" className="flex-1" />
          <StatCard
            label="Body Fat"
            value={latestBodyFatEntry != null ? latestBodyFatEntry.toFixed(1) : '—'}
            unit={latestBodyFatEntry != null ? '%' : ''}
            icon="body-outline"
            iconColor="#00D9A5"
            className="flex-1"
          />
        </View>

        <Card className="mb-4">
          <Text className="mb-3 text-base font-semibold text-text">Log weight</Text>
          <View className="mb-3 flex-row gap-3">
            <Input
              label="Weight (kg)"
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder={latestWeight.toFixed(1)}
              className="flex-1"
            />
            <Input
              label="Body fat %"
              value={bodyFatInput}
              onChangeText={setBodyFatInput}
              keyboardType="decimal-pad"
              placeholder="optional"
              className="flex-1"
            />
          </View>
          <Button
            title={logMutation.isPending ? 'Saving…' : 'Save entry'}
            onPress={handleLogWeight}
            disabled={logMutation.isPending}
          />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-base font-semibold text-text">Weight Trend</Text>
          {chartData.length > 0 ? (
            <SimpleLineChart data={chartData} color="#6C63FF" label="kg" />
          ) : (
            <Text className="py-8 text-center text-text-secondary">No data yet</Text>
          )}
        </Card>

        <Text className="mb-3 text-lg font-semibold text-text">Recovery</Text>
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1">
            <RecoveryScore score={recoveryScore} size={100} />
          </View>
          <View className="flex-1">
            {recovery.slice(0, 6).map((r) => (
              <View key={r.muscle_group} className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs capitalize text-text-secondary">{r.muscle_group}</Text>
                <View className="flex-row items-center">
                  <View
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: getRecoveryColor(r.status) }}
                  />
                  <Text className="text-xs text-text-muted">{r.score}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text className="mb-3 text-lg font-semibold text-text">Muscle Recovery</Text>
        <Card className="mb-6">
          <View className="flex-row flex-wrap gap-2">
            {recovery.map((r) => {
              const muscle = MUSCLE_GROUPS.find((m) => m.id === r.muscle_group);
              return (
                <View
                  key={r.muscle_group}
                  className="rounded-button px-3 py-2"
                  style={{ backgroundColor: `${getRecoveryColor(r.status)}20` }}
                >
                  <Text className="text-xs font-medium capitalize" style={{ color: getRecoveryColor(r.status) }}>
                    {muscle?.label ?? r.muscle_group}
                  </Text>
                  <Text className="text-xs text-text-muted">{getRecoveryLabel(r.status)}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
