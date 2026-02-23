# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BZ Fitness and Wellness - A fitness business website with a public landing page and protected admin dashboard for managing members, attendance, payments, and schedules.

## Commands

```bash
# Install dependencies
bun install

# Development
bun run dev          # Starts on port 3000

# Build & Production
bun run build        # Creates standalone output in .next/standalone
bun start            # Runs production server

# Linting
bun run lint

# Database (Prisma with SQLite)
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
```

## Architecture

### Frontend Structure
- `src/app/page.tsx` - Main landing page (hero, about, programs, pricing, contact)
- `src/app/admin/*` - Protected admin dashboard pages (members, attendance, payments, schedule, contact)
- `src/components/ui/` - shadcn/ui component library
- `src/components/contact-form.tsx` - Isolated contact form component (uses `suppressHydrationWarning` to avoid browser extension conflicts)

### API Routes
- `src/app/api/contact/route.ts` - Public contact form submission
- `src/app/api/admin/*` - Protected admin API endpoints for CRUD operations
- API routes use Prisma client from `src/lib/db.ts`

### Authentication
- Cookie-based session auth (`src/lib/auth.ts`)
- Middleware protects all `/admin/*` routes except `/admin/login`
- Login: `/admin/login` | Credentials in `.env` (ADMIN_USERNAME, ADMIN_PASSWORD_HASH)

### Database
- SQLite database at `db/custom.db`
- Schema in `prisma/schema.prisma`
- Key models: `Member`, `Attendance`, `Payment`, `Schedule`, `ContactSubmission`

## Key Patterns

- Forms use `react-hook-form` with `zod` validation
- State management via `zustand` and `@tanstack/react-query`
- UI styling: Tailwind CSS 4 + shadcn/ui components
- Date handling: `date-fns`
- Next.js configured for standalone output mode
