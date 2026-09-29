# Fit Guide — Project Summary (for collaboration / improvement)

**Tagline:** Train smarter. Lift better.  
**Repo:** `fitguide` (Expo app, package name `fit-guide`)  
**Last updated:** September 2026  

Use this document as context when brainstorming product, UX, architecture, or next features with another AI or teammate.

---

## 1. What the app is

Fit Guide is a **mobile-first personal fitness coach** built with **React Native + Expo SDK 56**. It targets:

- Personalized workouts (equipment, goals, recovery)
- Exercise library with muscle targeting
- In-session workout tracking (sets, reps, weight, rest timer)
- Recovery scores per muscle group
- Progress and nutrition summaries on the home screen
- Rule-based “AI coach” recommendations (not a live LLM API yet)

Backend is **Supabase** (Auth, Postgres, RLS). The app is designed to work best with Supabase configured; there is also **guest mode** and legacy **demo auth** when env keys are missing.

---

## 2. Tech stack (actual vs README)

| Area | In use |
|------|--------|
| Framework | Expo ~56, React 19, React Native 0.85, TypeScript |
| Navigation | Expo Router (file-based: `app/`) |
| Styling | NativeWind v4 + Tailwind (`global.css`, dark theme) |
| State | Zustand (persisted auth + app cache) |
| Server state | TanStack React Query |
| Forms | React Hook Form + Zod (register screen; onboarding is manual state) |
| Backend | `@supabase/supabase-js`, session in Secure Store (native) / AsyncStorage (web) |
| Charts | Custom `SimpleLineChart` (SVG) — **not** Victory Native in `package.json` |
| Body map | SVG component `BodyMap` — **not** React Three Fiber in dependencies |
| Haptics | `expo-haptics` in workout player |
| OAuth | `expo-auth-session`, `expo-web-browser`, Google (+ Apple wired in auth service) |

**Dev workflow:** `scripts/native-env.sh` fixes PATH for CocoaPods on machines with conflicting `head`. Scripts use **dev client** (`expo start --dev-client`) and `react-native run-ios` / `run-android`. No `ios/` folder is committed (prebuild when needed).

---

## 3. Repository structure

```
app/
  index.tsx                 # Auth + onboarding gate → tabs or auth
  (auth)/                   # splash, login, register, forgot-password, onboarding
  (tabs)/                   # home, workout, exercises, progress, profile
  exercise/[id].tsx         # exercise detail
  workout/player.tsx        # full-screen workout session
src/
  components/               # UI kit, home cards, BodyMap, ExerciseCard, social auth
  constants/                # goals, muscles, SAMPLE_EXERCISES (legacy, unused in UI)
  hooks/useFitness.ts       # React Query wrappers
  providers/                # AuthProvider, QueryProvider
  services/                 # supabase, auth, exercises, workout, progress, nutrition, ai
  store/                    # authStore, workoutStore, appStore
  types/index.ts            # shared domain types
database/
  migrations/001_initial_schema.sql
  setup_supabase.sql        # full idempotent setup + large exercise seed
  setup_minimum.sql
  seed_exercises.generated.sql
  seed_exercises_additional.sql
scripts/
  generate-exercise-seeds.mjs
  native-env.sh
```

**Git history:** Initial commit + one merged PR: `feat: build Fit Guide MVP across all 12 milestones`. Additional work exists as **local uncommitted changes** (see §8).

---

## 4. Navigation and user flows

### Entry (`app/index.tsx`)

1. Loading → auth store `initialize()`
2. Not authenticated → `/(auth)/splash`
3. Authenticated but onboarding incomplete → `/(auth)/onboarding`
4. Else → `/(tabs)` (main app)

### Auth (current UX emphasis)

- **Splash:** branding + “Sign In”
- **Login:** **Google OAuth** (via Supabase) + **Continue as Guest** (email/password UI de-emphasized on login screen)
- **Register / forgot-password** screens still exist in the repo
- **OAuth redirect:** scheme `fitguide`, path `auth/callback`
- **Guest:** Supabase anonymous auth when configured; local `local:` user ID fallback; onboarding required
- **Without Supabase env:** `signIn` / `signUp` can still set a local `demo` user; Google shows an alert if not configured

### Onboarding (8 steps)

Welcome → About You → Body Stats → Goals → Experience → Schedule → Equipment → Health  

Data saved to Supabase `profiles` when configured; locally merged into profile for guest/demo.

### Main tabs

| Tab | Purpose |
|-----|---------|
| Home | Greeting, stats, recovery, AI cards, today’s workout, nutrition snapshot, generate workout |
| Workout | Generate plan (30/45/60/90 min), preview exercises, start/resume player |
| Exercises | Search, muscle chips, list/body map toggle |
| Progress | Weight/body fat stats, line chart, per-muscle recovery list |
| Profile | Goals, equipment, streak; menu → nutrition, measurements, settings, privacy/export |

---

## 5. Features implemented (by domain)

### Exercise library

- Fetches from Supabase `exercises` table (filters: muscle, equipment, difficulty, search)
- **Requires DB seed** — errors guide user to run `database/setup_supabase.sql`
- Exercise detail screen: instructions, mistakes, tips, muscle tags
- `SAMPLE_EXERCISES` in `src/constants/exercises.ts` is **no longer referenced** by screens (Supabase-only path)

### Workout generation (`workoutService.generateWorkout`)

- Loads all exercises from DB
- Filters by user equipment and muscles in `needs_rest` recovery state
- Picks compound + isolation mix; builds sets/reps/rest from experience level
- Inserts `workout_plans` row (needs valid `user_id` in Supabase — **guest UUID `guest` will fail inserts** unless handled)

### Workout player (`workoutStore` + `player.tsx`)

- Tracks exercise index, set index, weight/reps adjustments
- Rest timer with haptics
- Completes sets → updates session in Supabase, recovery via `recoveryService.updateRecoveryAfterWorkout`
- Updates local streak / achievements via `appStore`

### Recovery (`recoveryService`)

- Per-muscle rows in `recovery` table; auto-seed on first fetch
- Scores/status derived from last trained time and volume
- `generateDefaultRecovery()` for local display when needed
- Overall recovery score powers home UI and workout selection

### Progress (`progressService`)

- `progress_entries` by week/month/year
- Measurements API stub exists
- Progress tab uses `SimpleLineChart` for weight trend

### Nutrition (`nutritionService`)

- `nutrition_logs` and `water_logs` tables
- Macro calculator helper (BMR/TDEE-style)
- Home `NutritionCard` shows today’s log when present

### AI coach (`aiCoachService` in `src/services/ai.ts`)

**Rule-based, in-app logic** — not OpenAI/Anthropic:

- Recovery alerts, fatigued muscle warnings
- Streak motivation, inactive nudges, goal-specific tips (hypertrophy vs strength)
- Weekly summary string builder
- Per-exercise weight progression heuristics

Rendered on home via `AIRecommendationCard`.

### Achievements & offline (partial)

- `appStore`: streak, achievement IDs, `cachedWorkouts` (last 20), `cachedNutrition`, `isOffline` flag
- README claims “offline sync when online” — **no full sync pipeline** wired; caching is local persistence only

### UI / design system

- Dark background `#090909`, cards `#161616`, primary `#6C63FF`, secondary `#00D9A5`
- Shared components: Button, Input, Card, Chip, StatCard, ProgressBar

---

## 6. Database (Supabase)

**Schema** (`001_initial_schema.sql` / `setup_supabase.sql`):

- `profiles`, `goals`, `muscle_groups`, `exercise_categories`, `exercises`, `exercise_media`
- `workout_plans`, `workout_sessions`, `workout_sets`
- `recovery`, `progress_entries`, `measurements`
- `nutrition_logs`, `water_logs`, `achievements`, `notification_preferences`
- RLS policies (in migration/setup scripts)

**Seeding:**

- `setup_supabase.sql` bundles schema + **~100 exercise INSERT blocks**
- `scripts/generate-exercise-seeds.mjs` generates additional SQL (`seed_exercises_additional.sql`, `seed_exercises.generated.sql`)
- `.env.example` points at project URL `boajdgtpvhqwfmewanul.supabase.co` (anon key placeholder)

---

## 7. Environment variables

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

`isSupabaseConfigured` is true only when **both** are set (non-placeholder).

---

## 8. Recent local work (not necessarily committed)

A large diff vs `HEAD` includes:

- Login/splash UX shift toward **Google + Guest**
- `SocialSignInButtons` component
- OAuth flow in `auth.ts` / `authStore` (Google, Apple store methods)
- Exercises **fully on Supabase** (removed inline sample fallback in service)
- Workout/progress/nutrition service hardening and Supabase integration
- Workout player and home screen polish
- `package.json` dependency updates; iOS simulator target iPhone 17 Pro
- Database setup/seed SQL files and exercise seed generator
- `BodyMap`, `Input`, tailwind tweaks

Treat this section as “in progress” until committed.

---

## 9. Known gaps, risks, and “coming soon”

| Item | Notes |
|------|--------|
| Guest + Supabase workouts | Guest `user_id` is not a real UUID; creating plans/sessions may **fail** against FK constraints |
| Exercise library without DB | App errors until `setup_supabase.sql` is run |
| Profile menu | Body measurements, nutrition settings, notifications, settings, export, privacy → alert **“coming soon”** |
| Apple sign-in UI | Service exists; login screen currently emphasizes Google only |
| Email login on main login | Register/forgot-password exist; primary login path is OAuth/guest |
| True AI / LLM | Coach is deterministic rules only |
| Offline sync | Local cache fields exist; no robust offline-first sync |
| README drift | Mentions Victory Native, R3F, `npm run web`, `src/ai/` — outdated vs code |
| Tests | Jest: `format.test.ts`, `recovery.test.ts` only |

---

## 10. Tests and quality

```bash
npm test          # jest
npm run typecheck # tsc --noEmit
```

---

## 11. Suggested improvement themes (for brainstorming)

Use these as prompts when working with ChatGPT or planning sprints:

1. **Auth & identity:** Unify guest vs authenticated data (local-only guest workouts OR Supabase anonymous auth); surface email/password on login if desired; Apple button parity.
2. **Exercise content:** Media (video/3D), progressive overload history, favorites, custom exercises.
3. **Workout UX:** Templates, supersets, RPE logging UI, exercise swap mid-session, Apple Watch / rest notifications.
4. **Real AI:** LLM weekly plan, form tips, natural language logging — with cost/privacy guardrails.
5. **Nutrition:** Full logging UI, barcode scan, integration with goals.
6. **Progress:** Photo check-ins, PR board, export CSV, better chart library.
7. **Recovery:** Sleep/HRV import, deload weeks, auto-taper volume.
8. **Reliability:** Offline queue for sets/sessions, retry sync, error boundaries on exercise fetch.
9. **Growth:** Onboarding personalization, push notifications (`expo-notifications` plugin present), social/sharing.
10. **Production:** EAS Build, env secrets, RLS audit, analytics, crash reporting.

---

## 12. Quick command reference

```bash
npm install
cp .env.example .env   # add Supabase keys
# Run database/setup_supabase.sql in Supabase SQL Editor
npm start              # Expo dev client
npm run ios            # iOS simulator
npm run android
```

---

## 13. One-paragraph elevator pitch

Fit Guide is an Expo-based strength-training app that combines a Supabase-backed exercise library, recovery-aware workout generation, and an in-app session player with rest timers. Users sign in with Google or try guest mode, see personalized home-screen coaching cards (rule-based today), and track progress across workouts, muscles, and basic nutrition. The MVP UI and data model are in place; the main follow-ups are guest/backend consistency, deeper nutrition and settings flows, optional real LLM coaching, and production hardening.
