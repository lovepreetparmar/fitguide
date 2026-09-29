import * as Crypto from 'expo-crypto';
import { isSupabaseConfigured } from '@/services/supabase';

const LOCAL_USER_PREFIX = 'local:';

/** IDs that must never be written to Supabase user-owned tables. */
export function isLegacyGuestId(userId: string): boolean {
  return userId === 'guest' || userId === 'demo';
}

export function isLegacyOrLocalUserId(userId: string): boolean {
  return isLegacyGuestId(userId) || userId.startsWith(LOCAL_USER_PREFIX);
}

export function isLocalAppUserId(userId: string): boolean {
  return userId.startsWith(LOCAL_USER_PREFIX);
}

export function createLocalUserId(): string {
  return `${LOCAL_USER_PREFIX}${Crypto.randomUUID()}`;
}

export function createLocalEntityId(): string {
  return `local_${Crypto.randomUUID()}`;
}

export function isLocalEntityId(id: string): boolean {
  return id.startsWith('local_');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function canSyncUserToSupabase(userId: string): boolean {
  if (!isSupabaseConfigured) return false;
  if (isLegacyOrLocalUserId(userId)) return false;
  return UUID_RE.test(userId);
}
