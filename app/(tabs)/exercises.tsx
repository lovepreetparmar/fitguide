import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { BodyMap } from '@/components/3d/BodyMap';
import { exerciseService } from '@/services/exercises';
import { MUSCLE_GROUPS } from '@/constants/app';
import type { MuscleGroup } from '@/types';

export default function ExercisesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'body'>('list');

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', selectedMuscle, search],
    queryFn: () =>
      exerciseService.getExercises({
        muscle: selectedMuscle ?? undefined,
        search: search || undefined,
      }),
  });

  if (viewMode === 'body') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <View className="px-5 pb-8">
              <Text className="mb-2 pt-2 text-2xl font-bold text-text">Body Map</Text>
              <Text className="mb-4 text-text-secondary">Tap a muscle to see exercises</Text>

              <View className="mb-4 flex-row gap-2">
                <Chip label="List" selected={false} onPress={() => setViewMode('list')} />
                <Chip label="Body Map" selected onPress={() => setViewMode('body')} />
              </View>

              <BodyMap
                selectedMuscle={selectedMuscle}
                onMusclePress={(muscle) => {
                  setSelectedMuscle(muscle);
                  setViewMode('list');
                }}
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  const filterChips = [{ id: 'all', label: 'All' }, ...MUSCLE_GROUPS];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pt-2">
            <Text className="mb-2 text-2xl font-bold text-text">Exercises</Text>
            <Text className="mb-4 text-text-secondary">
              {exercises.length} exercises in library
            </Text>

            <Input
              placeholder="Search exercises..."
              icon="search-outline"
              value={search}
              onChangeText={setSearch}
              className="mb-4"
            />

            <View className="mb-4 flex-row gap-2">
              <Chip label="List" selected onPress={() => setViewMode('list')} />
              <Chip label="Body Map" selected={false} onPress={() => setViewMode('body')} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {filterChips.map((item) => (
                <View key={item.id} className="mr-2">
                  <Chip
                    label={item.label}
                    selected={item.id === 'all' ? !selectedMuscle : selectedMuscle === item.id}
                    onPress={() =>
                      setSelectedMuscle(item.id === 'all' ? null : (item.id as MuscleGroup))
                    }
                    size="sm"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => router.push(`/exercise/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-text-secondary">
              {isLoading ? 'Loading exercises...' : 'No exercises found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
