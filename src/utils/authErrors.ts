function extractAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.msg === 'string') return record.msg;
    if (typeof record.error_description === 'string') return record.error_description;
  }
  try {
    const text = JSON.stringify(error);
    if (text && text !== '{}') return text;
  } catch {
    /* ignore */
  }
  return 'Could not complete sign-in.';
}

export function formatAuthError(error: unknown): string {
  const message = extractAuthErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Try again or use Forgot password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email from the message we sent, then sign in.';
  }
  if (lower.includes('user already registered')) {
    return 'This email is already registered. Sign in or reset your password.';
  }
  if (lower.includes('signup is disabled')) {
    return 'Email sign-up is disabled for this project. Use Google, email sign-in, or guest mode.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Wait a minute and try again.';
  }

  return message;
}

export function isSupabaseSignupDatabaseError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('database error') ||
    lower.includes('creating anonymous') ||
    lower.includes('"status":500') ||
    lower.includes('internal server error')
  );
}
