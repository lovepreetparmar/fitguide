import { supabase, isSupabaseConfigured } from './supabase';
import type { OnboardingData, Profile, User } from '@/types';

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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'fitguide://auth/callback' },
    });
    if (error) throw error;
    return data;
  },

  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'fitguide://auth/callback' },
    });
    if (error) throw error;
    return data;
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
      .single();
    if (error) return null;
    return data as Profile;
  },

  async createProfile(userId: string, onboarding: OnboardingData): Promise<Profile> {
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
      medical_limitations: onboarding.medical_limitations || null,
      previous_injuries: onboarding.previous_injuries || null,
      onboarding_completed: true,
      units: 'metric' as const,
    };

    const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
    if (error) throw error;
    return data as Profile;
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
