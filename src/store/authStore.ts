import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthState,
  OnboardingData,
  Profile,
  User,
} from '@/types';
import { authService, profileService } from '@/services/auth';
import { isSupabaseConfigured } from '@/services/supabase';

interface AuthStore extends AuthState {
  onboardingData: Partial<OnboardingData>;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
  completeOnboarding: () => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const GUEST_USER: User = {
  id: 'guest',
  email: 'guest@fitguide.app',
  created_at: new Date().toISOString(),
};

const GUEST_PROFILE: Profile = {
  id: 'guest_profile',
  user_id: 'guest',
  name: 'Athlete',
  age: 28,
  height_cm: 175,
  weight_kg: 75,
  gender: 'male',
  goal: 'build_muscle',
  experience: 'intermediate',
  workout_days: 4,
  workout_time_minutes: 60,
  equipment: ['barbell', 'dumbbells', 'bench', 'squat_rack', 'cables', 'pull_up_bar', 'bodyweight'],
  medical_limitations: null,
  previous_injuries: null,
  avatar_url: null,
  units: 'metric',
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isGuest: false,
      onboardingData: {},
      rememberMe: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setOnboardingData: (data) =>
        set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),

      signIn: async (email, password, rememberMe = true) => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured) {
            const user: User = { id: 'demo', email, created_at: new Date().toISOString() };
            set({
              user,
              profile: { ...GUEST_PROFILE, user_id: user.id, name: email.split('@')[0] },
              isAuthenticated: true,
              isGuest: false,
              rememberMe,
            });
            return;
          }
          const { user: authUser } = await authService.signIn(email, password, rememberMe);
          if (authUser) {
            const user: User = {
              id: authUser.id,
              email: authUser.email ?? email,
              created_at: authUser.created_at,
            };
            const profile = await profileService.getProfile(user.id);
            set({ user, profile, isAuthenticated: true, isGuest: false, rememberMe });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured) {
            const user: User = { id: 'demo', email, created_at: new Date().toISOString() };
            set({ user, isAuthenticated: true, isGuest: false });
            return;
          }
          const { user: authUser } = await authService.signUp(email, password);
          if (authUser) {
            const user: User = {
              id: authUser.id,
              email: authUser.email ?? email,
              created_at: authUser.created_at,
            };
            set({ user, isAuthenticated: true, isGuest: false });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        if (isSupabaseConfigured) {
          await authService.signOut();
        }
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isGuest: false,
          onboardingData: {},
        });
      },

      signInAsGuest: () => {
        set({
          user: GUEST_USER,
          profile: GUEST_PROFILE,
          isAuthenticated: true,
          isGuest: true,
          isLoading: false,
        });
      },

      completeOnboarding: async () => {
        const { user, onboardingData } = get();
        if (!user) return;

        const fullData = onboardingData as OnboardingData;
        if (isSupabaseConfigured) {
          const profile = await profileService.createProfile(user.id, fullData);
          set({ profile });
        } else {
          set({
            profile: {
              ...GUEST_PROFILE,
              user_id: user.id,
              name: fullData.name,
              age: fullData.age,
              height_cm: fullData.height_cm,
              weight_kg: fullData.weight_kg,
              gender: fullData.gender,
              goal: fullData.goal,
              experience: fullData.experience,
              workout_days: fullData.workout_days,
              workout_time_minutes: fullData.workout_time_minutes,
              equipment: fullData.equipment,
              medical_limitations: fullData.medical_limitations,
              previous_injuries: fullData.previous_injuries,
              onboarding_completed: true,
            },
          });
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured) {
            const state = get();
            if (state.isAuthenticated && state.user) {
              set({ isLoading: false });
              return;
            }
            set({ isLoading: false });
            return;
          }

          const session = await authService.getSession();
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email ?? '',
              created_at: session.user.created_at,
            };
            const profile = await profileService.getProfile(user.id);
            set({ user, profile, isAuthenticated: true, isGuest: false });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        if (isSupabaseConfigured) {
          await authService.resetPassword(email);
        }
      },
    }),
    {
      name: 'fitguide-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        profile: state.rememberMe ? state.profile : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        isGuest: state.rememberMe ? state.isGuest : false,
        rememberMe: state.rememberMe,
        onboardingData: state.onboardingData,
      }),
    }
  )
);
