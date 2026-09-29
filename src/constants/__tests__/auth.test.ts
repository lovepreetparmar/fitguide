import {
  loginFormSchema,
  registerFormSchema,
  PASSWORD_MIN_LENGTH,
} from '@/constants/auth';

describe('auth form schemas', () => {
  it('requires a valid email and password for login', () => {
    const short = loginFormSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
    });
    expect(short.success).toBe(false);

    const ok = loginFormSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(PASSWORD_MIN_LENGTH),
    });
    expect(ok.success).toBe(true);
  });

  it('requires matching passwords on register', () => {
    const mismatch = registerFormSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(PASSWORD_MIN_LENGTH),
      confirmPassword: 'b'.repeat(PASSWORD_MIN_LENGTH),
    });
    expect(mismatch.success).toBe(false);

    const ok = registerFormSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(PASSWORD_MIN_LENGTH),
      confirmPassword: 'a'.repeat(PASSWORD_MIN_LENGTH),
    });
    expect(ok.success).toBe(true);
  });
});
