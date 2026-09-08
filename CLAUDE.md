# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BZ Fitness and Wellness - A fitness business website with a public landing page and a protected admin dashboard for managing members, attendance, payments, and schedules.

## Commands

```bash
# Install dependencies
bun install

# Development
bun run dev          # Starts on port 3000

# Build & Production
bun run build        # Runs `prisma generate && next build`
bun start            # Runs production server

# Linting
bun run lint

# Database (Prisma)
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
```

There is no test suite in this repository.

## Architecture

### Frontend Structure
- `src/app/page.tsx` - Public landing page (hero, about, programs, pricing, contact)
- `src/app/admin/*` - Protected admin dashboard pages (dashboard, members, attendance, payments, schedule, contact, users)
- `src/components/admin-layout.tsx` - Shared admin shell (nav, mobile sheet, dark mode, role-aware "Users" nav item)
- `src/components/ui/` - shadcn/ui component library
- `src/components/contact-form.tsx` - Isolated public contact form component (uses `suppressHydrationWarning` to avoid browser-extension DOM conflicts)

### API Routes
- `src/app/api/contact/route.ts` - Public contact form submission
- `src/app/api/schedule/route.ts` - Public read-only schedule (only active items), consumed by the landing page
- `src/app/api/admin/*` - Protected admin API endpoints for CRUD on members, attendance, payments, schedule, contact submissions, and users
- `src/app/api/admin/members/[id]/workout-plan/route.ts` - Generates an AI workout plan via the Groq API (`llama-3.3-70b-versatile`), using member profile, goals, weight history, and personal records as prompt context. Requires `GROQ_API_KEY`.

### Database Access — Two Prisma Clients
- `src/lib/db.ts` - Standard singleton `PrismaClient` (cached on `globalThis` in dev). Used by most routes.
- `src/lib/fresh-db.ts` - `getFreshDb()` returns a new client per call. If `TURSO_DATABASE_URL` is set it uses `@prisma/adapter-libsql` against Turso (production); otherwise it falls back to local SQLite. Read `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` via bracket notation (`process.env['VAR']`) to avoid Turbopack inlining them at build time. Prefer this in newer routes that need to run against Turso in production.
- Route handlers with a dynamic `[id]` segment must `await params` (Next.js 15+ makes `params` a `Promise`).

### Database
- Local dev: SQLite at `db/custom.db`
- Production: Turso (libSQL) — see `src/lib/fresh-db.ts`
- Schema in `prisma/schema.prisma`. Key models: `Member` (with related `Attendance`, `Payment`, `WeightEntry`, `MemberGoal`, `PersonalRecord`), `Schedule`, `ContactSubmission`, `AdminUser`
- After schema changes: `bun run db:generate` (or `db:push` for local dev), then restart the dev server

### Authentication & Authorization
- Custom cookie-based session auth (`src/lib/auth.ts`), not NextAuth despite the dependency being present
- Session cookie (`admin_session`) is a base64 JSON payload + HMAC-SHA256 signature (`SESSION_SECRET`/`NEXTAUTH_SECRET`), 24h expiry, `httpOnly`
- `src/middleware.ts` only checks that the `admin_session` cookie is present (fast path, no crypto) and redirects to `/admin/login` if missing — it does **not** verify the signature. Full signature verification and role extraction happens in `getSession()` (`src/lib/auth.ts`), called from individual pages/routes
- RBAC: `AdminSession.role` is `'admin' | 'superadmin'`. Superadmin-only areas (e.g. `/admin/users`, `src/app/api/admin/users/route.ts`) explicitly check `session.role !== 'superadmin'`
- Login: `/admin/login` | Bootstrap credentials in `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — SHA-256 hex, see `hashPassword`/`verifyPassword` in `auth.ts`); additional admin/superadmin users are managed via `/admin/users` and the `AdminUser` table

## Key Patterns

- Forms use `react-hook-form` with `zod` validation
- State management via `zustand` and `@tanstack/react-query`
- UI styling: Tailwind CSS 4 + shadcn/ui components
- Date handling: `date-fns`
- Shared `formData` state between Add/Edit dialogs must be reset when opening the Add dialog (via `onOpenChange`), since they share the same state object
- The logo (`/BZ.png`) is rendered with a plain `<img>` tag rather than `next/image` (the latter did not render correctly on the login page)
- Next.js is configured with `typescript.ignoreBuildErrors: true` and `reactStrictMode: false` (`next.config.ts`) — TypeScript errors will not fail the build
