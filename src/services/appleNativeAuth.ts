import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import type { User } from '@/types';

export async function isAppleNativeSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

async function buildAppleNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );
  return { rawNonce, hashedNonce };
}

export async function requestAppleIdToken(): Promise<{
  identityToken: string;
  rawNonce: string;
  fullName?: string;
}> {
  const { rawNonce, hashedNonce } = await buildAppleNonce();

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ERR_REQUEST_CANCELED'
    ) {
      throw new Error('Sign in cancelled');
    }
    throw error;
  }

  if (!credential.identityToken) {
    throw new Error('Apple Sign In did not return an identity token');
  }

  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
    .filter(Boolean)
    .join(' ');

  return {
    identityToken: credential.identityToken,
    rawNonce,
    fullName: fullName || undefined,
  };
}

async function applyAppleFullName(fullName?: string) {
  if (!fullName) return;
  await supabase.auth.updateUser({
    data: { full_name: fullName, name: fullName },
  });
}

function mapAuthUser(authUser: {
  id: string;
  email?: string | null;
  created_at?: string;
}): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    created_at: authUser.created_at ?? new Date().toISOString(),
  };
}

export async function signInOrLinkWithAppleNative(isAnonymous: boolean): Promise<User> {
  const { identityToken, rawNonce, fullName } = await requestAppleIdToken();

  if (isAnonymous) {
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'apple',
      token: identityToken,
      nonce: rawNonce,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Could not link Apple to your account');
    await applyAppleFullName(fullName);
    return mapAuthUser(data.user);
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Could not complete Apple sign in');
  await applyAppleFullName(fullName);
  return mapAuthUser(data.user);
}
