import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const AsyncStorageAdapter = {
  getItem: async (key: string) => {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? AsyncStorageAdapter : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
