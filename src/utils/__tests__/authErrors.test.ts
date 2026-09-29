import { formatAuthError, isSupabaseSignupDatabaseError } from '@/utils/authErrors';

describe('formatAuthError', () => {
  it('maps invalid credentials to a friendly message', () => {
    expect(formatAuthError(new Error('Invalid login credentials'))).toContain(
      'Incorrect email or password'
    );
  });

  it('maps unconfirmed email', () => {
    expect(formatAuthError({ message: 'Email not confirmed' })).toContain('Confirm your email');
  });

  it('passes through unknown errors', () => {
    expect(formatAuthError(new Error('Custom provider error'))).toBe('Custom provider error');
  });
});

describe('isSupabaseSignupDatabaseError', () => {
  it('detects anonymous signup database failures', () => {
    expect(isSupabaseSignupDatabaseError('Database error creating anonymous user')).toBe(true);
    expect(isSupabaseSignupDatabaseError('Invalid login credentials')).toBe(false);
  });
});
