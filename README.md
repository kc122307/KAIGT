# KAIGT — Goal Glimpse: Achieve Together with AI

An AI‑powered productivity and goal management platform featuring coaching chat, smart goal suggestions, team collaboration, progress analytics, notifications, and real‑time activity tracking.

## Overview

- Intelligent AI coach with multiple personality modes and optional voice interface
- Smart, context‑aware goal suggestions and templates
- Full goal lifecycle: create, edit, filter, track progress, and complete
- Team invitations, collaboration, and notifications with Supabase real‑time
- Rich dashboard with analytics, leaderboard, activity log, and achievements
- Built with `React`, `TypeScript`, `Vite`, `Tailwind CSS`, and `shadcn-ui`

## Tech Stack

- Frontend: `React 18`, `TypeScript`, `Vite`
- UI: `Tailwind CSS`, `shadcn-ui` (Radix UI), `lucide-react`
- State: `zustand` store in `src/store/goalStore.ts`
- Data: `@supabase/supabase-js` with RLS; real‑time channels
- Async: `@tanstack/react-query`
- Charts: `recharts`
- Animations: `gsap`

## Features

- AI Productivity Coach: personalized coaching and recommendations
- Smart Goal Suggestions: tailored to preferences and progress
- Conversation History: revisit coaching insights and sessions
- Personality Modes: motivational, analytical, supportive, strategic
- Smart Templates: pre‑built, AI‑assisted goal frameworks
- Voice Interface: optional voice commands and responses
- Progress Analytics: visual insights into completion and patterns
- Achievement System: milestones and streak tracking
- Team Collaboration: invite members, collaborate with notifications
- Activity Tracking: automatic logging with timestamps
- Smart Notifications: deadlines, achievements, and updates
- Intelligent Insights: AI‑powered productivity suggestions

## Key Pages & Routes

- `/` Landing: marketing overview and feature highlights (`src/pages/LandingPage.tsx`)
- `/login` Auth: email/password login and registration (`src/components/Auth/LoginForm.tsx`)
- `/dashboard` Dashboard: main view (`src/pages/Index.tsx` → `Dashboard`)
- `/goals` Goals: list, filters, details, edit (`src/pages/GoalsPage.tsx`)
- `/tasks` Tasks: task checklist around goals (`src/pages/TasksPage.tsx`)
- `/progress` Progress: analytics/graphs (`src/pages/ProgressPage.tsx`)
- `/activity` Activity: activity log (`src/pages/ActivityPage.tsx`)
- `/notifications` Notifications: inbox and counts (`src/pages/NotificationsPage.tsx`)
- `/leaderboard` Leaderboard: rankings and profiles (`src/pages/LeaderboardPage.tsx`)
- `/settings` Settings: user preferences (`src/pages/SettingsPage.tsx`)
- `/team` Team: invitations, responses, list (`src/pages/TeamPage.tsx`)
- `/ai` AI Coach: chat, history, suggestions, modes (`src/pages/AIPage.tsx`)

## Architecture

- Routing: `react-router-dom` with protected routes in `src/App.tsx`
- State: `zustand` store `useGoalStore` for auth, goals, activities, notifications
- Data access: `src/services/api/*` calling Supabase tables with typed mapping
- Realtime: Supabase `channel` listeners for invitations and notifications
- UI components: `src/components/ui/*` (shadcn‑style primitives)
- Pages: `src/pages/*` composed with feature components under `src/components/*`
- Supabase client: `src/integrations/supabase/client.ts` using environment variables
- Edge Functions: `supabase/functions/*` for AI coach, voice‑to‑text, invitations email

## Supabase Schema (tables used)

- `goals`: user goals with status, progress, deadlines
- `activities`: audit trail of goal actions
- `notifications`: user notifications (types: achievement, collaboration, etc.)
- `profiles`: user profile data for leaderboard/stats
- `team_members`: membership mapping for teams
- `team_invitations`: invitation lifecycle (email/user based)

## AI Coach Integration

- Primary: Supabase Edge Function `ai-coach` calling OpenRouter DeepSeek R1
- Fallback: Direct OpenRouter call from frontend when edge fails
- Context: personality, current goals, conversation history
- Suggestions: optional JSON suggestions for goals, modes, templates

## Team Invitations & Realtime

- Invitations: create, send, accept/decline; email via `Resend` edge function
- Realtime channels: listen to `team_invitations` and `notifications` changes
- Notification bell and list components under `src/components/Team/*`

## Directory Structure

- `src/components/AI/*`: AI coach, history, suggestions, modes, voice UI
- `src/components/Dashboard/*`: dashboard, goal cards, detail modal, edit form, filters
- `src/components/Team/*`: invitations, list, forms, hooks, types
- `src/components/ui/*`: shadcn‑style UI primitives and utilities
- `src/pages/*`: route pages for all features
- `src/services/api/*`: goal, activity, notification, team, user services
- `src/integrations/supabase/*`: typed client and types
- `supabase/functions/*`: `ai-coach`, `voice-to-text`, `send-invitation-email`
- `docs/*`: additional docs for setup and testing

## Setup

Prerequisites:

- Node.js 18+ and `npm`
- Supabase project with tables and RLS configured

Install:

- `npm install`

Environment variables (create `.env.local`):

- Frontend:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_OPENROUTER_API_KEY` (or `VITE_DEEPSEEK_API_KEY`)
- Supabase Edge Function secrets:
  - `DEEPSEEK_API_KEY` (OpenRouter API key recommended)
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

Important: do not commit real API keys. The code includes fallback keys for local testing; you should override them with your own environment values.

## Scripts

- `npm run dev` start local dev server
- `npm run build` build production bundle
- `npm run preview` preview built app
- `npm run lint` run ESLint

## Deploy Edge Functions

- Install Supabase CLI: `npm i -g supabase`
- Login: `supabase login`
- Deploy all: `./deploy-edge-functions.ps1` (PowerShell)
- Or individually: `supabase functions deploy ai-coach`

## Troubleshooting

- AI coach not responding: check API keys and see `AI_COACH_FIX_GUIDE.md`
- 500 errors in AI function: see `DEBUG_500_ERROR.md`
- OpenRouter/DeepSeek setup: see `OPENROUTER_SETUP.md` and `DEEPSEEK_SETUP.md`
- Console fixes and diagnostics: see `CONSOLE_FIXES.md`

## Development Notes

- Protected routes redirect unauthenticated users to `/login`
- `zustand` store initializes data on load and listens to auth changes
- Supabase realtime keeps invitations/notifications in sync
- UI built from composable primitives; prefer `src/components/ui/*`

## License

Proprietary or project‑specific. Add a license file if needed.
