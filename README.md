# Fit Guide

**Train Smarter. Lift Better.**

AI-powered personal fitness coach — **web app first**, with a clear path to iOS/Android later.

## Web-First

Fit Guide runs in the browser as the primary platform. The same Expo/React Native codebase converts to native mobile apps when you're ready — no rewrite required.

```bash
npm install
npm run dev          # Opens in browser (default)
npm run build:web    # Production static build → dist/
```

See [docs/WEB_TO_MOBILE.md](docs/WEB_TO_MOBILE.md) for the mobile conversion guide.

## Features

- **AI Workout Generator** — Personalized workouts based on goals, equipment, and recovery
- **Exercise Library** — Searchable library with interactive body map
- **Workout Player** — Set tracking with rest timers
- **Recovery Tracking** — Per-muscle recovery scores
- **Progress Charts** — Weight and body composition trends
- **AI Coach** — Context-aware training recommendations
- **Nutrition** — Macro tracking and meal suggestions

## Layout

| Screen size | Navigation |
|-------------|------------|
| Desktop (≥768px) | Sidebar |
| Mobile web | Bottom tabs |
| Native app (later) | Bottom tabs |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | Expo Web + React Native Web |
| Mobile (later) | Same codebase via EAS Build |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand + React Query |
| Backend | Supabase (optional — guest mode works offline) |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (optional)

### Development

```bash
npm install
cp .env.example .env   # Optional Supabase credentials
npm run dev            # Web dev server
```

### Production Web Build

```bash
npm run build:web
npm run preview:web    # Preview dist/ locally
```

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages.

### Mobile (Later)

```bash
npm run start:mobile   # Expo dev for iOS/Android
eas build --platform all
```

## Database

Run `database/migrations/001_initial_schema.sql` in Supabase SQL Editor.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Web development (default) |
| `npm run build:web` | Static web export |
| `npm run start:mobile` | Mobile development |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |

## Design

Dark theme — `#090909` background, `#6C63FF` primary, `#00D9A5` secondary, 20px card radius.

## License

MIT
