import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  isAppleNativeSignInAvailable,
  signInOrLinkWithAppleNative,
} from './appleNativeAuth';
import type { OnboardingData, Profile, User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const oauthRedirectTo = makeRedirectUri({
  scheme: 'fitguide',
  path: 'auth/callback',
});

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) throw new Error('No access token returned');
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
}

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string, rememberMe = true) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { ...data, rememberMe };
  },

  async signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  isAnonymousUser(user: { is_anonymous?: boolean } | null | undefined): boolean {
    return Boolean(user?.is_anonymous);
  },

  async getLinkingContext(): Promise<{ isAnonymous: boolean; userId: string | null }> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return { isAnonymous: false, userId: null };
    }
    return {
      isAnonymous: this.isAnonymousUser(data.session.user),
      userId: data.session.user.id,
    };
  },

  async linkEmailIdentity(email: string, password: string) {
    const { data, error } = await supabase.auth.updateUser({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new Error(
          'This email is already linked to another account. Sign in to that account instead.'
        );
      }
      throw error;
    }
    if (!data.user) throw new Error('Could not link email to your account');
    return data.user;
  },

  async signInWithGoogle() {
    return this.signInWithOAuth('google');
  },

  async signInWithApple() {
    const { isAnonymous } = await this.getLinkingContext();
    if (await isAppleNativeSignInAvailable()) {
      try {
        return await signInOrLinkWithAppleNative(isAnonymous);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === 'Sign in cancelled') throw error;
        console.warn('[auth] Native Apple sign-in failed, falling back to OAuth:', message);
      }
    }
    return this.signInWithOAuth('apple');
  },

  async linkOAuthIdentity(provider: 'google' | 'apple') {
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: oauthRedirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new Error(
          'This provider is already linked to another account. Sign in to that account instead.'
        );
      }
      throw error;
    }
    if (!data?.url) throw new Error('Could not start account linking');

    const result = await WebBrowser.openAuthSessionAsync(data.url, oauthRedirectTo, {
      preferEphemeralSession: true,
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Sign in cancelled');
    }
    if (result.type !== 'success') {
      throw new Error('Account linking failed');
    }

    await createSessionFromUrl(result.url);
    return authService.getUser();
  },

  async signInWithOAuth(provider: 'google' | 'apple') {
    const { isAnonymous } = await this.getLinkingContext();
    if (isAnonymous) {
      return this.linkOAuthIdentity(provider);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: oauthRedirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Could not start sign in');

    const result = await WebBrowser.openAuthSessionAsync(data.url, oauthRedirectTo, {
      preferEphemeralSession: true,
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Sign in cancelled');
    }
    if (result.type !== 'success') {
      throw new Error('Sign in failed');
    }

    await createSessionFromUrl(result.url);
    return authService.getUser();
  },

  async invokeDeleteAccount(): Promise<void> {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
    });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(String((data as { error: string }).error));
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'fitguide://auth/reset-password',
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async deleteAllUserData(userId: string) {
    const tables = [
      'workout_sessions',
      'workout_plans',
      'goals',
      'progress',
      'measurements',
      'nutrition_logs',
      'water_logs',
      'recovery',
      'achievements',
      'notifications',
      'notification_preferences',
      'body_scans',
      'profiles',
    ] as const;

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId);
      if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
        throw error;
      }
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? '',
      created_at: data.user.created_at,
    };
  },

  async getOAuthDisplayName(): Promise<string | undefined> {
    const { data } = await supabase.auth.getUser();
    const metadata = data.user?.user_metadata;
    return metadata?.full_name ?? metadata?.name ?? undefined;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return null;
    return data as Profile | null;
  },

  async saveProfile(userId: string, onboarding: OnboardingData): Promise<Profile> {
    const profile = {
      user_id: userId,
      name: onboarding.name,
      age: onboarding.age,
      height_cm: onboarding.height_cm,
      weight_kg: onboarding.weight_kg,
      gender: onboarding.gender,
      goal: onboarding.goal,
      experience: onboarding.experience,
      workout_days: onboarding.workout_days,
      workout_time_minutes: onboarding.workout_time_minutes,
      equipment: onboarding.equipment,
      medical_limitations: onboarding.medical_limitations?.trim() || null,
      previous_injuries: onboarding.previous_injuries?.trim() || null,
      onboarding_completed: true,
      units: 'metric' as const,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        throw new Error(
          'Database tables are missing. Open Supabase → SQL Editor and run database/migrations/001_initial_schema.sql'
        );
      }
      throw new Error(error.message || 'Could not save your profile');
    }

    return data as Profile;
  },

  async createProfile(userId: string, onboarding: OnboardingData): Promise<Profile> {
    return this.saveProfile(userId, onboarding);
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async deleteAccount(userId: string) {
    try {
      await authService.invokeDeleteAccount();
    } catch {
      await authService.deleteAllUserData(userId);
      await authService.signOut();
    }
  },
};
