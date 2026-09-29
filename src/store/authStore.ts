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
import { recoveryService } from '@/services/progress';
import { isSupabaseConfigured } from '@/services/supabase';
import { formatAuthError, isSupabaseSignupDatabaseError } from '@/utils/authErrors';
import { createLocalUserId, isLegacyGuestId, isLegacyOrLocalUserId } from '@/utils/userId';
import { runPostAuthMigration } from '@/services/accountMigration';

interface AuthStore extends AuthState {
  onboardingData: Partial<OnboardingData>;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  completeOnboarding: (data?: OnboardingData) => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  deleteAccountSecure: () => Promise<void>;
}

function emptyProfileForUser(userId: string, name = 'Athlete'): Profile {
  const now = new Date().toISOString();
  return {
    id: `profile_${userId}`,
    user_id: userId,
    name,
    age: null,
    height_cm: null,
    weight_kg: null,
    gender: null,
    goal: null,
    experience: null,
    workout_days: null,
    workout_time_minutes: null,
    equipment: [],
    medical_limitations: null,
    previous_injuries: null,
    avatar_url: null,
    units: 'metric',
    onboarding_completed: false,
    created_at: now,
    updated_at: now,
  };
}

function mapSupabaseUser(authUser: {
  id: string;
  email?: string | null;
  created_at?: string;
  is_anonymous?: boolean;
}): User {
  return {
    id: authUser.id,
    email: authUser.email ?? (authUser.is_anonymous ? 'guest@fitguide.app' : ''),
    created_at: authUser.created_at ?? new Date().toISOString(),
  };
}

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
          const previousUserId = get().user?.id;
          if (!isSupabaseConfigured) {
            const user: User = {
              id: createLocalUserId(),
              email,
              created_at: new Date().toISOString(),
            };
            set({
              user,
              profile: emptyProfileForUser(user.id, email.split('@')[0]),
              isAuthenticated: true,
              isGuest: false,
              rememberMe,
            });
            return;
          }
          const { user: authUser } = await authService.signIn(email, password, rememberMe);
          if (authUser) {
            const user = mapSupabaseUser(authUser);
            let profile = await profileService.getProfile(user.id);
            await runPostAuthMigration(previousUserId, user.id, profile ?? get().profile);
            if (!profile && get().profile) profile = get().profile;
            set({ user, profile, isAuthenticated: true, isGuest: false, rememberMe });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true });
        try {
          const previousUserId = get().user?.id;
          if (!isSupabaseConfigured) {
            const user: User = {
              id: createLocalUserId(),
              email,
              created_at: new Date().toISOString(),
            };
            set({
              user,
              profile: emptyProfileForUser(user.id, email.split('@')[0]),
              isAuthenticated: true,
              isGuest: false,
            });
            return;
          }
          const { isAnonymous } = await authService.getLinkingContext();
          let authUser;
          if (isAnonymous) {
            authUser = await authService.linkEmailIdentity(email, password);
          } else {
            const data = await authService.signUp(email, password);
            authUser = data.user;
            if (authUser && !data.session) {
              throw new Error(
                'Check your email to confirm your account, then sign in with your password.'
              );
            }
          }
          if (authUser) {
            const user = mapSupabaseUser(authUser);
            let profile = await profileService.getProfile(user.id);
            await runPostAuthMigration(previousUserId, user.id, profile ?? get().profile);
            if (!profile) {
              profile =
                get().profile?.onboarding_completed
                  ? get().profile
                  : emptyProfileForUser(user.id, email.split('@')[0]);
            }
            set({
              user,
              profile,
              isAuthenticated: true,
              isGuest: false,
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const previousUserId = get().user?.id;
          const user = await authService.signInWithGoogle();
          if (!user) throw new Error('Could not complete Google sign in');
          let profile = await profileService.getProfile(user.id);
          await runPostAuthMigration(previousUserId, user.id, profile ?? get().profile);
          if (!profile && get().profile) profile = get().profile;
          const displayName = profile ? undefined : await authService.getOAuthDisplayName();
          set((state) => ({
            user,
            profile,
            isAuthenticated: true,
            isGuest: false,
            rememberMe: true,
            onboardingData: displayName
              ? { ...state.onboardingData, name: displayName }
              : state.onboardingData,
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithApple: async () => {
        set({ isLoading: true });
        try {
          const previousUserId = get().user?.id;
          const user = await authService.signInWithApple();
          if (!user) throw new Error('Could not complete Apple sign in');
          let profile = await profileService.getProfile(user.id);
          await runPostAuthMigration(previousUserId, user.id, profile ?? get().profile);
          if (!profile && get().profile) profile = get().profile;
          const displayName = profile ? undefined : await authService.getOAuthDisplayName();
          set((state) => ({
            user,
            profile,
            isAuthenticated: true,
            isGuest: false,
            rememberMe: true,
            onboardingData: displayName
              ? { ...state.onboardingData, name: displayName }
              : state.onboardingData,
          }));
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

      signInAsGuest: async () => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured) {
            const user: User = {
              id: createLocalUserId(),
              email: 'guest@fitguide.app',
              created_at: new Date().toISOString(),
            };
            set({
              user,
              profile: emptyProfileForUser(user.id, 'Guest'),
              isAuthenticated: true,
              isGuest: true,
              isLoading: false,
            });
            return;
          }

          try {
            const { user: authUser } = await authService.signInAnonymously();
            if (!authUser) throw new Error('Could not start guest session');

            const user = mapSupabaseUser(authUser);
            let profile = await profileService.getProfile(user.id);
            if (!profile) {
              profile = emptyProfileForUser(user.id, 'Guest');
            }

            set({
              user,
              profile,
              isAuthenticated: true,
              isGuest: true,
              isLoading: false,
            });
          } catch (anonError) {
            const message = formatAuthError(anonError);
            if (!isSupabaseSignupDatabaseError(message)) {
              throw anonError;
            }
            // Supabase trigger/RLS blocked anonymous signup — local guest (no cloud user row).
            const user: User = {
              id: createLocalUserId(),
              email: 'guest@fitguide.app',
              created_at: new Date().toISOString(),
            };
            set({
              user,
              profile: emptyProfileForUser(user.id, 'Guest'),
              isAuthenticated: true,
              isGuest: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      completeOnboarding: async (data) => {
        const { user, onboardingData } = get();
        if (!user) throw new Error('You must be signed in to continue.');

        const fullData = data ?? (onboardingData as OnboardingData);
        set({ onboardingData: fullData });

        if (isSupabaseConfigured && !isLegacyOrLocalUserId(user.id)) {
          const profile = await profileService.saveProfile(user.id, fullData);
          await recoveryService.initializeForUser(user.id);
          set({ profile });
          return;
        }

        set({
          profile: {
            ...emptyProfileForUser(user.id, fullData.name),
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
            medical_limitations: fullData.medical_limitations || null,
            previous_injuries: fullData.previous_injuries || null,
            onboarding_completed: true,
          },
        });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const persisted = get();
          if (
            persisted.user &&
            isLegacyGuestId(persisted.user.id) &&
            isSupabaseConfigured
          ) {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isGuest: false,
            });
          }

          if (!isSupabaseConfigured) {
            set({ isLoading: false });
            return;
          }

          const session = await authService.getSession();
          if (session?.user) {
            const user = mapSupabaseUser(session.user);
            const isGuest = authService.isAnonymousUser(session.user);
            const profile = await profileService.getProfile(user.id);
            set({ user, profile, isAuthenticated: true, isGuest });
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

      deleteAccount: async () => {
        const { user } = get();
        if (!user) return;
        if (isSupabaseConfigured && !isLegacyOrLocalUserId(user.id)) {
          await profileService.deleteAccount(user.id);
        } else {
          await get().signOut();
        }
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isGuest: false,
          onboardingData: {},
        });
      },

      deleteAccountSecure: async () => {
        const { user } = get();
        if (!user) return;
        if (!isSupabaseConfigured || isLegacyOrLocalUserId(user.id)) {
          await get().signOut();
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isGuest: false,
            onboardingData: {},
          });
          return;
        }
        try {
          await authService.invokeDeleteAccount();
        } finally {
          try {
            await authService.signOut();
          } catch {
            /* session may already be invalid */
          }
        }
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isGuest: false,
          onboardingData: {},
        });
      },
    }),
    {
      name: 'fitguide-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.isGuest || state.rememberMe ? state.user : null,
        profile: state.isGuest || state.rememberMe ? state.profile : null,
        isAuthenticated: state.isGuest || state.rememberMe ? state.isAuthenticated : false,
        isGuest: state.isGuest,
        rememberMe: state.rememberMe,
        onboardingData: state.onboardingData,
      }),
    }
  )
);
