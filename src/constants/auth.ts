import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

export const authEmailSchema = z.string().email('Please enter a valid email');

export const authPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);

export const loginFormSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const registerFormSchema = z
  .object({
    email: authEmailSchema,
    password: authPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
