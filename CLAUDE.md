# Weekly Schedule App

# Project Instructions

## Language
Always respond in English only, regardless of what language I write in.

## Performance Rules
- Never run `tsc --noEmit` — skip type checking entirely
- Never run `npm install` unless I explicitly ask
- Keep bash commands short and focused — avoid chaining long commands
- If a command takes more than 30 seconds, stop and tell me instead of waiting

## General
- Prefer small, focused changes over large rewrites
- After each task, summarize what you did in 2-3 lines
- **Stop immediately after completing work.** Do NOT run any verification commands (type checks, linting, builds) at the end of a task unless explicitly asked. This causes the session to hang.
## Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with `clsx` and `tailwind-merge`
- **Database**: Supabase (Auth + Postgres)
- **Icons**: lucide-react
- **PDF**: @react-pdf/renderer, react-pdf, pdfjs-dist
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Public auth pages (login, instructor-login)
│   ├── (dashboard)/        # Admin pages (schedule, instructors, locations, reports, lesson-plans)
│   ├── (instructor)/       # Instructor pages (today, my-schedule, sign, profile)
│   ├── (admin)/            # Admin-only pages (equipment-distribution)
│   └── api/                # API routes (reports, lesson-plans, equipment)
├── components/             # React components organized by feature
├── lib/
│   ├── supabase/           # Supabase clients (client.ts, server.ts, admin.ts)
│   ├── actions/            # Server actions (auth, signatures, instructors)
│   ├── queries/            # Data queries (schedule)
│   └── utils/              # Utilities (cn, date, waze, constants, html-sanitizer)
├── types/                  # TypeScript type definitions
└── data/lesson-plans/      # Auto-generated lesson plan JSON data
scripts/                    # One-off migration/import scripts
```

## Key Patterns
- Path alias: `@/*` maps to `./src/*`
- Supabase SSR auth with middleware cookie management
- Two user roles: **admin** and **instructor** (separate login flows)
- RTL/Hebrew UI (using Heebo font)
- Server components by default, `"use client"` only when needed

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - ESLint

## Bash Rules
- Avoid bash commands entirely — use Read, Glob, and Write tools instead
- Never run `tsc --noEmit`
- Never run `git diff`
- Never run `grep`
- Never run `npm run build` unless I explicitly ask
- Never chain commands with `&&`
- Never run any command that opens an interactive pager
- If you must run bash, always add `| head -100` to limit output
- If a command runs more than 15 seconds, abort it and tell me