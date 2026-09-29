# Supabase

## Authentication (sign-in options)

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

In **Authentication → URL configuration**, add redirect URLs:

- `fitguide://auth/callback` (Google OAuth)
- `fitguide://auth/reset-password` (password reset deep link)

In **Authentication → Providers**, enable what you need:

| Provider | Used for |
|----------|----------|
| **Anonymous** | Continue as Guest (cloud-synced guest) |
| **Email** | Create account, email sign-in, forgot password |
| **Google** | Continue with Google |

If guest sign-up returns HTTP 500, run `database/fix_anonymous_signup.sql` in the SQL Editor.

For **anonymous → Google / email** linking, enable **Manual linking** under Authentication settings.

Apple Sign In is not shown in the app (requires a paid Apple Developer account). Backend code remains available if you enable it later.

## Edge Functions

### delete-account

Permanently deletes the authenticated user via `auth.admin.deleteUser` (cascades to app tables with FK to `auth.users`).

### Deploy

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy delete-account
```

Ensure **Manual linking** is enabled under Authentication if using anonymous → OAuth identity linking.

### SQL migrations

Run in order in the SQL Editor:

1. `database/migrations/001_initial_schema.sql` (or `setup_supabase.sql`)
2. `database/fix_anonymous_signup.sql` (if anonymous signup returns 500)
3. `database/migrations/003_sprint1_idempotency_engagement.sql`
4. `database/migrations/004_nutrition_foundation.sql` (Sprint 2 meals / foods)
5. `database/migrations/005_saved_meals.sql`
6. `database/migrations/006_diary_food_rpc.sql` (recent/frequent foods)
7. Optional: `database/seed_foods_expanded.sql` (run `node scripts/generate-food-seeds.mjs` to regenerate)

## describe-meal

Optional AI parsing for natural-language meal logging (used when the user taps **AI** on Describe meal).

### Deploy

```bash
supabase functions deploy describe-meal
supabase secrets set OPENAI_API_KEY=sk-...
```

Without `OPENAI_API_KEY`, the app still works using on-device rule parsing.

## analyze-meal-image

Vision-based meal scan (photo → foods + macros). Used from **Diary → Scan meal**.

```bash
supabase functions deploy analyze-meal-image
```

Uses the same `OPENAI_API_KEY` secret as `describe-meal`.
