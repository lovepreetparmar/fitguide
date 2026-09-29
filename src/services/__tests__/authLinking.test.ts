import { isLegacyGuestId, isLocalAppUserId } from '@/utils/userId';

describe('account linking user id helpers', () => {
  it('identifies legacy guest ids', () => {
    expect(isLegacyGuestId('guest')).toBe(true);
    expect(isLegacyGuestId('demo')).toBe(true);
    expect(isLegacyGuestId('local:abc')).toBe(false);
  });

  it('identifies local app user ids', () => {
    expect(isLocalAppUserId('local:550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isLocalAppUserId('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });
});
