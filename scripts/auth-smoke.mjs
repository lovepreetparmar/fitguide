#!/usr/bin/env node
/**
 * Quick Supabase auth connectivity check (no UI).
 * Usage: npm run auth:smoke
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const envPath = path.join(root, '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = loadEnvFile(envPath);
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? fileEnv.EXPO_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? fileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function fail(message) {
  console.error(`auth-smoke: FAIL — ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`auth-smoke: OK — ${message}`);
}

if (!url || url.includes('your-project')) {
  fail('Set EXPO_PUBLIC_SUPABASE_URL in .env');
}
if (!anonKey || anonKey === 'your_supabase_anon_key') {
  fail('Set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const health = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
  headers: { apikey: anonKey },
}).catch(() => null);

if (!health?.ok) {
  fail(`Auth health check failed (${health?.status ?? 'network error'})`);
}
ok(`Auth API reachable (${health.status})`);

const { data, error } = await supabase.auth.signInAnonymously();
if (error) {
  const hint = error.message.toLowerCase().includes('anonymous')
    ? 'Enable Anonymous provider in Supabase → Authentication → Providers.'
    : error.message.includes('Database')
      ? 'Run database/fix_anonymous_signup.sql in the SQL Editor.'
      : error.message;
  fail(`Anonymous sign-in: ${hint}`);
}

if (!data.session?.user?.id) {
  fail('Anonymous sign-in returned no session user');
}

ok(`Anonymous sign-in works (user ${data.session.user.id.slice(0, 8)}…)`);
await supabase.auth.signOut();
ok('All auth smoke checks passed');
