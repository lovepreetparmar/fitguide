# Fit Guide — Cursor → Senior Developer Feedback Protocol

**Purpose:** This file is the communication bridge between Cursor (implementation engineer) and ChatGPT (senior developer/product architect).

Cursor should update this file after meaningful implementation work so the senior developer can review what actually happened in the repository.

---

# 1. When to Update This File

Update this file after:

- completing a phase
- completing a P0 issue
- making a database/schema change
- changing authentication
- changing offline/sync behavior
- changing workout generation
- changing workout/session data models
- integrating an external API
- adding AI/LLM functionality
- discovering a major bug or architectural issue
- discovering that the master plan conflicts with the actual codebase

Do not update it for every tiny CSS/style change unless the change affects behavior.

---

# 2. Required Feedback Format

Use the following structure for every meaningful update.

## Update

**Date:**

**Phase:**

**Task/Issue:**

**Status:**
- Completed
- Partially completed
- Blocked
- Needs architectural decision

---

## What I Found

Describe the actual repository/code behavior discovered.

Include:

- relevant files
- services
- stores
- hooks
- database tables
- RLS policies
- dependencies
- existing behavior

Do not hide problems discovered during implementation.

---

## What I Changed

List exact changes.

Example:

```text
src/services/workout.ts
- Added progression calculation

src/store/workoutStore.ts
- Added persisted pending set queue

database/migrations/...
- Added idempotency key
```

---

## Why I Chose This Approach

Briefly explain the implementation decision.

If there were multiple approaches, list them:

```text
Option A:
...

Option B:
...

Selected:
...

Reason:
...
```

---

## Files Changed

```text
- file/path/one
- file/path/two
- file/path/three
```

---

## Database Changes

If applicable:

```text
Tables changed:
...

Columns added:
...

Indexes:
...

RLS:
...

Migration:
...
```

If no database changes:

```text
No database changes.
```

---

## Tests Run

Always report the actual commands executed.

Example:

```bash
npm run typecheck
npm test
```

Then:

```text
Typecheck: PASS
Tests: PASS — 42 passed
```

If something failed:

```text
Typecheck: FAIL
Reason:
...
```

Never report a test as passing unless it was actually run.

---

## Manual Testing

Report actual device/simulator testing.

Example:

```text
iOS Simulator:
- Login: PASS
- Onboarding: PASS
- Workout start: PASS
- Set completion: PASS
- App restart during workout: PASS

Android:
- Not tested
```

---

## Known Problems

List anything still unresolved.

Example:

```text
1. Offline sync works for sets but nutrition mutations are not yet queued.
2. Android notification behavior has not been verified.
3. Supabase RLS test for cross-user access still needs verification.
```

Never hide known issues just because the main task is complete.

---

## Risks

Identify anything that could cause future problems.

Examples:

```text
- Existing migration may fail on a fresh database.
- Guest account migration needs additional testing.
- The current exercise seed contains duplicate names.
- Sync conflict behavior is currently last-write-wins.
```

---

## Questions for Senior Developer

Only ask questions that genuinely require a product or architectural decision.

Example:

```text
1. Should guest accounts use Supabase Anonymous Auth or remain local-only?
2. Should deleted workout history be recoverable?
3. Should RIR be mandatory or optional?
```

If there are no questions:

```text
No architectural questions.
```

---

# 3. Architecture Decision Requests

When Cursor encounters a decision that could significantly affect the product, do not silently choose a complex direction.

Use:

```text
## Architecture Decision Needed

### Problem

...

### Option A

...

### Option B

...

### Recommendation

...

### Impact

Database:
...

Backend:
...

Mobile:
...

Migration:
...
```

The senior developer will decide the direction.

---

# 4. Discovery Reports

If the implementation reveals that the original master plan was incorrect or incomplete, report it explicitly.

Use:

```text
## Plan Conflict

Master plan says:
...

Actual repository:
...

Impact:
...

Recommended correction:
...
```

Do not blindly follow outdated instructions if the actual code proves otherwise.

---

# 5. Bugs Discovered During Work

Use:

```text
## Bug Discovered

### Bug

...

### Reproduction

1.
2.
3.

### Root Cause

...

### Severity

P0 / P1 / P2

### Proposed Fix

...

### Fixed?

Yes / No
```

If it is P0, prioritize it before continuing unrelated work unless there is a clear reason not to.

---

# 6. Security Findings

Security issues must be explicitly reported.

Examples:

```text
RLS policy allows unintended access
Sensitive value stored insecurely
Client can modify another user's record
Service role key exposed
Authorization relies on client-side checks
```

Use:

```text
## Security Finding

Severity:
Affected area:
Evidence:
Risk:
Fix:
Verification:
```

Do not suppress security findings.

---

# 7. Performance Findings

Report significant performance issues:

```text
Large database query
Repeated Supabase request
Unnecessary React renders
Large exercise payload
Slow workout screen
Image memory issue
Slow startup
```

Include measured evidence where possible.

---

# 8. Completion Checklist

Before marking a task complete:

```text
[ ] Implementation complete
[ ] Types pass
[ ] Relevant tests pass
[ ] Manual testing performed
[ ] Loading state checked
[ ] Empty state checked
[ ] Error state checked
[ ] Offline behavior checked where relevant
[ ] Database/RLS checked where relevant
[ ] No duplicate architecture introduced
[ ] Documentation updated where necessary
[ ] Known issues documented
```

---

# 9. End-of-Phase Report

At the end of every major phase, provide:

## Phase Summary

**Phase:**

**Completed:**

```text
- ...
- ...
- ...
```

**Not completed:**

```text
- ...
- ...
```

**New discoveries:**

```text
- ...
```

**Technical debt added:**

```text
- None
```

or list it.

**P0 remaining:**

```text
- ...
```

**P1 remaining:**

```text
- ...
```

**P2 remaining:**

```text
- ...
```

**Recommended next step:**

```text
...
```

---

# 10. Final Rule

The purpose of this file is not to make Cursor look successful.

The purpose is to give the senior developer an accurate picture of the repository.

**Be honest about:**

- incomplete work
- failing tests
- temporary implementations
- architectural compromises
- security concerns
- performance concerns
- untested platforms
- assumptions
- technical debt

A transparent "blocked" report is better than a false "complete" report.

---

## Update

**Date:** 2026-09-28

**Phase:** 0

**Task/Issue:** Full codebase audit (master plan §6, §27)

**Status:**
- Completed

---

## What I Found

Completed read-only inspection of the `fitguide` repository. Full detail is in [FITGUIDE_CODEBASE_AUDIT.md](FITGUIDE_CODEBASE_AUDIT.md).

Summary:

- Expo SDK 56 / React Native 0.85 MVP with Expo Router, NativeWind, Zustand (auth + app cache; workout session **not** persisted), TanStack React Query (mostly inline `useQuery` in screens; `useFitness` hooks unused).
- Supabase for auth, exercises, workouts, recovery, progress, nutrition. Requires `database/setup_supabase.sql` (or migration + seeds) for exercises; `setup_minimum.sql` only supports profiles.
- Primary auth UX: splash → login (Google OAuth + guest). Register/forgot-password routes exist but are not linked from splash/login.
- Guest uses `user_id: 'guest'` and demo mode uses `'demo'` — **invalid for Postgres FKs** to `auth.users` when Supabase is configured, breaking workouts/recovery/onboarding writes for those modes.
- Workout generation is heuristic (not LLM); player completes session via live Supabase with no offline queue; `doFinish` clears local state before guaranteed server success.
- Profile menu items show “coming soon” alerts (master plan Rule 3 conflict).
- RLS enabled on user tables and public read on exercise catalog; `exercise_media` table has no RLS policies in migration (unused by app).
- Only 2 Jest test files (recovery math + format utils); no component/E2E tests.

## Plan Conflict

**Master plan says:** Phase 1 in §7 bundles guest + offline + error handling; §26 lists Auth/DB then Offline as separate phases.

**Actual repository:** Guest and offline are intertwined blockers for workout reliability.

**Impact:** Implementation order should follow §26 with Phase 1 guest/RLS before Phase 2 offline.

**Recommended correction:** Senior dev confirms phase boundaries; do not start offline before guest UUID strategy is decided.

---

## What I Changed

Documentation only:

```text
FITGUIDE_CODEBASE_AUDIT.md
- Created Phase 0 audit (sections 1–26, feature matrix, AUDIT-001–030, P0/P1/P2 backlogs)

FITGUIDE_CURSOR_FEEDBACK.md
- Added protocol file to repo root
- Appended this Phase 0 update
```

No application code, database, or dependency changes.

---

## Why I Chose This Approach

The master plan requires a complete audit before any feature work. Code was inspected directly; `APP_SUMMARY.md` was used as secondary context only. Issues were registered with stable IDs for Phase 1+ tracking.

---

## Files Changed

```text
- FITGUIDE_CODEBASE_AUDIT.md (new)
- FITGUIDE_CURSOR_FEEDBACK.md (new in repo + update appended)
```

---

## Database Changes

```text
No database changes.
```

---

## Tests Run

```bash
npm run typecheck
npm test
```

```text
Typecheck: PASS
Tests: PASS — 2 suites, 11 tests passed
```

---

## Manual Testing

```text
Not performed — Phase 0 audit only (no simulator/device runs).
```

---

## Known Problems

```text
1. Guest/demo user IDs fail Supabase FK constraints for workout and recovery writes (P0).
2. Active workout state is not persisted; process kill loses in-progress session (P0).
3. No offline mutation queue; workout finish requires network (P0).
4. Workout player does not handle Supabase errors after local session clear (P0).
5. Profile settings/measurements/nutrition/export menus are “coming soon” stubs (P1).
6. Exercise library throws if DB not seeded (expected; bootstrap must be documented for ops).
```

---

## Risks

```text
- Implementing features before guest architecture decision may duplicate data paths.
- setup_supabase.sql duplicates migration SQL — drift risk between files.
- Streak and achievements are client-only; may disagree with server session history.
- .env.example includes a real project URL; anon key still required.
```

---

## Questions for Senior Developer

```text
1. Guest: Supabase Anonymous Auth vs fully local-only guest (no Supabase writes)?
2. Should email/password register remain in v1 UX (link from login) or be removed?
3. For Rule 3: remove profile stub menu items until Phase 10, or prioritize which to build first?
4. Confirm P0 ordering: guest/RLS (Phase 1) before offline outbox (Phase 2)?
```

---

## Phase Summary

**Phase:** 0

**Completed:**

```text
- Full codebase audit document
- Feature matrix and issue registry (AUDIT-001–030)
- P0/P1/P2 backlogs
- Typecheck and unit tests executed
- Feedback protocol committed to repository
```

**Not completed:**

```text
- All Phase 1–15 implementation work
- P0 fixes
- Manual QA on iOS/Android
- Live Supabase RLS verification
```

**New discoveries:**

```text
- useFitness.ts hooks are unused by app screens
- exercise_media table unused; no client references
- completeSession upserts sets sequentially (performance)
```

**Technical debt added:**

```text
- None (documentation only)
```

**P0 remaining:**

```text
- AUDIT-001 through AUDIT-008 (see FITGUIDE_CODEBASE_AUDIT.md)
```

**P1 remaining:**

```text
- AUDIT-009 through AUDIT-019, AUDIT-028–030 (see audit doc)
```

**P2 remaining:**

```text
- AUDIT-021 through AUDIT-027 (see audit doc)
```

**Recommended next step:**

```text
Senior developer reviews FITGUIDE_CODEBASE_AUDIT.md P0 backlog and answers guest-architecture question → approve Phase 1 implementation scope. Cursor must not implement P0 until approved.
```

---

## Update

**Date:** 2026-09-28

**Phase:** 1 (Production foundation — auth/guest/RLS guards) + 2 (offline session/outbox/safe finish) partial foundation

**Task/Issue:** AUDIT-001–008, AUDIT-009, AUDIT-020, AUDIT-028; master plan §7–§7.2

**Status:**
- Completed (P0 auth/offline core)
- Partially completed (Phases 3–15 not started; app-wide error boundary minimal only)

---

## What I Found

- Guest mode used literal `guest` / `demo` user IDs incompatible with Supabase FKs when env is configured.
- Active workouts lived only in memory; player cleared local state before server acknowledged completion.
- No mutation outbox; `startSession` always required live Supabase inserts.
- Register/forgot-password routes existed but were not linked from login.

---

## What I Changed

```text
src/utils/userId.ts — canSyncUserToSupabase, local ID helpers
src/services/auth.ts — signInAnonymously()
src/store/authStore.ts — anonymous guest when Supabase configured; local-only IDs without Supabase; onboarding for guests; purge legacy guest/demo on init
src/services/workout.ts — local plan/session, syncCompletedSession, offline fallbacks
src/store/workoutStore.ts — AsyncStorage persist; finishWorkout no longer clears until player confirms sync
src/services/sync/outbox.ts, syncWorker.ts — complete_workout queue + flush on auth init
src/services/progress.ts, nutrition.ts — skip/guard remote writes when not syncable
app/workout/player.tsx — safe finish, user alert, outbox on failure
app/(auth)/login.tsx — async guest, register/forgot links
src/providers/AuthProvider.tsx — flush outbox after auth
src/components/ui/ScreenErrorBoundary.tsx, app/_layout.tsx — root error boundary
.env.example — note to enable Anonymous sign-in in Supabase
FITGUIDE_CODEBASE_AUDIT.md — mark AUDIT-001–009, 020, 028 fixed
src/utils/__tests__/userId.test.ts — new tests
```

---

## Why I Chose This Approach

**Option A:** Fully local guest (no Supabase session).

**Option B:** Supabase Anonymous Auth → real UUID + RLS.

**Selected:** B when Supabase is configured; isolated `local:` prefixed IDs when not configured (no Supabase writes).

**Reason:** Matches master plan preference; avoids fake FKs; guest onboarding now uses DB profile from trigger with `onboarding_completed: false`.

---

## Files Changed

```text
- src/utils/userId.ts (new)
- src/utils/__tests__/userId.test.ts (new)
- src/services/auth.ts
- src/services/workout.ts
- src/services/progress.ts
- src/services/nutrition.ts
- src/services/sync/outbox.ts (new)
- src/services/sync/syncWorker.ts (new)
- src/store/authStore.ts
- src/store/workoutStore.ts
- src/providers/AuthProvider.tsx
- src/components/ui/ScreenErrorBoundary.tsx (new)
- app/workout/player.tsx
- app/(auth)/login.tsx
- app/_layout.tsx
- .env.example
- FITGUIDE_CODEBASE_AUDIT.md
- FITGUIDE_CURSOR_FEEDBACK.md
```

---

## Database Changes

```text
No SQL migrations. Operators must enable Anonymous sign-in in Supabase Auth dashboard for guest mode on configured backends.
```

---

## Tests Run

```bash
npm run typecheck
npm test
```

```text
Typecheck: PASS
Tests: PASS — 3 suites, 14 tests passed
```

---

## Manual Testing

```text
Not performed on iOS/Android simulator in this session.
```

---

## Known Problems

```text
1. Anonymous guest requires Supabase dashboard setting; failure shows alert on login.
2. Outbox only handles complete_workout (not nutrition/progress/set-level sync).
3. No NetInfo-driven background sync loop — flush runs on auth init only.
4. Guest-to-registered account linking not implemented (master plan launch item).
5. Phases 3–15 (workout engine depth, nutrition UI, AI, notifications, release prep) largely untouched.
6. Profile “coming soon” stubs remain (AUDIT-010).
```

---

## Risks

```text
- Persisted workout rehydration may briefly flash player redirect if session null during hydrate (Zustand persist timing).
- Local session sync creates new server rows; plan_id dropped when local plan id.
- Legacy persisted guest users are signed out on next init when Supabase configured.
```

---

## Questions for Senior Developer

```text
1. Should anonymous guests be upgraded via linkIdentity / email capture in v1?
2. Should outbox flush also run on app foreground / interval?
```

---

## Update

**Date:** 2026-09-28

**Phase:** Native / iOS launch stability

**Task/Issue:** Simulator crash `EXC_BREAKPOINT` — `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption` (~2s after launch on iOS 27 / Xcode 26).

**Status:** Completed

---

## What I Found

- `ios/FitGuide/Info.plist` had no `UIApplicationSceneManifest`; `AppDelegate` created a `UIWindow` directly in `didFinishLaunchingWithOptions`, which newer iOS SDKs reject.
- Installed Expo SDK 56.0.12 prebuild template matches this legacy pattern; Expo `main` bare template already adopts `SceneDelegate` + manifest (not yet in published npm template for this project’s expo version).

---

## What I Changed

```text
ios/FitGuide/Info.plist — UIApplicationSceneManifest → SceneDelegate
ios/FitGuide/SceneDelegate.swift — new; starts RN in UIWindowScene
ios/FitGuide/AppDelegate.swift — factory setup only; window/RN start moved to SceneDelegate
ios/FitGuide.xcodeproj/project.pbxproj — compile SceneDelegate.swift
app.json — ios.infoPlist UIApplicationSceneManifest for future prebuilds
```

---

## Tests Run

```bash
sh -c '. ./scripts/native-env.sh && npx react-native run-ios --simulator "iPhone 18 Pro" --no-packager'
```

```text
Build + launch: PASS; app remained running >5s; Metro status 200.
```

---

## Phase Summary

**Phase:** 1 + 2 (core); 3–15 not executed

**Completed:**

```text
- Supabase anonymous guest + local-only fallback
- Service-layer guards against invalid Supabase writes
- Persisted in-progress workout + resume card
- Offline local session start + deferred server sync
- Workout completion outbox + user-facing save failure message
- Login navigation links; root error boundary
```

**Not completed:**

```text
- Workout engine enhancements (RPE, supersets, PR detection) — Phase 2 plan §8
- Exercise platform, recovery/nutrition/progress UIs, AI coach, profile settings, notifications, analytics, broad testing, release prep — Phases 3–15
```

**P0 remaining:**

```text
- None from original AUDIT-001–008 registry (marked fixed; live Supabase verification still needed)
```

**P1 remaining:**

```text
- AUDIT-010–019, AUDIT-029–030 (see audit doc)
```

**Recommended next step:**

```text
Verify anonymous auth + workout finish/sync on a configured Supabase project (simulator). Then Phase 3 workout engine + Phase 5 nutrition logging UI per master plan §8–§11.
```

---

## Update

**Date:** 2026-09-28

**Phase:** 3–4 (workout engine / player) + partial 7 (nutrition) + partial 8 (progress logging)

**Task/Issue:** Continue master plan after guest auth + offline core; wire progression into player; nutrition + weight log UIs (AUDIT-010 partial).

**Status:** Partially completed

---

## What I Found

- `src/services/progression.ts` already provides e1RM, history summaries, weight suggestions, and PR detection; `workout.ts` uses summaries during `generateWorkout`.
- Player lacked RPE capture, last-performance hint, and PR alert on finish.
- Nutrition service could upsert logs but no screen; profile Nutrition menu was a “coming soon” alert.
- Progress tab charted weight but had no `logProgress` UI.

---

## What I Changed

```text
app/workout/player.tsx
- RPE chips (6–10), last-performance line from exercise history query
- PR alert after sync using prior summaries fetched before write (avoids false positives)

app/nutrition/log.tsx (new)
- Today’s macro/water editor + preview card; quick +250/+500 ml water

app/_layout.tsx — Stack screen nutrition/log
app/(tabs)/profile.tsx — Nutrition → /nutrition/log
app/(tabs)/index.tsx — Nutrition section + Log link
app/(tabs)/progress.tsx — Log weight / body fat form → progressService.logProgress

database/fix_anonymous_signup.sql — user-applied; cloud guest confirmed working (prior session)
```

---

## Tests Run

```bash
npm run typecheck  # PASS
npm test           # PASS (19 tests, incl. progression.test.ts)
```

---

## Phase Summary

**Completed this pass:**

```text
- Phase 3 progression wired in generation (existing) + player UX (RPE, history, PRs)
- Phase 7 nutrition logging screen (cloud sync only)
- Progress weight logging on Progress tab
```

**Not completed:**

```text
- Supersets / advanced session structures, exercise favorites/media (Phase 5–6)
- Profile menu stubs (measurements, settings, export, privacy) — AUDIT-010
- Local nutrition/progress persistence for offline-only guests
- Notifications, AI coach depth, release/testing phases
```

**Recommended next step:**

```text
Phase 5 exercise detail polish + Phase 10 profile/settings (replace or hide stubs). Extend outbox beyond complete_workout if needed.
```

---

## Update

**Date:** 2026-09-28

**Phase:** 5–11 + P1 audit sweep (profile, nutrition/progress offline, auth, notifications, exercises)

**Task/Issue:** User requested completing remaining plan items without stopping.

**Status:** Partially completed (MVP-complete for core product; LLM AI / release CI / full E2E remain optional)

---

## What I Changed

```text
Profile & settings
- app/settings/index.tsx, settings/privacy.tsx — units, reminders, export JSON, delete user data
- app/measurements/index.tsx — body measurements log + history
- app/(tabs)/profile.tsx — all menu routes wired (no “coming soon” for main items)

Auth
- Apple sign-in button (iOS) in SocialSignInButtons
- app/(auth)/reset-password.tsx + authService.updatePassword
- authService.deleteAllUserData + authStore.deleteAccount

Nutrition / progress (offline-capable)
- nutritionService: local cache via appStore, Mifflin-St Jeor macros from profile
- progressService: local progress entries + logMeasurement

Workout / exercises
- Batch insert sets in completeSession
- Exercise favorites (persisted) + filter on Exercises tab
- Achievement sync to Supabase + PR achievement

Notifications
- notificationService (expo-notifications) + prefs in Supabase
- AuthProvider: permission prompt, outbox flush on foreground

Other
- database/migrations/002_exercise_media_policy.sql
- jest.setup.js AsyncStorage mock; nutrition unit tests
```

---

## Tests Run

```bash
npm run typecheck  # PASS
npm test           # PASS (21 tests)
```

---

## Remaining (non-blocking for internal MVP)

```text
- Supabase Edge Function to delete auth.users after account deletion (client deletes app data only)
- LLM-backed AI coach (Phase 9) — still rule-based in ai.ts
- E2E/Detox, store release assets, analytics (Phases 12–15)
- Guest → registered account linking
```

---

# 10. Consolidated status — what is DONE (for senior developer review)

**Last updated:** 2026-09-28  
**Purpose:** Single shareable summary of implemented work in this repo. Earlier update blocks below remain as a chronological log; **this section is the source of truth for “done vs pending.”**

**Repository:** `fitguide` (Expo SDK 56, React Native 0.85, Supabase)  
**Audit baseline:** [FITGUIDE_CODEBASE_AUDIT.md](FITGUIDE_CODEBASE_AUDIT.md) (Phase 0; issue table not fully refreshed — use this section + AUDIT mapping below)

---

## Executive summary

Fit Guide has a **usable MVP**: auth (including anonymous guest), onboarding, workout generate/play/finish with offline resilience, progression/RPE/PRs, exercise library + favorites, home/recovery/progress/nutrition flows, profile settings/privacy/measurements, basic notifications, and iOS simulator launch fix. **Not launch-complete** for App Store / GDPR-full delete / LLM coach / E2E release pipeline.

**Automated checks (last run):**

```bash
npm run typecheck   # PASS
npm test            # PASS — 12 suites, 32 tests
```

**Operator / Supabase checklist (not all verifiable from CI):**

```text
1. Enable Anonymous sign-in in Supabase Auth (for cloud guest).
2. Run database/setup_supabase.sql or migrations + seeds (exercise library).
3. Run database/fix_anonymous_signup.sql if anonymous signup returns 500 (drops conflicting on_auth_user_created trigger; app creates profile on onboarding).
4. Optional: database/migrations/002_exercise_media_policy.sql for exercise_media RLS.
5. Configure Google/Apple OAuth in Supabase; scheme fitguide, callback auth/callback.
6. iOS: prebuild + pods; SceneDelegate fix committed under ios/ when using dev client.
7. Run database/migrations/003_sprint1_idempotency_engagement.sql (Sprint 1).
8. Run database/migrations/004_nutrition_foundation.sql and 005_saved_meals.sql (Sprint 2 nutrition).
9. Deploy supabase/functions/delete-account per supabase/README.md.
```

---

## Phase 0 — Audit

| Item | Status |
|------|--------|
| Full codebase audit | **Done** — `FITGUIDE_CODEBASE_AUDIT.md` (sections 1–26, AUDIT-001–030, P0/P1/P2 backlogs) |
| Feedback protocol file | **Done** — this file |

---

## Phase 1 — Auth, guest, database guards

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-001, 002, 007, 020 | **Fixed** | No `guest`/`demo` FK IDs; Supabase Anonymous Auth or `local:` IDs |
| AUDIT-009 | **Fixed** | Login → register / forgot-password |
| Guest onboarding | **Done** | Guests complete onboarding; profile saved when syncable |
| Anonymous DB 500 fallback | **Done** | Local guest if Supabase trigger/RLS blocks anonymous user |
| `canSyncUserToSupabase()` | **Done** | `src/utils/userId.ts`; guards in workout/progress/nutrition services |
| Screen error boundary | **Done** | `ScreenErrorBoundary` on root stack |
| Apple sign-in (iOS) | **Done** | `SocialSignInButtons` + `authStore.signInWithApple` |
| Password reset deep link | **Done** | `app/(auth)/reset-password.tsx`, `authService.updatePassword` |
| Delete user **app data** | **Done** | `deleteAllUserData` + Privacy screen; **does not** delete `auth.users` (needs Edge Function) |

**Key files:** `src/store/authStore.ts`, `src/services/auth.ts`, `src/utils/userId.ts`, `src/utils/authErrors.ts`, `app/(auth)/*`, `database/fix_anonymous_signup.sql`

---

## Phase 2 — Offline / sync

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-003, 004, 005, 006, 008, 028 | **Fixed** | Persisted workout store, resume card, local session start, safe finish |
| Outbox | **Done** | `src/services/sync/outbox.ts` — type `complete_workout` only |
| Sync worker | **Done** | `syncWorker.ts`; flush on auth init + **AppState active** |
| Player finish UX | **Done** | Alert + queue on server failure; PR/history invalidation |

**Key files:** `src/store/workoutStore.ts`, `src/services/workout.ts`, `app/workout/player.tsx`, `src/providers/AuthProvider.tsx`

---

## Phase 3–4 — Workout engine & player

| Item | Status | Notes |
|------|--------|--------|
| Progression service | **Done** | `src/services/progression.ts` — e1RM, summaries, suggest weight, PR detect |
| Generation uses history | **Done** | `workout.ts` — `loadPerformanceSummaries`, `buildWorkoutExercises` |
| RPE in player | **Done** | AUDIT-029; stored on sets |
| Last performance UI | **Done** | Exercise history query in player |
| PR alert on finish | **Done** | Prior summaries loaded **before** sync |
| Supersets / advanced structures | **Not done** | — |
| AUDIT-024 batch sets | **Done** | `completeSession` batch insert; local sync path already batch |

**Key files:** `src/services/progression.ts`, `src/services/__tests__/progression.test.ts`, `app/workout/player.tsx`, `src/services/workout.ts`

---

## Phase 5–6 — Exercise platform

| Item | Status | Notes |
|------|--------|--------|
| Exercise library (Supabase) | **Done** (requires seed) | `exerciseService`, tabs + detail |
| Favorites | **Done** | Persisted in `appStore.favoriteExerciseIds`; heart on detail; filter on Exercises tab |
| `useExercises` hook | **Done** | Used on Exercises tab (AUDIT-016 partial) |
| 3D/video media player | **Not done** | Placeholder UI on detail only |
| AUDIT-021 exercise_media RLS | **SQL provided** | `database/migrations/002_exercise_media_policy.sql` — run on Supabase |

**Key files:** `app/(tabs)/exercises.tsx`, `app/exercise/[id].tsx`, `src/hooks/useFitness.ts`, `src/store/appStore.ts`

---

## Phase 7 — Nutrition

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-011 | **Fixed** | `app/nutrition/log.tsx` |
| AUDIT-019 | **Fixed** | Mifflin–St Jeor macros from profile (`nutritionService.calculateMacros`) |
| Home nutrition + Log link | **Done** | `app/(tabs)/index.tsx` |
| Offline nutrition cache | **Done** | `appStore.cachedNutrition` + local upsert when not syncable |
| Meal-level logging (foods, meals) | **Done** | `meal_logs` / `meal_log_items`, `nutritionMeals.ts`, add-food + log screens |
| Saved foods / saved meal templates | **Done** | `foods.is_saved`, `saved_meals` (005), bookmark + apply/save UI |
| Offline meal items + outbox sync | **Done** | `appStore.localMealItems`, outbox `meal.item.added`, sync worker handler |
| Home remaining calories | **Done** | Merges meal items into home `NutritionCard` |
| Barcode scanner (Open Food Facts) | **Done** | `app/nutrition/scan-barcode.tsx`, `foodLookup.ts` |
| Describe meal (rules + optional AI) | **Done** | `mealDescribe.ts`, `describe-meal` edge function |
| MFP-style Diary tab | **Done** | `app/(tabs)/diary.tsx`, day nav, kcal remaining hero |
| Recent / frequent foods | **Done** | `006_diary_food_rpc.sql`, `mealFrequency.ts` |
| Quick-add / copy meal / copy day | **Done** | `nutritionMealsService` |
| Expanded food catalog | **Done** | `seed_foods_expanded.sql`, `generate-food-seeds.mjs` |

**Key files:** `src/services/nutrition.ts`, `src/services/nutritionMeals.ts`, `database/migrations/004_*`, `005_saved_meals.sql`, `006_diary_food_rpc.sql`, `app/(tabs)/diary.tsx`, `app/nutrition/*`

**Diary manual QA:** Change day → log food → recent chip re-logs; copy yesterday; quick-add offline → flush outbox; run `006` + `seed_foods_expanded.sql` on Supabase.

---

## Phase 8 — Progress

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-012 | **Fixed** | Weight/body fat log on Progress tab |
| AUDIT-018 | **Fixed** | Body fat shows — when no data |
| Local progress entries | **Done** | `appStore.localProgress` merged with server |
| Body measurements screen | **Done** | `app/measurements/index.tsx` → `logMeasurement` |
| Charts / recovery on Progress tab | **Done** (existing) | `SimpleLineChart`, recovery chips |

**Key files:** `app/(tabs)/progress.tsx`, `src/services/progress.ts`, `app/measurements/index.tsx`

---

## Phase 9 — AI coach

| Item | Status | Notes |
|------|--------|--------|
| Rule-based recommendations | **Done** | `src/services/ai.ts`, home cards |
| LLM / external API | **Not done** | AUDIT-026 / Phase 9 |

---

## Phase 10 — Profile & settings

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-010 | **Fixed** | Menu routes: Nutrition, Measurements, Settings, Export/Privacy |
| Settings | **Done** | Units, notification prefs, save to Supabase |
| Privacy / export | **Done** | Share JSON export; delete app data |
| AUDIT-030 account deletion | **Partial** | App rows deleted; auth user needs Edge Function |
| Dedicated “Notifications” screen | **Partial** | Menu opens Settings (shared toggles) |

**Key files:** `app/(tabs)/profile.tsx`, `app/settings/*`, `app/measurements/index.tsx`

---

## Phase 11 — Notifications

| Item | Status | Notes |
|------|--------|--------|
| expo-notifications plugin | **Done** | `app.json` |
| `notificationService` | **Done** | Permissions, prefs table, daily workout reminder schedule |
| In-app notification inbox | **Not done** | DB table exists; no UI |
| Water / weekly scheduled reminders | **Partial** | Prefs saved; not all schedules implemented |

**Key files:** `src/services/notifications.ts`, `app/settings/index.tsx`

---

## Phase 12–15 — Testing, analytics, release

| Item | Status |
|------|--------|
| Unit tests | **Done** — progression, userId, format, recovery, nutrition |
| Jest AsyncStorage mock | **Done** — `jest.setup.js` |
| Integration / E2E (Detox) | **Not done** |
| CI pipeline / store assets / Sentry | **Not done** |

---

## Native / iOS

| Item | Status |
|------|--------|
| UIScene / SceneDelegate crash | **Fixed** — `ios/FitGuide/SceneDelegate.swift`, `Info.plist`, `app.json` |
| Simulator run scripts | **Done** — `scripts/native-env.sh`, `npm run ios` (iPhone 18 Pro) |
| `ios/` folder | Generated via prebuild; may be local-only in git |

---

## Data & achievements

| Item | Status | Notes |
|------|--------|--------|
| AUDIT-015 achievements | **Partial** | Unlock syncs to `achievements` table; profile still shows local count |
| AUDIT-014 streak | **Partial** | Still local `appStore` streak (not server-backed) |
| Achievement types | **Done** | first_workout, ten_workouts, thirty_day_streak, first_pr |

**Key files:** `src/services/achievements.ts`, `src/store/appStore.ts`

---

## AUDIT registry — quick “fixed in app” map

```text
P0 AUDIT-001–008     → Fixed (verify live on your Supabase project)
P1 AUDIT-009         → Fixed
P1 AUDIT-010–013     → Fixed (010 menu; 013 Apple)
P1 AUDIT-011, 012    → Fixed (nutrition + progress UI)
P1 AUDIT-018, 019    → Fixed
P1 AUDIT-028, 029    → Fixed
P1 AUDIT-014, 015    → Partial (local streak; achievements sync on unlock)
P1 AUDIT-016         → Partial (useExercises adopted; not all screens)
P1 AUDIT-017         → Partial (dev console.warn if env missing)
P1 AUDIT-020         → Fixed
P1 AUDIT-030         → Partial (data delete only)
P2 AUDIT-021         → SQL migration added; operator must run
P2 AUDIT-022, 024    → Fixed
P2 AUDIT-023, 025    → Open (full library fetch for workout gen)
P2 AUDIT-026, 027    → Open (LLM; notification depth)
P2 AUDIT-027 testing → Open (beyond 21 unit tests)
```

---

## What is NOT done (pending for senior prioritization)

```text
1. Guest / anonymous → Google / Apple / email account linking (identity merge).
2. Supabase Edge Function to delete auth.users after in-app “delete data”.
3. LLM-backed AI coach (replace or augment ai.ts heuristics).
4. Workout supersets, templates, advanced session types.
5. Exercise video/3D playback; exercise_media fully wired in UI.
6. Outbox for nutrition, progress, measurements (offline writes beyond workouts).
7. Server-backed streak; achievements list UI from DB on profile.
8. Full notification scheduling (water, weekly) + in-app notifications list.
9. Paginated / equipment-scoped exercise queries (performance).
10. E2E tests, release CI, analytics/crash reporting, store listing assets.
11. Refresh FITGUIDE_CODEBASE_AUDIT.md issue table to match this section.
12. Live QA matrix: OAuth, reset password email on device, anonymous + workout sync E2E.
```

---

## Primary new / touched paths (inventory)

```text
Docs
- FITGUIDE_CODEBASE_AUDIT.md
- FITGUIDE_CURSOR_FEEDBACK.md (this file)
- APP_SUMMARY.md (partially updated)

Database
- database/fix_anonymous_signup.sql
- database/migrations/002_exercise_media_policy.sql
- database/setup_*.sql, seed scripts (existing + generated)

App routes
- app/nutrition/log.tsx
- app/settings/index.tsx, app/settings/privacy.tsx
- app/measurements/index.tsx
- app/(auth)/reset-password.tsx
- app/workout/player.tsx (player polish)

Services
- src/services/progression.ts
- src/services/achievements.ts
- src/services/notifications.ts
- src/services/sync/outbox.ts, syncWorker.ts
- src/services/auth.ts, workout.ts, nutrition.ts, progress.ts (extended)

Stores / utils
- src/store/workoutStore.ts (persist, RPE)
- src/store/appStore.ts (favorites, local nutrition/progress, achievements)
- src/store/authStore.ts (guest, deleteAccount)
- src/utils/userId.ts, authErrors.ts

Tests
- src/services/__tests__/progression.test.ts
- src/services/__tests__/nutrition.test.ts
- src/utils/__tests__/userId.test.ts
- jest.setup.js, jest.config.js

Native (when prebuild present)
- ios/FitGuide/SceneDelegate.swift, AppDelegate.swift, Info.plist
```

---

## Questions still open for architect

```text
1. v1 guest upgrade: linkIdentity vs force new account + export/import?
2. Should streak/achievements be server-only with migration from local appStore?
3. Outbox scope: nutrition/progress next, or single “sync bundle” RPC?
4. AI: stay heuristic for v1 or block launch on LLM integration?
5. Approve Edge Function contract for auth.users deletion (GDPR).
```

---

**End of consolidated status.** Chronological `## Update` blocks above remain for audit trail.

---

## Update

**Date:** 2026-09-28

**Phase:** Sprint 1 — Production Foundation

**Task/Issue:** Guest linking, generic outbox + idempotency, secure delete, server streaks/achievements, doc refresh

**Status:** Completed (pending senior review + operator deploy of SQL + Edge Function)

---

## What I Found

- OAuth sign-in replaced anonymous sessions instead of linking identities.
- Outbox was workout-only with no `idempotency_key`; retries could duplicate `workout_sessions`.
- Account deletion removed app rows client-side but not `auth.users`.
- Streak/achievements were driven by local `appStore`, not Postgres.

---

## What I Changed

```text
Auth / linking
- authService: getLinkingContext, linkEmailIdentity, linkOAuthIdentity, invokeDeleteAccount
- signInWithOAuth auto-links when session is anonymous
- authStore: post-auth runPostAuthMigration; signUp uses linkEmailIdentity for anonymous
- accountMigration.ts: local: → Supabase user_id rewrite (cache, workout, outbox)
- SocialSignInButtons + register copy for guest preservation
- initialize: only purge legacy guest/demo (not local: guests)

Outbox
- Generic OutboxMutation + operation types; legacy complete_workout migration on read
- syncWorker handler registry (workout, nutrition, progress, measurement)
- nutrition/progress enqueue on server failure

Idempotency + engagement (SQL)
- database/migrations/003_sprint1_idempotency_engagement.sql
- workout_sessions.client_session_id UNIQUE; syncCompletedSession handles 23505
- user_engagement table + recompute_user_engagement + recompute_achievements RPCs
- engagementService; home/profile read server streak; player refreshes after sync

Delete account
- supabase/functions/delete-account Edge Function (JWT → admin.deleteUser)
- deleteAccountSecure + privacy flow (flush outbox → invoke → clear local)
- supabase/README.md deploy steps

Tests
- outbox.test.ts, engagement.test.ts, authLinking.test.ts
- tsconfig exclude supabase/functions for typecheck
```

---

## Database Changes

```text
Run: database/migrations/003_sprint1_idempotency_engagement.sql
Deploy: supabase functions deploy delete-account
Enable: Manual linking in Supabase Auth (for anonymous → OAuth)
```

---

## Tests Run

```bash
npm run typecheck  # PASS
npm test           # PASS — 8 suites, 27 tests
```

---

## Manual Testing

```text
Not run in CI — use Sprint 1 QA checklist in senior plan (anonymous link, local migrate, offline outbox, delete account, streak).
```

---

## Known Problems

```text
1. Edge Function must be deployed or delete falls back to client deleteAllUserData + signOut only.
2. linkIdentity requires Supabase “Manual linking” enabled.
3. OAuth linkIdentity on React Native uses in-app browser (same as sign-in).
4. Local guest migration does not auto-upload all historical workouts until outbox flush / manual sync.
5. achievement.updated / settings.updated handlers are stubs until Sprint 2.
```

---

## Risks

```text
- Email link on anonymous may require email confirmation depending on Supabase settings.
- recompute_* RPCs no-op gracefully if migration 003 not applied (42883).
```

---

## Questions for Senior Developer

```text
1. Approve Sprint 2 nutrition schema direction?
2. Should email confirmation block “linked” state in UI?
3. Integration/E2E test harness priority before Sprint 2?
```

---

## Sprint 1 Phase Summary

**Completed:** A–E per production foundation plan (linking, outbox, delete, engagement, docs touch).

**Next:** Senior review gate for Sprint 3 (AI meal scanner / describe-meal).

---

## Update

**Date:** 2026-09-28

**Phase:** Sprint 2 — Nutrition foundation (after Sprint 1)

**Status:** Complete (Sprint 3 scanner + describe added 2026-09-28)

**What I Changed:**

```text
database/migrations/004_nutrition_foundation.sql — foods, meal_logs, meal_log_items, recompute RPC, seeds
database/migrations/005_saved_meals.sql — saved_meals templates + RLS
src/services/nutritionMeals.ts — foods search, saved foods, meal CRUD, saved meals apply/create, local + outbox
src/services/sync/outbox.ts + syncWorker.ts — meal.item.added
src/store/appStore.ts — localMealItems persist
src/types/index.ts — Food, MealLog*, SavedMeal*, LocalMealLogItem
app/nutrition/log.tsx — meals, saved meals, save template, macro totals from items
app/nutrition/add-food.tsx — saved foods, bookmark custom foods, save & add
app/(tabs)/index.tsx — meal-aware nutrition + kcal remaining
```

**Sprint 3 add-on:**

```text
src/services/foodLookup.ts — Open Food Facts barcode lookup
src/services/mealDescribe.ts — rule parser + optional describe-meal edge function
app/nutrition/scan-barcode.tsx, describe-meal.tsx — UI + routes
supabase/functions/describe-meal — OPENAI_API_KEY (optional)
expo-camera plugin in app.json
```

**Not done yet:** integration/E2E tests for meal sync; photo-based meal scanner.

**Operator:** Run migrations 004 and 005 after 003.
