import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { workoutService } from '@/services/workout';
import { recoveryService } from '@/services/progress';
import { useQuery } from '@tanstack/react-query';
import { formatDuration } from '@/utils/format';

export default function WorkoutScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { currentPlan, setCurrentPlan, activeSession } = useWorkoutStore();
  const [generating, setGenerating] = useState(false);

  const { data: recovery = [] } = useQuery({
    queryKey: ['recovery', profile?.user_id],
    queryFn: () => recoveryService.getRecoveryData(profile?.user_id ?? ''),
    enabled: !!profile,
  });

  const handleGenerate = async (minutes?: number) => {
    if (!profile) return;
    setGenerating(true);
    try {
      const plan = await workoutService.generateWorkout({
        profile,
        recovery,
        workoutLengthMinutes: minutes ?? profile.workout_time_minutes ?? 60,
      });
      setCurrentPlan(plan);
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = async () => {
    if (!currentPlan || !profile) return;
    const session = await workoutService.startSession(profile.user_id, currentPlan);
    useWorkoutStore.getState().startSession(session);
    router.push('/workout/player');
  };

  const durations = [30, 45, 60, 90];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 pt-2 text-2xl font-bold text-text">Workout</Text>
        <Text className="mb-6 text-text-secondary">Generate and track your training</Text>

        {activeSession && (
          <Card className="mb-4 border border-primary/30">
            <View className="flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Ionicons name="play" size={24} color="#6C63FF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text">Workout in Progress</Text>
                <Text className="text-sm text-text-secondary">{activeSession.name}</Text>
              </View>
              <Button title="Resume" size="sm" onPress={() => router.push('/workout/player')} />
            </View>
          </Card>
        )}

        <Text className="mb-3 text-lg font-semibold text-text">Workout Length</Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {durations.map((d) => (
            <Chip
              key={d}
              label={formatDuration(d)}
              onPress={() => handleGenerate(d)}
              selected={currentPlan?.estimated_duration_minutes === d}
            />
          ))}
        </View>

        {currentPlan ? (
          <Card className="mb-4">
            <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Generated Workout
            </Text>
            <Text className="mb-4 text-xl font-bold text-text">{currentPlan.name}</Text>

            {currentPlan.exercises.map((ex, i) => (
              <View
                key={ex.exercise_id}
                className="flex-row items-center border-b border-border py-3 last:border-b-0"
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <Text className="text-xs font-bold text-primary">{i + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text">
                    {ex.exercise?.name ?? 'Exercise'}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {ex.sets} × {ex.reps} reps
                    {ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''} · {ex.rest_seconds}s rest
                  </Text>
                </View>
                <View className="rounded-full bg-border px-2 py-1">
                  <Text className="text-xs capitalize text-text-muted">
                    {ex.exercise?.primary_muscle}
                  </Text>
                </View>
              </View>
            ))}

            <View className="mt-4 flex-row gap-3">
              <Button title="Regenerate" variant="outline" onPress={() => handleGenerate()} loading={generating} className="flex-1" />
              <Button title="Start" onPress={handleStart} className="flex-1" icon={<Ionicons name="play" size={16} color="#FFF" />} />
            </View>
          </Card>
        ) : (
          <Card className="mb-4 items-center py-8">
            <Ionicons name="barbell-outline" size={56} color="#6C63FF" />
            <Text className="mt-4 text-lg font-semibold text-text">Ready to Train?</Text>
            <Text className="mt-2 text-center text-sm text-text-secondary">
              AI will create a personalized workout based on your goals, equipment, and recovery status
            </Text>
            <Button
              title="Generate Workout"
              onPress={() => handleGenerate()}
              loading={generating}
              className="mt-6"
              size="lg"
            />
          </Card>
        )}

        <Text className="mb-3 text-lg font-semibold text-text">Training Rules</Text>
        <Card>
          {[
            'Compound exercises first',
            'Isolation exercises later',
            'Avoid overtraining fatigued muscles',
            'Balance push, pull, and legs',
            'Include warmup and cooldown',
            'Progressive overload applied',
          ].map((rule) => (
            <View key={rule} className="flex-row items-center py-2">
              <Ionicons name="checkmark-circle" size={18} color="#00D9A5" />
              <Text className="ml-3 text-sm text-text-secondary">{rule}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
