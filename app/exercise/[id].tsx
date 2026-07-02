import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ExerciseDemoPlayer } from '@/components/exercise/ExerciseDemoPlayer';
import { BodyMap } from '@/components/3d/BodyMap';
import { SimpleLineChart } from '@/components/ui/SimpleLineChart';
import { exerciseService } from '@/services/exercises';
import { workoutService } from '@/services/workout';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from '@/constants/app';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams } from 'expo-router';
import type { Exercise, MuscleGroup } from '@/types';

const ACCENT = '#0076FC';
const PRESSED_ACCENT = '#005ED4';
const LIGHT_BLUE = '#4AA3FF';
const BG = '#000000';
const CARD = '#111111';
const BORDER = 'rgba(255,255,255,0.05)';
const TEXT_SECONDARY = '#9CA3AF';
const SUCCESS = '#00D084';
const WARNING = '#FFB020';
const DANGER = '#FF5A5F';

const { height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = Math.max(320, Math.round(screenHeight * 0.4));

type DetailTab = 'instructions' | 'tips' | 'history' | 'muscles' | 'video';

function titleCase(value: string) {
  return value
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

function getEquipmentLabel(value: Exercise['equipment']) {
  if (!value.length) return 'Bodyweight';
  return value
    .map((item) => EQUIPMENT_OPTIONS.find((option) => option.id === item)?.label ?? titleCase(item))
    .join(' • ');
}

function getMovementLabel(exercise: Exercise) {
  const name = exercise.name.toLowerCase();
  if (/press|squat|deadlift|row|pull|push|lunge|dip|clean|snatch|thrust/.test(name)) {
    return 'Compound Movement';
  }
  return 'Isolation Movement';
}

function getEstimatedTime(exercise: Exercise) {
  const base = exercise.secondary_muscles.length >= 2 ? 18 : 12;
  const difficultyOffset = exercise.difficulty === 'advanced' ? 4 : exercise.difficulty === 'intermediate' ? 2 : 0;
  return `${base + difficultyOffset} min`;
}

function getRestTime(exercise: Exercise) {
  return exercise.secondary_muscles.length >= 2 ? '90-120 sec' : '60-75 sec';
}

function getCaloriesPerSet(exercise: Exercise) {
  return `${Math.max(6, Math.round(exercise.calories_per_minute * 0.75))} kcal`;
}

function splitInstructionTitle(step: string, fallbackIndex: number) {
  const lowered = step.toLowerCase();

  if (fallbackIndex === 0 || /setup|stand|grip|position/.test(lowered)) {
    return { title: 'Setup', description: step };
  }
  if (fallbackIndex === 1 || /press|drive|lift|push/.test(lowered)) {
    return { title: 'Lift', description: step };
  }
  if (fallbackIndex === 2 || /lower|return|descend/.test(lowered)) {
    return { title: 'Lower', description: step };
  }

  return { title: fallbackIndex === 3 ? 'Repeat' : `Step ${fallbackIndex + 1}`, description: step };
}

function getMuscleDescription(muscle: MuscleGroup) {
  const descriptions: Record<MuscleGroup, string> = {
    chest: 'Drives pressing power and horizontal adduction.',
    back: 'Supports posture, scapular control, and pulling strength.',
    shoulders: 'Stabilizes overhead movement and drives shoulder flexion.',
    triceps: 'Extends the elbow and finishes the press strongly.',
    biceps: 'Supports pulling mechanics and elbow flexion.',
    forearms: 'Improves grip stability and bar control.',
    abs: 'Braces the trunk and resists spinal extension.',
    obliques: 'Controls rotation and lateral trunk stability.',
    glutes: 'Creates hip drive and full-body power transfer.',
    quadriceps: 'Generates leg drive during the dip and drive phase.',
    hamstrings: 'Assists hip extension and lower body control.',
    calves: 'Transfers force into the floor during explosive extension.',
  };

  return descriptions[muscle];
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<DetailTab>('instructions');
  const [favorite, setFavorite] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

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

  const muscle = exercise ? MUSCLE_GROUPS.find((m) => m.id === exercise.primary_muscle) : undefined;
  const muscleLabel = muscle?.label ?? exercise?.primary_muscle ?? '';
  const primarySecondaryMuscles = exercise
    ? ([exercise.primary_muscle, ...exercise.secondary_muscles] as MuscleGroup[])
    : [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: BG }}>
        <Text style={{ color: TEXT_SECONDARY }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !exercise) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-5" style={{ backgroundColor: BG }}>
        <Text className="mb-4 text-lg font-semibold text-text">Exercise not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3"
          style={{ borderRadius: 30, backgroundColor: ACCENT }}
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const lastWeight = history[0]?.set.weight_kg ?? null;
  const bestWeight = history.reduce((max, entry) => Math.max(max, entry.set.weight_kg ?? 0), 0);
  const bestReps = history.reduce((max, entry) => Math.max(max, entry.set.reps), 0);
  const personalRecord = history.reduce((max, entry) => {
    const volume = (entry.set.weight_kg ?? 0) * entry.set.reps;
    return Math.max(max, volume);
  }, 0);
  const chartData = history
    .slice()
    .reverse()
    .slice(-6)
    .map((entry, index) => ({
      x: index,
      y: entry.set.weight_kg ?? entry.set.reps,
    }));
  const segmentedTabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'instructions', label: 'Instructions' },
    { id: 'tips', label: 'Tips' },
    { id: 'history', label: 'History' },
    { id: 'muscles', label: 'Muscles' },
    { id: 'video', label: 'Video' },
  ];
  const stats = [
    { label: 'Primary Muscle', value: muscleLabel },
    {
      label: 'Secondary Muscles',
      value:
        exercise.secondary_muscles
          .slice(0, 2)
          .map((item) => MUSCLE_GROUPS.find((group) => group.id === item)?.label ?? titleCase(item))
          .join(' • ') || 'None',
    },
    { label: 'Equipment', value: getEquipmentLabel(exercise.equipment) },
    { label: 'Difficulty', value: titleCase(exercise.difficulty) },
    { label: 'Estimated Time', value: getEstimatedTime(exercise) },
    { label: 'Calories / Set', value: getCaloriesPerSet(exercise) },
    { label: 'Rest Time', value: getRestTime(exercise) },
    { label: 'Movement', value: getMovementLabel(exercise) },
  ];
  const displayedInstructions = exercise.instructions.slice(0, 4).map(splitInstructionTitle);
  const displayedMistakes = exercise.common_mistakes.slice(0, 3);
  const selectedMuscleToShow = selectedMuscle ?? exercise.primary_muscle;
  const ctaTitle = history.length > 0 ? 'Start Exercise' : 'Add to Workout';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 148 }}
        >
          <View className="relative">
            <View style={{ height: HERO_HEIGHT, backgroundColor: BG }}>
              <ExerciseDemoPlayer exercise={exercise} height={HERO_HEIGHT} />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.18)', '#000000']}
                locations={[0, 0.55, 1]}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 180 }}
              />
              <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5 pt-3">
                <FloatingIconButton icon="chevron-back" onPress={() => router.back()} size="lg" />
                <FloatingIconButton
                  icon={favorite ? 'heart' : 'heart-outline'}
                  onPress={() => setFavorite((value) => !value)}
                />
              </View>
            </View>
          </View>

          <View className="px-5 pt-5">
            <View
              className="rounded-[32px] p-5"
              style={{
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: BORDER,
                marginTop: -24,
                shadowColor: ACCENT,
                shadowOffset: { width: 0, height: 18 },
                shadowOpacity: 0.2,
                shadowRadius: 28,
                elevation: 8,
              }}
            >
              <Text className="text-[34px] font-bold tracking-[-1px] text-white">{exercise.name}</Text>
              <Text className="mt-2 text-[15px] font-semibold tracking-[0.2px]" style={{ color: '#DCEBFF' }}>
                {getMovementLabel(exercise)}
              </Text>
              <Text className="mt-2 text-[15px] leading-6" style={{ color: TEXT_SECONDARY }}>
                {muscleLabel}
                {exercise.secondary_muscles.length
                  ? ` • ${exercise.secondary_muscles
                      .map((item) => MUSCLE_GROUPS.find((group) => group.id === item)?.label ?? titleCase(item))
                      .join(' • ')}`
                  : ''}
              </Text>

              <View className="mt-5 flex-row flex-wrap">
                <InfoChip icon="barbell-outline" label={getEquipmentLabel(exercise.equipment)} />
                <InfoChip icon="flame-outline" label={titleCase(exercise.difficulty)} />
                <InfoChip icon="time-outline" label={getEstimatedTime(exercise)} />
              </View>
            </View>

            <GlassSection className="mt-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[20px] font-semibold text-white">Quick Stats</Text>
                <Text className="text-sm font-medium" style={{ color: LIGHT_BLUE }}>
                  Exercise Profile
                </Text>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {stats.map((item) => (
                  <View key={item.label} className="mb-4" style={{ width: '48%' }}>
                    <Text className="text-[11px] uppercase tracking-[1.2px]" style={{ color: '#6B7280' }}>
                      {item.label}
                    </Text>
                    <Text className="mt-2 text-[15px] leading-6 text-white">{item.value}</Text>
                  </View>
                ))}
              </View>
            </GlassSection>

            <View
              className="mt-6 overflow-hidden rounded-[32px] p-5"
              style={{
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: 'rgba(0,118,252,0.18)',
                shadowColor: ACCENT,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.22,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -16,
                  right: -16,
                  width: 116,
                  height: 116,
                  borderRadius: 999,
                  backgroundColor: 'rgba(0,118,252,0.2)',
                }}
              />
              <View className="flex-row items-start">
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
                >
                    <Ionicons name="checkmark-done" size={20} color={LIGHT_BLUE} />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold uppercase tracking-[1.4px]" style={{ color: '#DCEBFF' }}>
                    Form Focus
                  </Text>
                  <Text className="mt-3 text-[16px] leading-7 text-white">
                    Control the eccentric, keep tension through the target muscle, and stop the set
                    when your positions become inconsistent.
                  </Text>
                </View>
              </View>
            </View>

            <View
              className="mt-6 rounded-[24px] p-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: BORDER }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {segmentedTabs.map((tab) => {
                  const selected = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      activeOpacity={0.88}
                      className="rounded-[20px] px-4 py-3"
                      style={{
                        backgroundColor: selected ? '#1A1A1A' : 'transparent',
                        shadowColor: selected ? ACCENT : 'transparent',
                        shadowOpacity: selected ? 0.16 : 0,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                      }}
                    >
                      <Text className={selected ? 'font-semibold text-white' : 'font-medium text-[#9CA3AF]'}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {activeTab === 'instructions' && (
              <View className="mt-6">
                <Text className="mb-3 text-[20px] font-semibold text-white">Execution Timeline</Text>
                {displayedInstructions.map((step, index) => (
                  <View key={`${step.title}-${index}`} className="mb-4 flex-row">
                    <View className="items-center pr-4">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'rgba(0,118,252,0.16)', borderWidth: 1, borderColor: 'rgba(74,163,255,0.22)' }}
                      >
                        <Text className="text-sm font-semibold text-white">{index + 1}</Text>
                      </View>
                      {index < displayedInstructions.length - 1 ? (
                        <View style={{ width: 2, flex: 1, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                      ) : null}
                    </View>
                    <GlassSection className="mb-0 flex-1">
                      <Text className="text-[18px] font-semibold text-white">{step.title}</Text>
                      <Text className="mt-3 text-[15px] leading-7" style={{ color: TEXT_SECONDARY }}>
                        {step.description}
                      </Text>
                    </GlassSection>
                  </View>
                ))}

                <Text className="mb-3 mt-2 text-[20px] font-semibold text-white">Common Mistakes</Text>
                {displayedMistakes.map((mistake) => (
                  <View
                    key={mistake}
                    className="mb-3 rounded-[28px] p-4"
                    style={{
                      backgroundColor: 'rgba(255,90,95,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,90,95,0.16)',
                    }}
                  >
                    <View className="flex-row items-start">
                      <View
                        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'rgba(255,90,95,0.14)' }}
                      >
                        <Ionicons name="warning-outline" size={18} color={DANGER} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[16px] font-semibold text-white">{mistake}</Text>
                        <Text className="mt-2 text-[14px] leading-6" style={{ color: '#F4B5B7' }}>
                          Slow the movement down and prioritize control before adding more load.
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'tips' && (
              <View className="mt-6">
                <Text className="mb-3 text-[20px] font-semibold text-white">Coaching Notes</Text>
                {[...exercise.safety_tips.slice(0, 3), ...exercise.pro_tips.slice(0, 2)].map((tip, index) => {
                  const isSafety = index < Math.min(3, exercise.safety_tips.length);
                  return (
                    <GlassSection key={`${tip}-${index}`} className="mb-3">
                      <View className="flex-row items-start">
                        <View
                          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: isSafety ? 'rgba(255,176,32,0.12)' : 'rgba(0,118,252,0.16)' }}
                        >
                          <Ionicons
                            name={isSafety ? 'shield-checkmark-outline' : 'bulb-outline'}
                            size={18}
                            color={isSafety ? WARNING : LIGHT_BLUE}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[16px] font-semibold text-white">
                            {isSafety ? 'Form Check' : 'Pro Cue'}
                          </Text>
                          <Text className="mt-2 text-[15px] leading-7" style={{ color: TEXT_SECONDARY }}>
                            {tip}
                          </Text>
                        </View>
                      </View>
                    </GlassSection>
                  );
                })}
              </View>
            )}

            {activeTab === 'history' && (
              <View className="mt-6">
                <Text className="mb-3 text-[20px] font-semibold text-white">Workout History</Text>
                {history.length === 0 ? (
                  <GlassSection>
                    <Text className="text-[15px] leading-7" style={{ color: TEXT_SECONDARY }}>
                      Complete this exercise in a workout to unlock progression insights, records, and volume trends.
                    </Text>
                  </GlassSection>
                ) : (
                  <>
                    <GlassSection className="mb-4">
                      <View className="flex-row flex-wrap justify-between">
                        <MetricTile label="Last Weight" value={lastWeight ? `${lastWeight} kg` : '--'} accent={ACCENT} />
                        <MetricTile label="Best Weight" value={bestWeight ? `${bestWeight} kg` : '--'} accent={SUCCESS} />
                        <MetricTile label="Best Reps" value={bestReps ? `${bestReps}` : '--'} accent={LIGHT_BLUE} />
                        <MetricTile label="Personal Record" value={personalRecord ? `${personalRecord} kg` : '--'} accent={WARNING} />
                      </View>
                    </GlassSection>

                    <GlassSection className="mb-4">
                      <SimpleLineChart data={chartData} color={ACCENT} height={180} label="Load trend" />
                    </GlassSection>

                    {history.slice(0, 4).map((entry) => (
                      <GlassSection key={`${entry.sessionId}-${entry.set.id}`} className="mb-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 pr-4">
                            <Text className="text-[16px] font-semibold text-white">{entry.sessionName}</Text>
                            <Text className="mt-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                              {new Date(entry.date).toLocaleDateString()}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-[16px] font-semibold text-white">
                              {entry.set.reps} reps{entry.set.weight_kg ? ` @ ${entry.set.weight_kg}kg` : ''}
                            </Text>
                            <Text className="mt-2 text-sm" style={{ color: '#DCEBFF' }}>
                              Set {entry.set.set_number}
                            </Text>
                          </View>
                        </View>
                      </GlassSection>
                    ))}
                  </>
                )}
              </View>
            )}

            {activeTab === 'muscles' && (
              <View className="mt-6">
                <Text className="text-[20px] font-semibold text-white">Target Muscles</Text>
                <Text className="mt-2 text-[15px] leading-6" style={{ color: TEXT_SECONDARY }}>
                  Tap a highlighted muscle to see how it contributes to the movement.
                </Text>
                <View className="mt-5">
                  <BodyMap
                    selectedMuscle={selectedMuscleToShow}
                    onMusclePress={setSelectedMuscle}
                    view={exercise.primary_muscle === 'back' || exercise.primary_muscle === 'triceps' ? 'back' : 'front'}
                  />
                </View>

                <GlassSection className="mt-5">
                  <Text className="text-[18px] font-semibold text-white">
                    {MUSCLE_GROUPS.find((item) => item.id === selectedMuscleToShow)?.label ?? titleCase(selectedMuscleToShow)}
                  </Text>
                  <Text className="mt-3 text-[15px] leading-7" style={{ color: TEXT_SECONDARY }}>
                    {getMuscleDescription(selectedMuscleToShow)}
                  </Text>
                  <View className="mt-4 flex-row flex-wrap">
                    {primarySecondaryMuscles.map((item, index) => (
                      <View
                        key={`${item}-${index}`}
                        className="mb-2 mr-2 rounded-full px-4 py-2"
                        style={{
                          backgroundColor: item === exercise.primary_muscle ? 'rgba(0,118,252,0.18)' : 'rgba(74,163,255,0.12)',
                          borderWidth: 1,
                          borderColor: item === exercise.primary_muscle ? 'rgba(74,163,255,0.3)' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <Text className="font-medium text-white">
                          {item === exercise.primary_muscle ? 'Primary' : 'Secondary'} •{' '}
                          {MUSCLE_GROUPS.find((group) => group.id === item)?.label ?? titleCase(item)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassSection>
              </View>
            )}

            {activeTab === 'video' && (
              <View className="mt-6">
                <Text className="mb-3 text-[20px] font-semibold text-white">Media Experience</Text>
                <GlassSection>
                  <View
                    className="items-center rounded-[28px] py-10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <View
                      className="h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
                    >
                      <Ionicons name="play-circle-outline" size={28} color={LIGHT_BLUE} />
                    </View>
                    <Text className="mt-4 text-[18px] font-semibold text-white">
                      {exercise.video_url
                        ? 'Video ready for immersive playback'
                        : 'Premium video preview coming soon'}
                    </Text>
                    <Text className="mt-3 max-w-[280px] text-center text-[15px] leading-7" style={{ color: TEXT_SECONDARY }}>
                      Watch the full movement breakdown when video playback is available for this exercise.
                    </Text>
                  </View>
                </GlassSection>
              </View>
            )}

          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.92)',
            borderTopWidth: 1,
            borderTopColor: BORDER,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout')}
            activeOpacity={0.88}
            className="overflow-hidden rounded-[30px]"
            style={{
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: 0.26,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={[LIGHT_BLUE, ACCENT, PRESSED_ACCENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 30, paddingHorizontal: 20, paddingVertical: 18 }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text className="text-[17px] font-semibold text-white">{ctaTitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FloatingIconButton({
  icon,
  onPress,
  size = 'md',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'md' | 'lg';
}) {
  const dimension = size === 'lg' ? 52 : 46;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      className="items-center justify-center rounded-full"
      style={{
        width: dimension,
        height: dimension,
        backgroundColor: 'rgba(17,17,17,0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <Ionicons name={icon} size={size === 'lg' ? 24 : 20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function GlassSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-[32px] p-5 ${className}`}
      style={{
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      {children}
    </View>
  );
}

function InfoChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      className="mb-2 mr-2 flex-row items-center rounded-full px-4 py-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: BORDER,
      }}
    >
      <Ionicons name={icon} size={15} color={LIGHT_BLUE} style={{ marginRight: 8 }} />
      <Text className="font-medium text-[#D1D5DB]">{label}</Text>
    </View>
  );
}

function MetricTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View
      className="mb-3 rounded-[24px] p-4"
      style={{
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Text className="text-[11px] uppercase tracking-[1.2px]" style={{ color: '#6B7280' }}>
        {label}
      </Text>
      <Text className="mt-3 text-[24px] font-bold" style={{ color: accent }}>
        {value}
      </Text>
    </View>
  );
}
