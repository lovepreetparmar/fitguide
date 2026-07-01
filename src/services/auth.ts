import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from './supabase';
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

  async signInWithGoogle() {
    return this.signInWithOAuth('google');
  },

  async signInWithApple() {
    return this.signInWithOAuth('apple');
  },

  async signInWithOAuth(provider: 'google' | 'apple') {
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
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) throw error;
    await authService.signOut();
  },
};
