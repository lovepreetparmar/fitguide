import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { isAppleNativeSignInAvailable } from '@/services/appleNativeAuth';

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

describe('isAppleNativeSignInAvailable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns false off iOS', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    await expect(isAppleNativeSignInAvailable()).resolves.toBe(false);
  });

  it('returns true when AppleAuthentication is available on iOS', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    (AppleAuthentication.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    await expect(isAppleNativeSignInAvailable()).resolves.toBe(true);
  });
});
