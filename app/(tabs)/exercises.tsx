import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { exerciseService } from '@/services/exercises';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from '@/constants/app';
import type { Difficulty, Exercise, MuscleGroup } from '@/types';

const ACCENT = '#0076FC';
const LIGHT_BLUE = '#4AA3FF';
const BG = '#000000';
const CARD = '#111111';
const BORDER = 'rgba(255,255,255,0.05)';
const SECONDARY = '#9CA3AF';

type QuickFilterId = 'body' | 'chest' | 'legs' | 'back' | 'shoulders' | 'arms';

const QUICK_FILTERS: Array<{ id: QuickFilterId; label: string; emoji: string }> = [
  { id: 'body', label: 'Body', emoji: 'body' },
  { id: 'chest', label: 'Chest', emoji: 'barbell' },
  { id: 'legs', label: 'Legs', emoji: 'walk' },
  { id: 'back', label: 'Back', emoji: 'fitness' },
  { id: 'shoulders', label: 'Shoulders', emoji: 'flame' },
  { id: 'arms', label: 'Arms', emoji: 'flash' },
];

const DIFFICULTY_OPTIONS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const MOVEMENT_PATTERNS = ['Push', 'Pull', 'Squat', 'Hinge', 'Rotate', 'Carry'];
const EXERCISE_TYPES = ['Machine', 'Free Weight', 'Cable', 'Bodyweight', 'Resistance Band', 'Stretching', 'Cardio'];

function titleCase(value: string) {
  return value
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

function getQuickFilterMuscles(filter: QuickFilterId): MuscleGroup[] | null {
  switch (filter) {
    case 'body':
      return null;
    case 'chest':
      return ['chest'];
    case 'back':
      return ['back'];
    case 'shoulders':
      return ['shoulders'];
    case 'legs':
      return ['quadriceps', 'hamstrings', 'glutes', 'calves'];
    case 'arms':
      return ['biceps', 'triceps', 'forearms'];
    default:
      return null;
  }
}

function matchesMuscleGroups(exercise: Exercise, muscles: MuscleGroup[]) {
  return (
    muscles.includes(exercise.primary_muscle) ||
    exercise.secondary_muscles.some((muscle) => muscles.includes(muscle))
  );
}

function getQuickFilterForMuscle(muscle: MuscleGroup): QuickFilterId {
  if (muscle === 'chest') return 'chest';
  if (muscle === 'back') return 'back';
  if (muscle === 'shoulders') return 'shoulders';
  if (['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(muscle)) return 'legs';
  if (['biceps', 'triceps', 'forearms'].includes(muscle)) return 'arms';
  return 'body';
}

function isQuickFilterSelected(
  filterId: QuickFilterId,
  quickFilter: QuickFilterId,
  selectedMuscle: MuscleGroup | null
) {
  if (filterId === 'body') {
    return quickFilter === 'body' && selectedMuscle === null;
  }

  if (selectedMuscle) {
    const muscles = getQuickFilterMuscles(filterId);
    return muscles?.includes(selectedMuscle) ?? false;
  }

  return quickFilter === filterId;
}

function matchesMovementPattern(exercise: Exercise, pattern: string) {
  const name = exercise.name.toLowerCase();
  switch (pattern) {
    case 'Push':
      return /press|push|dip/.test(name);
    case 'Pull':
      return /row|pull|curl|face pull/.test(name);
    case 'Squat':
      return /squat|split squat|lunge|leg press/.test(name);
    case 'Hinge':
      return /deadlift|hinge|good morning|thrust/.test(name);
    case 'Rotate':
      return /rotation|twist|woodchop/.test(name);
    case 'Carry':
      return /carry|walk/.test(name);
    default:
      return true;
  }
}

function matchesExerciseType(exercise: Exercise, type: string) {
  const name = exercise.name.toLowerCase();
  const equipment = exercise.equipment.join(' ').toLowerCase();

  switch (type) {
    case 'Machine':
      return /machine/.test(name) || /cables/.test(equipment);
    case 'Free Weight':
      return /barbell|dumbbells|kettlebell/.test(equipment);
    case 'Cable':
      return /cables/.test(equipment) || /cable/.test(name);
    case 'Bodyweight':
      return /bodyweight/.test(equipment);
    case 'Resistance Band':
      return /resistance_bands/.test(equipment);
    case 'Stretching':
      return /stretch|mobility|flow|yoga/.test(name);
    case 'Cardio':
      return /run|jump|bike|burpee|cardio|rope/.test(name);
    default:
      return true;
  }
}

export default function ExercisesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>('body');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const activeMuscles = useMemo(() => {
    if (selectedMuscle) return [selectedMuscle];
    return getQuickFilterMuscles(quickFilter);
  }, [quickFilter, selectedMuscle]);

  const apiMuscle = activeMuscles?.length === 1 ? activeMuscles[0] : undefined;

  const { data: exercises = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['exercises', apiMuscle, search],
    queryFn: () =>
      exerciseService.getExercises({
        muscle: apiMuscle,
        search: search || undefined,
      }),
  });

  const filteredExercises = useMemo(() => {
    let next = [...exercises];

    if (activeMuscles && activeMuscles.length > 1) {
      next = next.filter((exercise) => matchesMuscleGroups(exercise, activeMuscles));
    }

    if (selectedEquipment) {
      next = next.filter((exercise) => exercise.equipment.includes(selectedEquipment as Exercise['equipment'][number]));
    }
    if (selectedDifficulty) {
      next = next.filter((exercise) => exercise.difficulty === selectedDifficulty);
    }
    if (selectedPattern) {
      next = next.filter((exercise) => matchesMovementPattern(exercise, selectedPattern));
    }
    if (selectedType) {
      next = next.filter((exercise) => matchesExerciseType(exercise, selectedType));
    }

    return next;
  }, [activeMuscles, exercises, selectedDifficulty, selectedEquipment, selectedPattern, selectedType]);

  const activeFilterCount =
    Number(quickFilter !== 'body' || Boolean(selectedMuscle)) +
    Number(Boolean(selectedEquipment)) +
    Number(Boolean(selectedDifficulty)) +
    Number(Boolean(selectedPattern)) +
    Number(Boolean(selectedType));

  const resetFilters = () => {
    setQuickFilter('body');
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
    setSelectedPattern(null);
    setSelectedType(null);
  };

  const exerciseCountLabel = isLoading || isFetching
    ? 'Loading exercises...'
    : `${filteredExercises.length} Exercises`;

  const exerciseSubtitle = isLoading || isFetching
    ? 'Fetching your library'
    : selectedMuscle
      ? MUSCLE_GROUPS.find((item) => item.id === selectedMuscle)?.label ?? 'Filtered view'
      : quickFilter === 'body'
        ? 'Full library'
        : QUICK_FILTERS.find((item) => item.id === quickFilter)?.label ?? 'Filtered view';

  const displayedMuscle =
    selectedMuscle ??
    (getQuickFilterMuscles(quickFilter)?.length === 1 ? getQuickFilterMuscles(quickFilter)![0] : null);

  const renderHeader = () => (
    <View className="pb-5 pt-2">
      <Text className="text-[34px] font-bold tracking-tight text-white">Exercises</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[22px] font-semibold text-white">{exerciseCountLabel}</Text>
          <Text className="mt-1 text-sm font-medium text-[#9CA3AF]">{exerciseSubtitle}</Text>
        </View>
        {activeFilterCount ? (
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
          >
            <Text className="text-xs font-semibold text-[#DCEBFF]">{activeFilterCount} Filters</Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-3 max-w-[92%] text-[15px] leading-6 text-[#9CA3AF]">
        Explore exercises by muscle group, equipment, or movement.
      </Text>

      <View
        className="mt-6 flex-row items-center rounded-[24px] px-4 py-3.5"
        style={{
          backgroundColor: 'rgba(17,17,17,0.92)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.16,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        <Ionicons name="search-outline" size={18} color={SECONDARY} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises..."
          placeholderTextColor={SECONDARY}
          className="ml-3 flex-1 text-[16px] text-white"
        />
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          activeOpacity={0.85}
          className="ml-3 h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: activeFilterCount ? 'rgba(0,118,252,0.18)' : 'rgba(255,255,255,0.05)',
          }}
        >
          <Ionicons name="options-outline" size={18} color={activeFilterCount ? LIGHT_BLUE : '#FFFFFF'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {QUICK_FILTERS.map((item) => {
          const selected = isQuickFilterSelected(item.id, quickFilter, selectedMuscle);
          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              onPress={() => {
                setQuickFilter(item.id);
                setSelectedMuscle(null);
              }}
              className="mr-3 flex-row items-center rounded-full px-4 py-3"
              style={{
                backgroundColor: selected ? ACCENT : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: selected ? 'rgba(74,163,255,0.4)' : BORDER,
                transform: [{ scale: selected ? 1.02 : 1 }],
              }}
            >
              <Ionicons
                name={item.emoji as keyof typeof Ionicons.glyphMap}
                size={15}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text className={selected ? 'font-semibold text-white' : 'font-medium text-[#D1D5DB]'}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="mt-7 flex-row items-center justify-between">
        <View>
          <Text className="text-[22px] font-semibold text-white">Exercise Library</Text>
          <Text className="mt-1 text-sm text-[#9CA3AF]">Compact visual browsing</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 44, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => router.push(`/exercise/${item.id}`)}
            variant="grid"
          />
        )}
        ListEmptyComponent={
          isError ? (
            <View
              className="items-center justify-center px-6 py-16"
              style={{
                marginTop: 20,
                borderRadius: 28,
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,90,95,0.14)' }}
              >
                <Ionicons name="cloud-offline-outline" size={30} color="#FF8A8F" />
              </View>
              <Text className="mt-5 text-[20px] font-semibold text-white">Couldn&apos;t load exercises</Text>
              <Text className="mt-2 max-w-[280px] text-center text-sm leading-6 text-[#9CA3AF]">
                {error instanceof Error ? error.message : 'Something went wrong while loading the exercise library.'}
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                activeOpacity={0.85}
                className="mt-6 rounded-full px-6 py-3.5"
                style={{ backgroundColor: ACCENT }}
              >
                <Text className="font-semibold text-white">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              className="items-center justify-center px-6 py-16"
              style={{
                marginTop: 20,
                borderRadius: 28,
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(0,118,252,0.14)' }}
              >
                <Ionicons name={isLoading ? 'sync-outline' : 'search-outline'} size={30} color={LIGHT_BLUE} />
              </View>
              <Text className="mt-5 text-[20px] font-semibold text-white">
                {isLoading ? 'Loading exercises...' : 'No exercises found'}
              </Text>
              {!isLoading ? (
                <Text className="mt-2 max-w-[260px] text-center text-sm leading-6 text-[#9CA3AF]">
                  Try another muscle group or equipment.
                </Text>
              ) : null}
            </View>
          )
        }
      />

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <Pressable
          onPress={() => setShowFilters(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        >
          <Pressable
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              backgroundColor: '#0F0F10',
              borderWidth: 1,
              borderColor: BORDER,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 28,
            }}
          >
            <View className="items-center">
              <View className="h-1.5 w-12 rounded-full bg-white/10" />
            </View>
            <View className="mt-5 flex-row items-center justify-between">
              <Text className="text-[24px] font-semibold text-white">Advanced Filters</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text className="font-medium text-[#4AA3FF]">Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mt-5 max-h-[70vh]">
              <FilterSection
                title="Muscle Group"
                options={MUSCLE_GROUPS.map((item) => item.label)}
                selected={displayedMuscle ? MUSCLE_GROUPS.find((item) => item.id === displayedMuscle)?.label ?? null : null}
                onSelect={(value) => {
                  if (!value) {
                    setSelectedMuscle(null);
                    setQuickFilter('body');
                    return;
                  }
                  const muscle = MUSCLE_GROUPS.find((item) => item.label === value);
                  if (muscle) {
                    setSelectedMuscle(muscle.id as MuscleGroup);
                    setQuickFilter(getQuickFilterForMuscle(muscle.id as MuscleGroup));
                  } else {
                    setSelectedMuscle(null);
                    setQuickFilter('body');
                  }
                }}
              />
              <FilterSection
                title="Equipment"
                options={EQUIPMENT_OPTIONS.map((item) => item.label)}
                selected={selectedEquipment ? EQUIPMENT_OPTIONS.find((item) => item.id === selectedEquipment)?.label ?? null : null}
                onSelect={(value) => {
                  if (!value) {
                    setSelectedEquipment(null);
                    return;
                  }
                  const equipment = EQUIPMENT_OPTIONS.find((item) => item.label === value);
                  setSelectedEquipment(equipment?.id ?? null);
                }}
              />
              <FilterSection
                title="Difficulty"
                options={DIFFICULTY_OPTIONS.map(titleCase)}
                selected={selectedDifficulty ? titleCase(selectedDifficulty) : null}
                onSelect={(value) => setSelectedDifficulty(value ? (value.toLowerCase() as Difficulty) : null)}
              />
              <FilterSection
                title="Movement Pattern"
                options={MOVEMENT_PATTERNS}
                selected={selectedPattern}
                onSelect={(value) => setSelectedPattern(value || null)}
              />
              <FilterSection
                title="Exercise Type"
                options={EXERCISE_TYPES}
                selected={selectedType}
                onSelect={(value) => setSelectedType(value || null)}
              />
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              activeOpacity={0.85}
              className="mt-6 rounded-full py-4"
              style={{ backgroundColor: ACCENT }}
            >
              <Text className="text-center text-base font-semibold text-white">Apply Filters</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-[1.2px] text-[#9CA3AF]">
        {title}
      </Text>
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(isSelected ? '' : option)}
              activeOpacity={0.85}
              className="mb-3 mr-3 rounded-full px-4 py-3"
              style={{
                backgroundColor: isSelected ? ACCENT : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: isSelected ? 'rgba(74,163,255,0.35)' : BORDER,
              }}
            >
              <Text className={isSelected ? 'font-semibold text-white' : 'font-medium text-[#D1D5DB]'}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
