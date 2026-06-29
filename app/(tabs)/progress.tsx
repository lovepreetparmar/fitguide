import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Chip } from '@/components/ui/Chip';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { SimpleLineChart } from '@/components/ui/SimpleLineChart';
import { RecoveryScore } from '@/components/home/RecoveryScore';
import { useAuthStore } from '@/store/authStore';
import { progressService, recoveryService } from '@/services/progress';
import { MUSCLE_GROUPS } from '@/constants/app';
import { getRecoveryColor, getRecoveryLabel } from '@/utils/format';

export default function ProgressScreen() {
  const { profile } = useAuthStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

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
  const latestBodyFat = progress[progress.length - 1]?.body_fat_percent ?? 18;
  const recoveryScore = recoveryService.getOverallRecoveryScore(recovery);

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
          <StatCard label="Body Fat" value={latestBodyFat.toFixed(1)} unit="%" icon="body-outline" iconColor="#00D9A5" className="flex-1" />
        </View>

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
