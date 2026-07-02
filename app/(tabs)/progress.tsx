import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { BodyMap } from '@/components/3d/BodyMap';
import { PremiumActionButton } from '@/components/ui/PremiumActionButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MUSCLE_GROUPS } from '@/constants/app';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { progressService, recoveryService } from '@/services/progress';
import { nutritionService } from '@/services/nutrition';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { formatDate, formatDuration } from '@/utils/format';
import { getCoachInsight } from '@/utils/workoutHistory';
import type { Measurement, MuscleGroup, ProgressEntry, RecoveryData, RecoveryStatus } from '@/types';

const COLORS = {
  accent: '#0076FC',
  accentPressed: '#005ED4',
  accentLight: '#4AA3FF',
  background: '#000000',
  card: '#111111',
  border: 'rgba(255,255,255,0.05)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  success: '#00D084',
  warning: '#FFB020',
  danger: '#FF5A5F',
};

const PERIODS = ['week', 'month', 'year', 'lifetime'] as const;
type Period = (typeof PERIODS)[number];

type ChartPoint = {
  key: string;
  label: string;
  dateLabel: string;
  value: number;
};

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRecoveryTone(status: RecoveryStatus) {
  if (status === 'recovered') return COLORS.accent;
  if (status === 'recovering') return COLORS.warning;
  return COLORS.danger;
}

function getRecoveryLabel(status: RecoveryStatus) {
  if (status === 'recovered') return 'Recovered';
  if (status === 'recovering') return 'Fatigued';
  return 'Overworked';
}

function getReadinessLabel(score: number) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Moderate';
  return 'Recover';
}

function getPeriodLabel(period: Period) {
  if (period === 'week') return 'This week';
  if (period === 'month') return 'This month';
  if (period === 'year') return 'This year';
  return 'All time';
}

function getShortDateLabel(date: string, period: Period) {
  const parsed = new Date(date);
  if (period === 'week') {
    return parsed.toLocaleDateString('en-US', { weekday: 'short' });
  }
  if (period === 'month') {
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (period === 'year') {
    return parsed.toLocaleDateString('en-US', { month: 'short' });
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getLongDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

function buildChartPoints(progress: ProgressEntry[], period: Period): ChartPoint[] {
  return progress
    .filter((entry) => entry.weight_kg != null)
    .map((entry, index) => ({
      key: `${entry.date}-${index}`,
      label: getShortDateLabel(entry.date, period),
      dateLabel: getLongDateLabel(entry.date),
      value: entry.weight_kg ?? 0,
    }));
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`overflow-hidden rounded-[28px] border bg-[#111111] ${className}`}
      style={{
        borderColor: COLORS.border,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.14,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      }}
    >
      {children}
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View className="mb-4 flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-[22px] font-semibold tracking-[-0.4px] text-white">{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <View
      className="mb-7 flex-row rounded-[22px] p-1"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.border }}
    >
      {PERIODS.map((period) => {
        const selected = period === value;
        return (
          <Pressable
            key={period}
            onPress={() => onChange(period)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              paddingVertical: 11,
              paddingHorizontal: 6,
              backgroundColor: selected ? COLORS.accent : 'transparent',
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className={`text-center text-[13px] capitalize ${
                selected ? 'font-semibold text-white' : 'font-medium text-[#9CA3AF]'
              }`}
            >
              {period}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TrainingSummaryCard({
  periodLabel,
  workouts,
  volumeKg,
  calories,
  averageDuration,
  weight,
  bmi,
}: {
  periodLabel: string;
  workouts: number;
  volumeKg: number;
  calories: number;
  averageDuration: number;
  weight: number;
  bmi: number;
}) {
  const metrics = [
    { label: 'Workouts', value: `${workouts}` },
    { label: 'Volume', value: `${formatCompact(volumeKg)} kg` },
    { label: 'Calories', value: formatCompact(calories) },
    { label: 'Avg Duration', value: averageDuration ? formatDuration(averageDuration) : '—' },
    { label: 'Weight', value: `${weight.toFixed(1)} kg` },
    { label: 'BMI', value: bmi.toFixed(1) },
  ];

  return (
    <GlassCard className="mb-6">
      <LinearGradient
        colors={['rgba(74,163,255,0.3)', 'rgba(0,118,252,0.14)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="p-6">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#7FB8FF]">
          {periodLabel}
        </Text>
        <Text className="mt-3 text-[28px] font-bold tracking-[-0.8px] text-white">
          Training summary
        </Text>
        <View className="mt-6 flex-row flex-wrap">
          {metrics.map((metric, index) => (
            <View
              key={metric.label}
              className={`mb-4 w-1/2 ${index % 2 === 0 ? 'pr-2' : 'pl-2'}`}
            >
              <View className="rounded-[22px] border border-white/5 bg-black/20 p-4">
                <Text className="text-sm text-[#9CA3AF]">{metric.label}</Text>
                <Text className="mt-2 text-[24px] font-semibold tracking-[-0.5px] text-white">
                  {metric.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}

function InteractiveWeightChart({ data }: { data: ChartPoint[] }) {
  const [selectedKey, setSelectedKey] = useState(data[data.length - 1]?.key);
  const width = 332;
  const height = 188;
  const padding = 18;
  const selectedPoint = data.find((point) => point.key === selectedKey) ?? data[data.length - 1];

  const max = Math.max(...data.map((point) => point.value), 1);
  const min = Math.min(...data.map((point) => point.value), max - 1);
  const range = Math.max(max - min, 1);
  const points = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? width - padding} ${height - padding} L ${points[0]?.x ?? padding} ${height - padding} Z`;

  return (
    <GlassCard className="mb-6">
      <View className="p-6">
        <SectionHeader
          title="Body Trend"
          subtitle="Weight from your check-ins"
          trailing={
            selectedPoint ? (
              <View className="items-end">
                <Text className="text-[28px] font-bold tracking-[-0.8px] text-white">
                  {selectedPoint.value.toFixed(1)} kg
                </Text>
                <Text className="mt-1 text-xs text-[#9CA3AF]">{selectedPoint.dateLabel}</Text>
              </View>
            ) : null
          }
        />
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <SvgLinearGradient id="progressLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={COLORS.accentLight} />
              <Stop offset="100%" stopColor={COLORS.accent} />
            </SvgLinearGradient>
            <SvgLinearGradient id="progressFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(74,163,255,0.3)" />
              <Stop offset="100%" stopColor="rgba(0,118,252,0.02)" />
            </SvgLinearGradient>
          </Defs>
          {[0.2, 0.5, 0.8].map((step) => (
            <Path
              key={step}
              d={`M ${padding} ${height * step} L ${width - padding} ${height * step}`}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
          <Path d={areaPath} fill="url(#progressFill)" />
          <Path d={linePath} fill="none" stroke="url(#progressLine)" strokeWidth="4" strokeLinecap="round" />
          {points.map((point) => {
            const selected = point.key === selectedPoint?.key;
            return (
              <React.Fragment key={point.key}>
                {selected ? <Circle cx={point.x} cy={point.y} r="12" fill="rgba(0,118,252,0.12)" /> : null}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={selected ? '5.5' : '4'}
                  fill="#06111E"
                  stroke={selected ? '#8CC2FF' : '#4AA3FF'}
                  strokeWidth={selected ? '3' : '2'}
                />
              </React.Fragment>
            );
          })}
        </Svg>
        <View className="mt-4 flex-row justify-between">
          {points.map((point) => {
            const selected = point.key === selectedPoint?.key;
            return (
              <Pressable key={point.key} onPress={() => setSelectedKey(point.key)} className="flex-1 items-center px-1">
                <Text className={`text-xs ${selected ? 'font-semibold text-white' : 'text-[#7A7A7A]'}`}>
                  {point.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
}

function CompactRecoveryCard({
  score,
  readiness,
  recoveredCount,
  needsRestCount,
}: {
  score: number;
  readiness: string;
  recoveredCount: number;
  needsRestCount: number;
}) {
  const size = 74;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="mb-6">
      <View className="p-6">
        <SectionHeader title="Recovery" subtitle="Based on your recent training load" />
        <View className="flex-row items-center">
          <View className="mr-5">
            <Svg width={size} height={size}>
              <Defs>
                <SvgLinearGradient id="recoveryRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={COLORS.accentLight} />
                  <Stop offset="100%" stopColor={COLORS.accent} />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#recoveryRing)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-[20px] font-bold text-white">{score}%</Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="mb-3 flex-row items-center justify-between rounded-[22px] bg-black/20 px-4 py-3">
              <Text className="text-sm text-[#9CA3AF]">Readiness</Text>
              <Text className="text-sm font-semibold text-white">{readiness}</Text>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-[22px] bg-black/20 px-4 py-4">
                <Text className="text-xs uppercase tracking-[1.6px] text-[#7FB8FF]">Ready</Text>
                <Text className="mt-2 text-xl font-semibold text-white">{recoveredCount}</Text>
              </View>
              <View className="flex-1 rounded-[22px] bg-black/20 px-4 py-4">
                <Text className="text-xs uppercase tracking-[1.6px] text-[#7FB8FF]">Needs Rest</Text>
                <Text className="mt-2 text-xl font-semibold text-white">{needsRestCount}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

function StatTile({
  label,
  value,
  accent = COLORS.accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View className="mb-3 w-1/2 px-1.5">
      <View className="rounded-[24px] border border-white/5 bg-[#111111] px-4 py-4">
        <View className="mb-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
        <Text className="text-[22px] font-semibold tracking-[-0.4px] text-white">{value}</Text>
        <Text className="mt-1 text-sm text-[#9CA3AF]">{label}</Text>
      </View>
    </View>
  );
}

function WeeklyActivityCard({
  activity,
}: {
  activity: { label: string; value: number }[];
}) {
  const max = Math.max(...activity.map((item) => item.value), 1);

  return (
    <GlassCard className="mb-6">
      <View className="p-6">
        <SectionHeader title="Weekly Activity" subtitle="Completed workouts this calendar week" />
        <View className="flex-row items-end justify-between">
          {activity.map((item) => {
            const height = 24 + (item.value / max) * 110;
            return (
              <View key={item.label} className="flex-1 items-center">
                <Text className="mb-3 text-xs font-medium text-[#7A7A7A]">{item.value}</Text>
                <LinearGradient
                  colors={['rgba(74,163,255,0.95)', 'rgba(0,118,252,0.95)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ height, width: 20, borderRadius: 999 }}
                />
                <Text className="mt-3 text-xs text-[#9CA3AF]">{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
}

function GoalRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-white">{label}</Text>
        <Text className="text-sm font-medium text-[#9CA3AF]">{value}</Text>
      </View>
      <ProgressBar progress={progress} color={COLORS.accent} height={10} />
    </View>
  );
}

function RecentWorkoutRow({
  name,
  date,
  duration,
  calories,
  onPress,
}: {
  name: string;
  date: string;
  duration: number | null;
  calories: number | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-[24px] border border-white/5 bg-black/20 px-4 py-4"
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
      >
        <Ionicons name="barbell-outline" size={18} color={COLORS.accentLight} />
      </View>
      <View className="min-w-0 flex-1 pr-3">
        <Text className="text-[15px] font-semibold text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="mt-1 text-sm text-[#9CA3AF]">{formatDate(date)}</Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold text-white">
          {duration ? formatDuration(duration) : '—'}
        </Text>
        {calories ? (
          <Text className="mt-1 text-xs text-[#9CA3AF]">{calories} cal</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function EmptyAnalyticsState({ onPress }: { onPress: () => void }) {
  return (
    <GlassCard className="mb-6">
      <LinearGradient
        colors={['rgba(74,163,255,0.24)', 'rgba(0,118,252,0.06)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="items-center px-6 py-10">
        <View
          className="mb-5 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,118,252,0.14)' }}
        >
          <Ionicons name="trending-up-outline" size={30} color={COLORS.accentLight} />
        </View>
        <Text className="text-center text-[28px] font-bold tracking-[-0.7px] text-white">
          Start tracking your progress
        </Text>
        <Text className="mt-3 text-center text-sm leading-6 text-[#9CA3AF]">
          Complete workouts to unlock training stats, personal records, and weekly activity.
        </Text>
        <PremiumActionButton title="Start a Workout" onPress={onPress} style={{ marginTop: 24 }} />
      </View>
    </GlassCard>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { streak, waterIntakeMl } = useAppStore();
  const [period, setPeriod] = useState<Period>('month');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>('chest');
  const servicePeriod = period === 'lifetime' ? 'lifetime' : period;

  const {
    periodSessions,
    totalWorkouts,
    weeklyVolumeKg,
    caloriesBurned,
    averageDuration,
    trainingDays,
    weeklyActivity,
    personalRecords,
    workoutsThisWeek,
  } = useWorkoutHistory(period);

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', profile?.user_id, servicePeriod],
    queryFn: () => progressService.getProgress(profile?.user_id ?? '', servicePeriod),
    enabled: !!profile,
  });

  const { data: recoveryResponse = [] } = useQuery({
    queryKey: ['recovery', profile?.user_id],
    queryFn: () => recoveryService.getRecoveryData(profile?.user_id ?? ''),
    enabled: !!profile && profile.user_id !== 'guest',
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['measurements', profile?.user_id],
    queryFn: () => progressService.getMeasurements(profile?.user_id ?? ''),
    enabled: !!profile && profile.user_id !== 'guest',
  });

  const { data: nutrition } = useQuery({
    queryKey: ['nutrition', profile?.user_id],
    queryFn: () => nutritionService.getTodayLog(profile?.user_id ?? ''),
    enabled: !!profile && profile.user_id !== 'guest',
  });

  const recovery = recoveryResponse.length > 0 ? recoveryResponse : recoveryService.generateDefaultRecovery();
  const chartPoints = useMemo(() => buildChartPoints(progress, period), [progress, period]);
  const latestProgress = progress[progress.length - 1];
  const latestMeasurement = (measurements[0] as Measurement | undefined) ?? undefined;
  const fallbackWeight = profile?.weight_kg ?? 75;
  const weight = latestProgress?.weight_kg ?? latestMeasurement?.weight_kg ?? fallbackWeight;
  const bodyFat = latestProgress?.body_fat_percent ?? latestMeasurement?.body_fat_percent ?? null;
  const bmi = profile?.height_cm ? weight / (profile.height_cm / 100) ** 2 : 23.4;
  const recoveryScore = recoveryService.getOverallRecoveryScore(recovery);
  const recoveredCount = recovery.filter((item) => item.status === 'recovered').length;
  const needsRestCount = recovery.filter((item) => item.status !== 'recovered').length;
  const consistencyTarget = Math.max(profile?.workout_days ?? 4, 1);
  const consistency = clamp((workoutsThisWeek / consistencyTarget) * 100, 0, 100);
  const averageIntensity =
    totalWorkouts > 0 ? clamp(Math.round(weeklyVolumeKg / totalWorkouts / 50), 35, 95) : 0;
  const coachMessage = getCoachInsight({
    sessions: periodSessions,
    recoveryScore,
    streak,
    workoutsThisWeek,
    weeklyTarget: consistencyTarget,
    period,
  });
  const muscleColors = Object.fromEntries(
    recovery.map((item) => [item.muscle_group, getRecoveryTone(item.status)])
  ) as Partial<Record<MuscleGroup, string>>;
  const selectedMuscleRecovery = recovery.find((item) => item.muscle_group === selectedMuscle) ?? recovery[0];
  const workoutGoalProgress = clamp((workoutsThisWeek / consistencyTarget) * 100, 0, 100);
  const proteinGoal = Math.round(weight * 2);
  const proteinActual = Math.round(nutrition?.protein_g ?? 0);
  const hydrationGoalMl = Math.round(weight * 35);
  const hydrationActual = nutrition?.water_ml ?? waterIntakeMl;
  const hasWorkoutAnalytics = periodSessions.length > 0;
  const hasBodyAnalytics = chartPoints.length > 1;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-8 pt-2">
          <View className="mb-7 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[36px] font-bold tracking-[-1px] text-white">Progress</Text>
              <Text className="mt-2 text-base text-[#9CA3AF]">
                Training output, recovery, and milestones.
              </Text>
            </View>
            {streak > 0 ? (
              <LinearGradient
                colors={[COLORS.accentLight, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-full px-4 py-3"
              >
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base">🔥</Text>
                  <Text className="text-sm font-semibold text-white">{streak} Day Streak</Text>
                </View>
              </LinearGradient>
            ) : null}
          </View>

          <SegmentedControl value={period} onChange={setPeriod} />

          {!hasWorkoutAnalytics ? <EmptyAnalyticsState onPress={() => router.push('/(tabs)/workout')} /> : null}

          {hasWorkoutAnalytics ? (
            <TrainingSummaryCard
              periodLabel={getPeriodLabel(period)}
              workouts={totalWorkouts}
              volumeKg={weeklyVolumeKg}
              calories={caloriesBurned}
              averageDuration={averageDuration}
              weight={weight}
              bmi={bmi}
            />
          ) : null}

          {hasBodyAnalytics ? <InteractiveWeightChart data={chartPoints} /> : null}

          {hasWorkoutAnalytics ? (
            <Pressable onPress={() => router.push('/(tabs)/workout')}>
              <GlassCard className="mb-6">
                <LinearGradient
                  colors={['rgba(0,118,252,0.18)', 'rgba(0,118,252,0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
                <View className="p-6">
                  <View className="flex-row items-start">
                    <View
                      className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
                    >
                      <Ionicons name="analytics" size={22} color={COLORS.accentLight} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#7FB8FF]">
                        Training Insight
                      </Text>
                      <Text className="mt-2 text-base leading-7 text-white">{coachMessage}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          ) : null}

          <CompactRecoveryCard
            score={recoveryScore}
            readiness={getReadinessLabel(recoveryScore)}
            recoveredCount={recoveredCount}
            needsRestCount={needsRestCount}
          />

          <GlassCard className="mb-6">
            <View className="p-6">
              <SectionHeader
                title="Muscle Recovery"
                subtitle="Tap a muscle group to inspect readiness"
                trailing={
                  <View className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <Text className="text-xs font-medium text-[#D8E9FF]">
                      {selectedMuscleRecovery ? getRecoveryLabel(selectedMuscleRecovery.status) : 'Recovered'}
                    </Text>
                  </View>
                }
              />
              <BodyMap
                selectedMuscle={selectedMuscle ?? undefined}
                onMusclePress={setSelectedMuscle}
                muscleColors={muscleColors}
              />
              {selectedMuscleRecovery ? (
                <View className="mt-5 rounded-[24px] border border-white/5 bg-black/20 p-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-lg font-semibold capitalize text-white">
                      {MUSCLE_GROUPS.find((muscle) => muscle.id === selectedMuscleRecovery.muscle_group)?.label ??
                        selectedMuscleRecovery.muscle_group}
                    </Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: getRecoveryTone(selectedMuscleRecovery.status) }}
                    >
                      {selectedMuscleRecovery.score}%
                    </Text>
                  </View>
                  <Text className="text-sm leading-6 text-[#9CA3AF]">
                    {selectedMuscleRecovery.status === 'recovered'
                      ? 'Fully recovered and ready for quality work.'
                      : selectedMuscleRecovery.status === 'recovering'
                        ? 'Some fatigue remains. Keep intensity controlled today.'
                        : 'High fatigue detected. Prioritize recovery or switch focus.'}
                  </Text>
                </View>
              ) : null}
            </View>
          </GlassCard>

          {hasWorkoutAnalytics ? (
            <View className="mb-6">
              <SectionHeader title="Performance Stats" subtitle={`Filtered to ${period}`} />
              <View className="-mx-1.5 flex-row flex-wrap">
                <StatTile label="Workouts" value={`${totalWorkouts}`} />
                <StatTile label="Training Volume" value={`${formatCompact(weeklyVolumeKg)} kg`} />
                <StatTile label="Calories Burned" value={formatCompact(caloriesBurned)} accent={COLORS.success} />
                <StatTile label="Avg Duration" value={averageDuration ? `${averageDuration} min` : '—'} />
                <StatTile label="Training Days" value={`${trainingDays}`} />
                <StatTile label="Weekly Consistency" value={`${Math.round(consistency)}%`} accent={COLORS.success} />
                <StatTile
                  label="Personal Records"
                  value={`${personalRecords.length}`}
                  accent={COLORS.warning}
                />
                <StatTile label="Load Index" value={averageIntensity ? `${averageIntensity}%` : '—'} accent={COLORS.accentLight} />
              </View>
            </View>
          ) : null}

          {personalRecords.length > 0 ? (
            <View className="mb-6">
              <SectionHeader title="Personal Records" subtitle="Best sets from your completed workouts" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {personalRecords.map((record) => (
                  <Pressable key={record.id} onPress={() => router.push(`/exercise/${record.exerciseId}`)}>
                    <GlassCard className="mr-4 w-[220px]">
                      <LinearGradient
                        colors={['rgba(74,163,255,0.2)', 'rgba(0,118,252,0.04)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="absolute inset-0"
                      />
                      <View className="p-5">
                        <Text className="text-2xl">🏆</Text>
                        <Text className="mt-5 text-base font-medium text-[#9CA3AF]" numberOfLines={2}>
                          {record.title}
                        </Text>
                        <Text className="mt-2 text-[30px] font-bold tracking-[-0.6px] text-white">
                          {record.value}
                        </Text>
                        <Text className="mt-2 text-xs text-[#7FB8FF]">{record.detail}</Text>
                      </View>
                    </GlassCard>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {hasWorkoutAnalytics ? (
            <GlassCard className="mb-6">
              <View className="p-6">
                <SectionHeader title="Recent Workouts" subtitle="Your latest completed sessions" />
                {periodSessions.slice(0, 5).map((session) => (
                  <RecentWorkoutRow
                    key={session.id}
                    name={session.name}
                    date={session.completed_at ?? session.started_at}
                    duration={session.duration_minutes}
                    calories={session.calories_burned}
                    onPress={() => router.push('/(tabs)/workout')}
                  />
                ))}
              </View>
            </GlassCard>
          ) : null}

          {hasWorkoutAnalytics ? <WeeklyActivityCard activity={weeklyActivity} /> : null}

          <GlassCard className="mb-6">
            <View className="p-6">
              <SectionHeader title="Goals" subtitle="Progress toward your current targets" />
              <GoalRow
                label="Weekly Workout Goal"
                value={`${workoutsThisWeek} / ${consistencyTarget} sessions`}
                progress={workoutGoalProgress}
              />
              {bodyFat != null ? (
                <GoalRow
                  label="Body Fat"
                  value={`${bodyFat.toFixed(1)}% logged`}
                  progress={clamp(100 - bodyFat, 10, 100)}
                />
              ) : null}
              {nutrition || waterIntakeMl > 0 ? (
                <>
                  <GoalRow
                    label="Protein Today"
                    value={`${proteinActual} / ${proteinGoal} g`}
                    progress={clamp((proteinActual / proteinGoal) * 100, 0, 100)}
                  />
                  <GoalRow
                    label="Hydration Today"
                    value={`${(hydrationActual / 1000).toFixed(1)} / ${(hydrationGoalMl / 1000).toFixed(1)} L`}
                    progress={clamp((hydrationActual / hydrationGoalMl) * 100, 0, 100)}
                  />
                </>
              ) : null}
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
