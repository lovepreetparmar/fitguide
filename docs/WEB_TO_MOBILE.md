# Web → Mobile Migration Guide

Fit Guide is built **web-first** using **Expo + React Native Web**. The same codebase powers the browser app today and iOS/Android apps later.

## Current Setup (Web)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start web dev server (default) |
| `npm run build:web` | Export static web build to `dist/` |
| `npm run preview:web` | Preview production web build |

Deploy the `dist/` folder to **Vercel**, **Netlify**, or any static host.

## Architecture for Portability

```
src/
  services/     ← Shared business logic (Supabase, AI, workouts)
  store/        ← Shared state (Zustand)
  types/        ← Shared TypeScript types
  hooks/        ← Shared hooks
  components/   ← UI (works on web + native via React Native Web)
app/            ← Expo Router screens (web + native routes)
```

**~90% of code is shared** between web and mobile. No rewrite needed.

## Converting to Mobile App (Later)

When you're ready for iOS/Android:

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Build native apps

```bash
npm run start:mobile   # Test on iOS Simulator / Android Emulator
eas build --platform ios
eas build --platform android
```

### 3. What changes on mobile?

| Area | Web | Mobile |
|------|-----|--------|
| Navigation | Sidebar (desktop) + bottom tabs (mobile web) | Bottom tabs |
| Storage | localStorage / AsyncStorage | SecureStore |
| Haptics | Disabled | Enabled |
| Notifications | Browser (optional PWA) | Expo Notifications |
| OAuth | Web redirect | Deep links (`fitguide://`) |

All of this is already handled with `Platform.OS` checks in the codebase.

### 4. App Store submission

- Configure `app.json` bundle IDs (already set: `com.fitguide.app`)
- Add app icons and splash screens (already in `assets/`)
- Submit via EAS Submit: `eas submit --platform ios`

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `< 768px` | Mobile web — bottom tabs, compact UI |
| `≥ 768px` | Desktop web — sidebar navigation |
| Native app | Bottom tabs (same as mobile web) |

## Recommended Path

1. **Now** — Ship web app, gather users, iterate fast
2. **Later** — Run `eas build` when ready for App Store / Play Store
3. **Optional** — Add PWA install prompt for mobile web users

No separate codebase. No rewrite. Same Fit Guide, everywhere.
