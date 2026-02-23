# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build to 'build' directory
```

There are no configured lint or test scripts. Manual test helpers exist at `src/test-server-locally.sh` and `src/test-build.sh`.

## Environment

Two env files are used: `.env.development` and `.env.production`. Both require:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase client is a singleton at `src/utils/supabase/client.tsx`. Project credentials are also stored in `src/utils/supabase/info.tsx` (auto-generated).

## Architecture

This is a React 18 + TypeScript + Vite SPA with Supabase as the backend. Styling uses Tailwind CSS. There is no client-side router — navigation is handled by a `currentView` state variable in `App.tsx` that switches between named views (e.g., `feed`, `dashboard`, `editor`, `article`, `admin`, `swipe`, `profile`, etc.).

### App.tsx (root)

`App.tsx` is the single source of truth for all application state (~2000+ lines). It manages:
- **Auth state**: `isAuthenticated`, `accessToken`, `userId`, `userEmail` via Supabase Auth
- **Content state**: `articles[]`, `userArticles[]`, `selectedArticle`, `searchQuery`
- **User progress**: `userProgress` (XP, level, streak, points), `userBadges`
- **UI/routing state**: `currentView`, modal open states, drawer states

### Mini-Apps System

The app embeds several self-contained "mini-apps" with isolated branding and routing:
- **HEMP MAG** — article browser (purple)
- **HEMP SWIPE** — tinder-style discovery (red)
- **HEMP PLACES** — geographic directory (emerald)
- **HEMP SWAP** — C2C barter marketplace (cyan)
- **HEMP FORUM** — community discussions (indigo)
- **HEMP TERPENE** — cannabinoid hunter game (orange)
- **HEMP GLOBE** — 3D world map (teal)

Mini-app metadata (colors, icons, taglines) lives in `src/config/mini-apps-metadata.tsx`. Types are in `src/types/mini-app.ts`. Components are under `src/components/mini-apps/`, each wrapped by `MiniAppContainer.tsx`.

### Backend (Supabase Edge Functions)

The server is a **Hono.js** TypeScript API at `src/supabase/functions/server/`. Key route files:
- `rss_parser.tsx` — fetches and ingests RSS article feeds
- `discovery_routes.tsx` — matched article recommendations
- `swag_routes.tsx` / `swap_routes.tsx` — marketplace logic
- `places_routes.tsx` — geographic location CRUD
- `messaging_routes.tsx` — user DMs
- `wallet_security.tsx` / `article_security.tsx` — transaction and access validation
- `admin_*.tsx` — admin-only endpoints

Database schema migrations are in `src/supabase/migrations/`.

### Feature Gating

`src/utils/featureUnlocks.ts` gates features (swipe mode, article sharing, article creation, reading analytics, theme customization) behind engagement milestones. The `FeatureUnlockModal` component handles the unlock UI.

### Gamification

Users earn XP from reading articles, accumulate "NADA" points for the swag shop, maintain reading streaks, and unlock badges. All progress is tracked in `userProgress` state and persisted to Supabase.

### UI Components

`src/components/ui/` contains 50+ shadcn-style wrappers around Radix UI primitives (button, dialog, drawer, tabs, form, select, chart, etc.). Use these instead of raw Radix imports.

### Path Aliases

`@` maps to `/src` (configured in `vite.config.ts` and `tsconfig.json`).

## Known Issues & Technical Debt (Priority Order)

### Critical — Fix First
1. **No client-side router** — navigation uses `currentView` string state. Add `wouter` for proper URL routing, deep linking, browser back/forward.
2. **App.tsx god file** — 2000+ lines, 42 hooks. Needs to be split into `AuthProvider`, `UserProvider`, `ArticleProvider` contexts.
3. **Window globals** — components communicate via `(window as any).__swapOpenAddModal` etc. Replace with React Context or events.
4. **No code splitting** — all 300 components load on first visit. Add `React.lazy()` to all 8 mini-apps.

### High Priority
5. **No error boundaries** — a WebGL crash in Globe = blank white screen. Wrap each mini-app.
6. **confirm() dialogs** — native browser confirm() used for destructive actions. Replace with shadcn AlertDialog.
7. **Console.logs in production** — 132 in App.tsx alone. Strip via vite config.
8. **30-second discovery polling** — always running even when tab is hidden. Throttle with Page Visibility API.

### Cleanup
9. **Dead welcome page variants** — ModernWelcomePage, PremiumWelcomePage unused. Delete them.
10. **Figma Make artifacts** — `Code-component-*.tsx` files and duplicate `src/src/` directory. Delete them.
11. **Server monolith** — `src/supabase/functions/server/index.tsx` is 9062 lines. Split into proper modules.
12. **19 TODO comments** in production code.

## Environments

- **Local dev**: `localhost:3000` → `.env.development` → `dewii-dev` Supabase project
- **Production**: Netlify → `.env.production` → `dewii` Supabase project
- **Never run `supabase` CLI commands that require Docker** — not available on this machine

## Working Rules

- Always work on a git branch, never directly on `main`
- Use shadcn/ui components from `s