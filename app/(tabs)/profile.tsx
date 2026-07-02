import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { FITNESS_GOALS, EXPERIENCE_LEVELS } from '@/constants/app';
import { nutritionService } from '@/services/nutrition';
import { progressService } from '@/services/progress';

const COLORS = {
  primary: '#0076FC',
  primaryPressed: '#005ED4',
  lightBlue: '#4AA3FF',
  background: '#000000',
  card: '#111111',
  glass: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.05)',
  primaryText: '#FFFFFF',
  secondaryText: '#9CA3AF',
  success: '#00D084',
  warning: '#FFB020',
  danger: '#FF5A5F',
};

const ACHIEVEMENT_LIBRARY = {
  first_workout: { icon: '🏆', title: 'First Workout', subtitle: 'Started the journey' },
  ten_workouts: { icon: '🔥', title: '14 Day Streak', subtitle: 'Consistency unlocked' },
  thirty_day_streak: { icon: '⚡', title: 'Personal Record', subtitle: 'Momentum builder' },
  volume: { icon: '💪', title: '10000 kg Lifted', subtitle: 'Volume milestone' },
} as const;

const DEFAULT_GOALS = [
  { label: 'Weight Goal', current: 75, target: 72, unit: 'kg' },
  { label: 'Body Fat Goal', current: 18, target: 15, unit: '%' },
  { label: 'Protein Goal', current: 90, target: 180, unit: 'g' },
  { label: 'Hydration Goal', current: 2.1, target: 3, unit: 'L' },
  { label: 'Workout Goal', current: 12, target: 16, unit: 'sessions' },
];

const DEFAULT_TODAY_GOAL = 'Push Day';
const DEFAULT_BODY_FAT = 18;
type EquipmentCardItem = {
  key: string;
  icon: string;
  label: string;
  available: boolean;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  tone?: 'default' | 'danger';
};

type AccountAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'default' | 'danger';
  subtitle?: string;
  onPress?: () => void;
};

function GlassCard({
  children,
  style,
  compact = false,
}: {
  children: React.ReactNode;
  style?: object | object[];
  compact?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: compact ? 0 : 20,
          shadowColor: '#000000',
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function GroupLabel({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <Text
      style={{
        color: danger ? 'rgba(255,138,143,0.9)' : COLORS.secondaryText,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        marginBottom: 10,
        paddingHorizontal: 4,
      }}
    >
      {label}
    </Text>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 14, paddingHorizontal: 2 }}>
      <Text
        style={{
          color: COLORS.primaryText,
          fontSize: 22,
          fontWeight: '700',
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: COLORS.secondaryText, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  hideBorder = false,
  showChevron = true,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  hideBorder?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.settingsRow,
        !hideBorder && styles.settingsRowBorder,
        disabled && styles.settingsRowDisabled,
      ]}
    >
      <View
        style={[
          styles.settingsIcon,
          danger ? styles.settingsIconDanger : styles.settingsIconDefault,
        ]}
      >
        <Ionicons name={icon} size={19} color={danger ? COLORS.danger : '#DCEBFF'} />
      </View>

      <View style={styles.settingsCopy}>
        <Text
          style={[styles.settingsTitle, danger && styles.settingsTitleDanger]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.settingsSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="rgba(156,163,175,0.75)"
          style={styles.settingsChevron}
        />
      ) : (
        <View style={styles.settingsChevronSpacer} />
      )}
    </TouchableOpacity>
  );
}

function SettingsListCard({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  const isDanger = variant === 'danger';

  return (
    <View
      style={[
        styles.settingsCard,
        isDanger ? styles.settingsCardDanger : styles.settingsCardDefault,
      ]}
    >
      {isDanger ? (
        <LinearGradient
          colors={['rgba(255,90,95,0.08)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}

function ProgressRail({
  progress,
  color = COLORS.primary,
  trackColor = 'rgba(255,255,255,0.08)',
  height = 8,
}: {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const width = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(width, {
      toValue: clampedProgress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, width]);

  return (
    <View
      style={{
        width: '100%',
        height,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: trackColor,
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: width.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function CountUpText({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  style,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  style?: object;
}) {
  const animated = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animated.addListener(({ value: nextValue }) => {
      setDisplayValue(nextValue);
    });

    Animated.timing(animated, {
      toValue: value,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animated.removeListener(listener);
    };
  }, [animated, value]);

  return (
    <Text style={style}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </Text>
  );
}

function startCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, signOut } = useAuthStore();
  const { user } = useAuthStore();
  const { streak, achievements, cachedWorkouts, cachedNutrition, waterIntakeMl, clearProgressData } =
    useAppStore();
  const resetWorkoutStore = useWorkoutStore((state) => state.reset);
  const [clearingProgress, setClearingProgress] = useState(false);
  const avatarScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(24)).current;
  const aiGlow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/splash');
        },
      },
    ]);
  };

  const handleClearProgressData = () => {
    Alert.alert(
      'Clear Progress Data?',
      'This permanently deletes your workout history, personal records, streak, achievements, and progress stats. Your profile and account stay intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            if (!profile?.user_id) return;

            setClearingProgress(true);
            try {
              await progressService.clearProgressData(profile.user_id);
              clearProgressData();
              resetWorkoutStore();

              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['workout-sessions'] }),
                queryClient.invalidateQueries({ queryKey: ['recent-sessions'] }),
                queryClient.invalidateQueries({ queryKey: ['progress'] }),
                queryClient.invalidateQueries({ queryKey: ['measurements'] }),
                queryClient.invalidateQueries({ queryKey: ['recovery'] }),
                queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
                queryClient.invalidateQueries({ queryKey: ['exercise-history'] }),
              ]);

              Alert.alert('Progress Cleared', 'You can start fresh from the Workout tab.');
            } catch (error) {
              Alert.alert(
                'Could Not Clear Data',
                error instanceof Error ? error.message : 'Something went wrong. Please try again.'
              );
            } finally {
              setClearingProgress(false);
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (label: string) => {
    Alert.alert(label, 'This feature is coming soon.');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const avatarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 1.03,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(avatarScale, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiGlow, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(aiGlow, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    avatarLoop.start();
    glowLoop.start();
    shimmerLoop.start();

    return () => {
      avatarLoop.stop();
      glowLoop.stop();
      shimmerLoop.stop();
    };
  }, [aiGlow, avatarScale, contentOpacity, contentTranslate, shimmer]);

  const goalLabel = FITNESS_GOALS.find((g) => g.id === profile?.goal)?.label ?? 'Not set';
  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.id === profile?.experience)?.label ?? 'Not set';

  const macroTargets = useMemo(() => {
    if (!profile?.weight_kg || !profile.goal) {
      return { calories: 2600, protein: 180, water: 3000 };
    }

    const calculated = nutritionService.calculateMacros(profile.weight_kg, profile.goal);
    return {
      calories: calculated.calories,
      protein: calculated.protein,
      water: 3000,
    };
  }, [profile?.goal, profile?.weight_kg]);

  const todayNutrition = cachedNutrition ?? {
    id: 'local',
    user_id: user?.id ?? 'guest',
    date: new Date().toISOString().split('T')[0],
    calories: 0,
    protein_g: 90,
    carbs_g: 140,
    fat_g: 55,
    fiber_g: 24,
    water_ml: waterIntakeMl || 2100,
  };

  const bmi = useMemo(() => {
    if (!profile?.height_cm || !profile?.weight_kg) return 23.4;
    const heightM = profile.height_cm / 100;
    return profile.weight_kg / (heightM * heightM);
  }, [profile?.height_cm, profile?.weight_kg]);

  const equipmentCards = useMemo<EquipmentCardItem[]>(() => {
    const available = new Set(profile?.equipment ?? []);
    return [
      { key: 'barbell', icon: '🏋', label: 'Barbell', available: available.has('barbell') },
      { key: 'dumbbells', icon: '🏋', label: 'Dumbbells', available: available.has('dumbbells') },
      { key: 'bench', icon: '🪑', label: 'Bench', available: available.has('bench') },
      { key: 'squat_rack', icon: '🏗', label: 'Squat Rack', available: available.has('squat_rack') },
      { key: 'cables', icon: '🎯', label: 'Cable Machine', available: available.has('cables') },
      { key: 'bodyweight', icon: '💪', label: 'Bodyweight', available: available.has('bodyweight') },
    ];
  }, [profile?.equipment]);

  const achievementCards = useMemo(() => {
    const mapped = achievements
      .map((id) => ACHIEVEMENT_LIBRARY[id as keyof typeof ACHIEVEMENT_LIBRARY])
      .filter(Boolean);

    if (mapped.length >= 4) return mapped.slice(0, 4);

    return [...mapped, ACHIEVEMENT_LIBRARY.first_workout, ACHIEVEMENT_LIBRARY.ten_workouts, ACHIEVEMENT_LIBRARY.volume, ACHIEVEMENT_LIBRARY.thirty_day_streak]
      .filter((item, index, array) => array.findIndex((entry) => entry.title === item.title) === index)
      .slice(0, 4);
  }, [achievements]);

  const monthlySummary = useMemo(() => {
    const workouts = cachedWorkouts.length;
    const hours =
      cachedWorkouts.length > 0
        ? cachedWorkouts.reduce((sum, session) => sum + (session.duration_minutes ?? 0), 0) / 60
        : 0;
    const liftedKg =
      cachedWorkouts.length > 0
        ? cachedWorkouts.reduce(
            (sum, session) =>
              sum +
              session.sets.reduce(
                (setSum, set) => setSum + ((set.weight_kg ?? 0) * (set.reps ?? 0)),
                0
              ),
            0
          )
        : 0;

    return {
      workouts,
      hours,
      liftedKg,
      streak,
    };
  }, [cachedWorkouts, streak]);

  const goalCards = useMemo(() => {
    const hydratedLiters = Number((todayNutrition.water_ml / 1000).toFixed(1));
    return DEFAULT_GOALS.map((goal) => {
      if (goal.label === 'Weight Goal') {
        return {
          ...goal,
          current: profile?.weight_kg ?? goal.current,
          target: 72,
        };
      }

      if (goal.label === 'Protein Goal') {
        return {
          ...goal,
          current: todayNutrition.protein_g,
          target: macroTargets.protein,
        };
      }

      if (goal.label === 'Hydration Goal') {
        return {
          ...goal,
          current: hydratedLiters,
          target: 3,
        };
      }

      if (goal.label === 'Workout Goal') {
        return {
          ...goal,
          current: monthlySummary.workouts,
          target: 16,
        };
      }

      return goal;
    });
  }, [macroTargets.protein, monthlySummary.workouts, profile?.weight_kg, todayNutrition.protein_g, todayNutrition.water_ml]);

  const menuGroups: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-circle-outline', label: 'Profile', subtitle: 'Name, photo, and athlete identity' },
        { icon: 'body-outline', label: 'Body Measurements', subtitle: 'Height, weight, and body stats' },
        { icon: 'flag-outline', label: 'Goals', subtitle: 'Targets and training direction' },
        { icon: 'nutrition-outline', label: 'Nutrition', subtitle: 'Calories, macros, and hydration' },
        { icon: 'barbell-outline', label: 'Workout Preferences', subtitle: 'Split, duration, and focus' },
        { icon: 'hardware-chip-outline', label: 'Training Equipment', subtitle: 'Available gear and setup' },
        { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Reminders and coaching alerts' },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: 'color-palette-outline', label: 'Appearance', subtitle: 'Theme and visual preferences' },
        { icon: 'heart-outline', label: 'Health Integration', subtitle: 'Apple Health and recovery data' },
        { icon: 'shield-outline', label: 'Privacy', subtitle: 'Permissions and personal data' },
        { icon: 'download-outline', label: 'Export Data', subtitle: 'Download your fitness records' },
        { icon: 'information-circle-outline', label: 'About', subtitle: 'Version, terms, and app info' },
        { icon: 'help-buoy-outline', label: 'Support', subtitle: 'Help center and contact options' },
      ],
    },
  ];

  const accountActions: AccountAction[] = [
    {
      label: 'Sync Data',
      icon: 'sync-outline',
      tone: 'default',
      subtitle: 'Refresh workouts and recovery',
    },
    {
      label: 'Backup',
      icon: 'cloud-upload-outline',
      tone: 'default',
      subtitle: 'Create a secure cloud snapshot',
    },
    {
      label: 'Sign Out',
      icon: 'log-out-outline',
      tone: 'default',
      subtitle: 'Sign out from this device',
      onPress: handleSignOut,
    },
    {
      label: 'Clear Progress Data',
      icon: 'refresh-outline',
      tone: 'danger',
      subtitle: clearingProgress ? 'Clearing...' : 'Reset workouts, stats, and streak',
      onPress: clearingProgress ? () => undefined : handleClearProgressData,
    },
    {
      label: 'Delete Account',
      icon: 'trash-outline',
      tone: 'danger',
      subtitle: 'Permanently remove your profile',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          }}
        >
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 28,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                color: COLORS.primaryText,
                fontSize: 34,
                fontWeight: '700',
                letterSpacing: -0.9,
              }}
            >
              Profile
            </Text>
            <Pressable
              onPress={() => handleMenuPress('Edit Profile')}
              style={({ pressed }) => [
                {
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? COLORS.primaryPressed : COLORS.glass,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.primaryText} />
            </Pressable>
          </View>

          <GlassCard style={{ marginBottom: 22, paddingTop: 28 }}>
            <LinearGradient
              colors={['rgba(0,118,252,0.32)', 'rgba(74,163,255,0.15)', 'rgba(0,0,0,0)']}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{
                position: 'absolute',
                top: -24,
                left: 40,
                width: 210,
                height: 210,
                borderRadius: 999,
              }}
            />

            <View style={{ alignItems: 'center' }}>
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                <View
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 56,
                    padding: 3,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    shadowColor: COLORS.primary,
                    shadowOpacity: 0.35,
                    shadowRadius: 22,
                    shadowOffset: { width: 0, height: 12 },
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 53,
                      backgroundColor: '#0C0C0C',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {profile?.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ color: COLORS.primaryText, fontSize: 40, fontWeight: '700' }}>
                        {profile?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                      </Text>
                    )}
                  </View>
                </View>
              </Animated.View>

              <Text
                style={{
                  marginTop: 18,
                  color: COLORS.primaryText,
                  fontSize: 28,
                  fontWeight: '700',
                  letterSpacing: -0.8,
                }}
              >
                {profile?.name ?? 'Athlete'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {[
                  { key: 'goal', label: goalLabel },
                  { key: 'experience', label: experienceLabel },
                ].map((pill) => (
                  <View
                    key={pill.key}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Text style={{ color: COLORS.secondaryText, fontSize: 13, fontWeight: '600' }}>{pill.label}</Text>
                  </View>
                ))}
              </View>

              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  gap: 10,
                  marginTop: 22,
                }}
              >
                {[
                  { key: 'streak', icon: '🔥', value: `${streak} Day Streak` },
                  { key: 'achievements', icon: '🏆', value: `${achievements.length} Achievements` },
                  {
                    key: 'frequency',
                    icon: '📅',
                    value: `${profile?.workout_days ?? 4}/wk`,
                  },
                ].map((item) => (
                  <View
                    key={item.key}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 12,
                      borderRadius: 18,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</Text>
                    <Text
                      style={{
                        color: COLORS.primaryText,
                        fontSize: 12,
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                      numberOfLines={2}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          <SectionTitle title="Today's Status" subtitle="Recovery, fueling, and readiness at a glance." />
          <GlassCard style={{ marginBottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <View>
                <Text style={{ color: COLORS.secondaryText, fontSize: 13 }}>Recovery</Text>
                <CountUpText
                  value={100}
                  suffix="%"
                  style={{ color: COLORS.primaryText, fontSize: 28, fontWeight: '700', marginTop: 4 }}
                />
              </View>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: 'rgba(0,208,132,0.14)',
                }}
              >
                <Text style={{ color: COLORS.success, fontSize: 13, fontWeight: '600' }}>Ready to Push</Text>
              </View>
            </View>

            {[
              {
                label: "Today's Goal",
                value: DEFAULT_TODAY_GOAL,
                progress: 1,
                color: COLORS.lightBlue,
              },
              {
                label: 'Calories',
                value: `${todayNutrition.calories} / ${macroTargets.calories}`,
                progress: todayNutrition.calories / macroTargets.calories,
                color: COLORS.primary,
              },
              {
                label: 'Protein',
                value: `${todayNutrition.protein_g} / ${macroTargets.protein}g`,
                progress: todayNutrition.protein_g / macroTargets.protein,
                color: COLORS.lightBlue,
              },
              {
                label: 'Water',
                value: `${(todayNutrition.water_ml / 1000).toFixed(1)} / 3L`,
                progress: todayNutrition.water_ml / 3000,
                color: COLORS.success,
              },
            ].map((item) => (
              <View key={item.label} style={{ marginBottom: item.label === 'Water' ? 0 : 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: COLORS.secondaryText, fontSize: 14 }}>{item.label}</Text>
                  <Text style={{ color: COLORS.primaryText, fontSize: 14, fontWeight: '600' }}>{item.value}</Text>
                </View>
                <ProgressRail progress={item.progress} color={item.color} />
              </View>
            ))}
          </GlassCard>

          <SectionTitle title="Body Metrics" subtitle="Compact numbers with a stronger hierarchy." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 16 }}>
            {[
              { label: 'Weight', value: `${profile?.weight_kg ?? 75} kg` },
              { label: 'Height', value: `${profile?.height_cm ?? 175} cm` },
              { label: 'Body Fat', value: `${DEFAULT_BODY_FAT}%` },
              { label: 'BMI', value: bmi.toFixed(1) },
              { label: 'Experience', value: experienceLabel },
              { label: 'Goal', value: goalLabel },
              { label: 'Workout Duration', value: `${profile?.workout_time_minutes ?? 60} min` },
            ].map((metric) => (
              <View key={metric.label} style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}>
                <GlassCard style={{ minHeight: 108, justifyContent: 'space-between' }}>
                  <Text style={{ color: COLORS.secondaryText, fontSize: 13 }}>{metric.label}</Text>
                  <Text
                    style={{
                      color: COLORS.primaryText,
                      fontSize: 22,
                      fontWeight: '700',
                      letterSpacing: -0.5,
                    }}
                  >
                    {metric.value}
                  </Text>
                </GlassCard>
              </View>
            ))}
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}>
              <GlassCard style={{ minHeight: 108, justifyContent: 'space-between' }}>
                <Text style={{ color: COLORS.secondaryText, fontSize: 13 }}>Weekly Frequency</Text>
                <Text
                  style={{
                    color: COLORS.primaryText,
                    fontSize: 22,
                    fontWeight: '700',
                    letterSpacing: -0.5,
                  }}
                >
                  {profile?.workout_days ?? 4} days
                </Text>
              </GlassCard>
            </View>
          </View>

          <SectionTitle title="Available Equipment" subtitle="Built as premium hardware cards instead of chips." />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 6, marginBottom: 18 }}
          >
            {equipmentCards.map((item) => (
              <GlassCard key={item.key} style={{ width: 150, marginRight: 12, paddingVertical: 18 }}>
                <Text style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</Text>
                <Text style={{ color: COLORS.primaryText, fontSize: 16, fontWeight: '600' }}>{item.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: item.available ? COLORS.success : COLORS.secondaryText,
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ color: COLORS.secondaryText, fontSize: 13 }}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>

          <SectionTitle title="Achievements" subtitle="Celebrate momentum with a more collectible feel." />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 6, marginBottom: 18 }}
          >
            {achievementCards.map((item, index) => (
              <GlassCard
                key={`${item.title}-${index}`}
                style={{
                  width: 190,
                  marginRight: 12,
                  paddingVertical: 18,
                  backgroundColor: '#121212',
                }}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 28,
                  }}
                />
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: 52,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    transform: [
                      {
                        translateX: shimmer.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-90, 220],
                        }),
                      },
                      { rotate: '18deg' },
                    ],
                  }}
                />
                <Text style={{ fontSize: 28, marginBottom: 18 }}>{item.icon}</Text>
                <Text style={{ color: COLORS.primaryText, fontSize: 17, fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: COLORS.secondaryText, fontSize: 13, marginTop: 8 }}>{item.subtitle}</Text>
              </GlassCard>
            ))}
          </ScrollView>

          <SectionTitle title="Monthly Summary" subtitle="A denser athlete dashboard recap for this month." />
          <GlassCard style={{ marginBottom: 22 }}>
            <Text style={{ color: COLORS.secondaryText, fontSize: 13, marginBottom: 18 }}>This Month</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              {[
                { label: 'Workouts', value: monthlySummary.workouts, suffix: '' },
                { label: 'Hours', value: monthlySummary.hours, suffix: '', decimals: 0 },
                { label: 'kg Lifted', value: monthlySummary.liftedKg, suffix: '', decimals: 0 },
                { label: 'Day Streak', value: monthlySummary.streak, suffix: '', decimals: 0 },
              ].map((item) => (
                <View key={item.label} style={{ width: '50%', paddingHorizontal: 6, marginBottom: 16 }}>
                  <View
                    style={{
                      borderRadius: 22,
                      padding: 16,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <CountUpText
                      value={item.value}
                      decimals={item.decimals ?? 0}
                      style={{
                        color: COLORS.primaryText,
                        fontSize: 24,
                        fontWeight: '700',
                        letterSpacing: -0.5,
                      }}
                    />
                    <Text style={{ color: COLORS.secondaryText, fontSize: 13, marginTop: 6 }}>{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <SectionTitle title="Goals" subtitle="Progress cards with stronger visual rhythm and blue motion." />
          <View style={{ marginBottom: 22 }}>
            {goalCards.map((goal) => {
              const progress = goal.target === 0 ? 0 : Math.min(goal.current / goal.target, 1);
              return (
                <GlassCard key={goal.label} style={{ marginBottom: 10, padding: 16 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      gap: 12,
                    }}
                  >
                    <Text
                      style={{ color: COLORS.primaryText, fontSize: 16, fontWeight: '600', flex: 1 }}
                      numberOfLines={1}
                    >
                      {goal.label}
                    </Text>
                    <Text style={{ color: COLORS.secondaryText, fontSize: 14, fontWeight: '500' }}>
                      {goal.current} / {goal.target}
                      {goal.unit}
                    </Text>
                  </View>
                  <ProgressRail progress={progress} color={COLORS.primary} height={10} />
                </GlassCard>
              );
            })}
          </View>

          <SectionTitle title="Settings" subtitle="Profile, preferences, and app controls." />
          {menuGroups.map((group) => (
            <View key={group.title} style={{ marginBottom: 8 }}>
              <GroupLabel label={group.title} />
              <SettingsListCard>
                {group.items.map((item, index) => (
                  <SettingsRow
                    key={item.label}
                    icon={item.icon}
                    title={item.label}
                    subtitle={item.subtitle}
                    onPress={() => handleMenuPress(item.label)}
                    hideBorder={index === group.items.length - 1}
                  />
                ))}
              </SettingsListCard>
            </View>
          ))}

          <SectionTitle title="Account Center" subtitle="Sync, backup, and sign out." />
          <SettingsListCard>
            <LinearGradient
              colors={['rgba(74,163,255,0.12)', 'rgba(0,118,252,0.02)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
            {accountActions
              .filter((action) => action.tone === 'default')
              .map((action, index, actions) => (
                <SettingsRow
                  key={action.label}
                  icon={action.icon}
                  title={action.label}
                  subtitle={action.subtitle}
                  onPress={action.onPress ?? (() => handleMenuPress(action.label))}
                  hideBorder={index === actions.length - 1}
                  showChevron={action.label !== 'Sign Out'}
                />
              ))}
          </SettingsListCard>

          <GroupLabel label="Danger Zone" danger />
          <SettingsListCard variant="danger">
            {accountActions
              .filter((action) => action.tone === 'danger')
              .map((action, index, actions) => (
                <SettingsRow
                  key={action.label}
                  icon={action.icon}
                  title={action.label}
                  subtitle={action.subtitle}
                  onPress={action.onPress ?? (() => handleMenuPress(action.label))}
                  danger
                  hideBorder={index === actions.length - 1}
                  showChevron={false}
                  disabled={action.label === 'Clear Progress Data' && clearingProgress}
                />
              ))}
          </SettingsListCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingsCardDefault: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  settingsCardDanger: {
    borderColor: 'rgba(255,90,95,0.18)',
    backgroundColor: 'rgba(28,8,9,0.95)',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 68,
    width: '100%',
  },
  settingsRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingsRowDisabled: {
    opacity: 0.55,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
    borderWidth: 1,
  },
  settingsIconDefault: {
    backgroundColor: 'rgba(0,118,252,0.12)',
    borderColor: 'rgba(74,163,255,0.14)',
  },
  settingsIconDanger: {
    backgroundColor: 'rgba(255,90,95,0.12)',
    borderColor: 'rgba(255,90,95,0.18)',
  },
  settingsCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingRight: 8,
  },
  settingsTitle: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsTitleDanger: {
    color: COLORS.danger,
  },
  settingsSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  settingsChevron: {
    marginLeft: 4,
    flexShrink: 0,
  },
  settingsChevronSpacer: {
    width: 18,
    flexShrink: 0,
  },
});
