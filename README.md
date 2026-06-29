# Fit Guide

**Train Smarter. Lift Better.**

AI-powered personal fitness coach built with React Native, Expo, and Supabase.

## Features

- **AI Workout Generator** — Personalized workouts based on goals, equipment, and recovery
- **Exercise Library** — 12+ exercises with instructions, tips, and muscle targeting
- **Workout Player** — Real-time set tracking with rest timers
- **Recovery Tracking** — Per-muscle recovery scores and status
- **Progress Charts** — Weight, body fat, and volume trends
- **AI Coach** — Context-aware recommendations and weekly summaries
- **Interactive Body Map** — Tap muscles to filter exercises
- **Nutrition Tracking** — Macro and water intake monitoring
- **Achievements** — Streaks, milestones, and personal records
- **Offline Support** — Cached workouts with sync when online

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native, Expo, TypeScript |
| Routing | Expo Router |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand |
| Data Fetching | React Query |
| Forms | React Hook Form + Zod |
| Backend | Supabase (Auth, Database, Storage) |
| Charts | Victory Native |
| 3D | React Three Fiber, SVG Body Map |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- Supabase account (optional — app works in demo/guest mode)

### Installation

```bash
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm start
```

### Database Setup

Run the migration in your Supabase SQL Editor:

```
database/migrations/001_initial_schema.sql
```

## Project Structure

```
app/                    # Expo Router screens
  (auth)/               # Authentication & onboarding
  (tabs)/               # Main tab navigation
  exercise/             # Exercise detail
  workout/              # Workout player
src/
  components/           # Reusable UI components
  constants/            # App constants & sample data
  hooks/                # Custom React hooks
  providers/            # Context providers
  services/             # API & business logic
  store/                # Zustand stores
  types/                # TypeScript types
  utils/                # Utility functions
  ai/                   # AI coach logic
  3d/                   # 3D body components
database/               # SQL migrations
```

## Design System

| Token | Value |
|-------|-------|
| Background | `#090909` |
| Cards | `#161616` |
| Primary | `#6C63FF` |
| Secondary | `#00D9A5` |
| Error | `#FF5252` |
| Warning | `#FFC107` |
| Border Radius | `20px` |

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm test           # Run tests
npm run typecheck  # TypeScript check
```

## License

MIT
