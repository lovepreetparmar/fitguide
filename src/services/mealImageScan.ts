import * as ImagePicker from 'expo-image-picker';
import { supabase, isSupabaseConfigured } from './supabase';
import type { DescribedMealItem } from './mealDescribe';

export function stripBase64Prefix(data: string): string {
  return data.replace(/^data:image\/\w+;base64,/, '');
}

export async function requestMealPhotoPermissions(): Promise<boolean> {
  const camera = await ImagePicker.requestCameraPermissionsAsync();
  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return camera.granted || library.granted;
}

export async function pickMealPhotoFromLibrary(): Promise<{
  base64: string;
  mimeType: string;
} | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.55,
    base64: true,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]?.base64) return null;
  const asset = result.assets[0];
  return {
    base64: asset.base64!,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

export async function captureMealPhoto(): Promise<{
  base64: string;
  mimeType: string;
} | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.55,
    base64: true,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]?.base64) return null;
  const asset = result.assets[0];
  return {
    base64: asset.base64!,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

type AiMealItem = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export async function analyzeMealImage(
  imageBase64: string,
  mimeType = 'image/jpeg'
): Promise<DescribedMealItem[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Sign in with cloud sync to scan meal photos.');
  }

  const { data, error } = await supabase.functions.invoke('analyze-meal-image', {
    body: {
      image_base64: stripBase64Prefix(imageBase64),
      mime_type: mimeType,
    },
  });

  if (error) throw error;
  const errMsg = (data as { error?: string })?.error;
  if (errMsg) throw new Error(errMsg);

  const items = (data as { items?: AiMealItem[] })?.items;
  if (!items?.length) {
    throw new Error('No foods recognized. Try a clearer photo or use Describe meal.');
  }

  return items.map((item) => ({
    ...item,
    confidence: 'medium' as const,
    note: 'Photo estimate — adjust portions if needed',
  }));
}
