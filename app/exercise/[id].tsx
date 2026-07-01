import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { exerciseService } from '@/services/exercises';
import { workoutService } from '@/services/workout';
import { aiCoachService } from '@/services/ai';
import { MUSCLE_GROUPS } from '@/constants/app';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'instructions' | 'tips' | 'history'>('instructions');

  const { data: exercise, isLoading, isError } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseService.getExerciseById(id!),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['exercise-history', profile?.user_id, id],
    queryFn: () => workoutService.getExerciseHistory(profile?.user_id ?? '', id!),
    enabled: !!profile && !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-secondary">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !exercise) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-5">
        <Text className="mb-4 text-lg font-semibold text-text">Exercise not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-button bg-primary px-6 py-3">
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const muscle = MUSCLE_GROUPS.find((m) => m.id === exercise.primary_muscle);
  const muscleColor = muscle?.color ?? '#6C63FF';
  const muscleLabel = muscle?.label ?? exercise.primary_muscle;
  const hasMedia = Boolean(exercise.model_url || exercise.video_url || exercise.thumbnail_url);
  const aiTip = aiCoachService.generateExerciseRecommendation(exercise.name, 60, 10, 10);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative h-64 items-center justify-center bg-card">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-background/80"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View
            className="h-32 w-32 items-center justify-center rounded-3xl"
            style={{ backgroundColor: `${muscleColor}30` }}
          >
            <Ionicons name="barbell" size={64} color={muscleColor} />
          </View>
          {hasMedia && (
            <Text className="mt-2 text-xs text-text-muted">3D model available</Text>
          )}
        </View>

        <View className="px-5 pt-5">
          <Text className="mb-2 text-2xl font-bold text-text">{exercise.name}</Text>

          <View className="mb-4 flex-row flex-wrap gap-2">
            <Chip label={muscleLabel} color={muscleColor} selected />
            {exercise.secondary_muscles.map((m) => {
              const secondary = MUSCLE_GROUPS.find((g) => g.id === m);
              return <Chip key={m} label={secondary?.label ?? m} size="sm" />;
            })}
            <Chip label={exercise.difficulty} size="sm" />
          </View>

          <Card className="mb-4">
            <View className="flex-row items-start">
              <Ionicons name="sparkles" size={18} color="#6C63FF" />
              <Text className="ml-2 flex-1 text-sm text-text-secondary">{aiTip}</Text>
            </View>
          </Card>

          <View className="mb-4 flex-row gap-2">
            {(['instructions', 'tips', 'history'] as const).map((tab) => (
              <Chip
                key={tab}
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                selected={activeTab === tab}
                onPress={() => setActiveTab(tab)}
              />
            ))}
          </View>

          {activeTab === 'instructions' && (
            <Card className="mb-4">
              <Text className="mb-3 text-base font-semibold text-text">Instructions</Text>
              {exercise.instructions.map((step, i) => (
                <View key={i} className="mb-3 flex-row">
                  <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <Text className="text-xs font-bold text-primary">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-text-secondary">{step}</Text>
                </View>
              ))}

              <Text className="mb-2 mt-4 text-base font-semibold text-error">Common Mistakes</Text>
              {exercise.common_mistakes.map((mistake, i) => (
                <View key={i} className="mb-2 flex-row items-start">
                  <Ionicons name="close-circle" size={16} color="#FF5252" style={{ marginTop: 2 }} />
                  <Text className="ml-2 flex-1 text-sm text-text-secondary">{mistake}</Text>
                </View>
              ))}
            </Card>
          )}

          {activeTab === 'tips' && (
            <Card className="mb-4">
              <Text className="mb-3 text-base font-semibold text-text">Safety Tips</Text>
              {exercise.safety_tips.map((tip, i) => (
                <View key={i} className="mb-2 flex-row items-start">
                  <Ionicons name="shield-checkmark" size={16} color="#00D9A5" style={{ marginTop: 2 }} />
                  <Text className="ml-2 flex-1 text-sm text-text-secondary">{tip}</Text>
                </View>
              ))}

              <Text className="mb-2 mt-4 text-base font-semibold text-primary">Pro Tips</Text>
              {exercise.pro_tips.map((tip, i) => (
                <View key={i} className="mb-2 flex-row items-start">
                  <Ionicons name="bulb" size={16} color="#6C63FF" style={{ marginTop: 2 }} />
                  <Text className="ml-2 flex-1 text-sm text-text-secondary">{tip}</Text>
                </View>
              ))}
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="mb-4">
              <Text className="mb-3 text-base font-semibold text-text">Previous Performance</Text>
              {history.length === 0 ? (
                <Text className="text-sm text-text-secondary">
                  No history yet. Complete a workout to see your progress.
                </Text>
              ) : (
                history.slice(0, 10).map((entry) => (
                  <View
                    key={`${entry.sessionId}-${entry.set.id}`}
                    className="mb-3 border-b border-border pb-3"
                  >
                    <Text className="text-sm font-medium text-text">{entry.sessionName}</Text>
                    <Text className="text-xs text-text-muted">
                      {new Date(entry.date).toLocaleDateString()} · Set {entry.set.set_number}
                    </Text>
                    <Text className="mt-1 text-sm text-text-secondary">
                      {entry.set.reps} reps
                      {entry.set.weight_kg ? ` @ ${entry.set.weight_kg}kg` : ''}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
