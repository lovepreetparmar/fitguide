import {
  canSyncUserToSupabase,
  createLocalUserId,
  isLegacyOrLocalUserId,
  isLocalEntityId,
} from '@/utils/userId';

describe('userId utils', () => {
  it('treats legacy guest and demo ids as non-syncable', () => {
    expect(isLegacyOrLocalUserId('guest')).toBe(true);
    expect(isLegacyOrLocalUserId('demo')).toBe(true);
    expect(canSyncUserToSupabase('guest')).toBe(false);
  });

  it('creates local user ids with prefix', () => {
    const id = createLocalUserId();
    expect(id.startsWith('local:')).toBe(true);
    expect(isLegacyOrLocalUserId(id)).toBe(true);
  });

  it('detects local entity ids', () => {
    expect(isLocalEntityId('local_abc')).toBe(true);
    expect(isLocalEntityId('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });
});
