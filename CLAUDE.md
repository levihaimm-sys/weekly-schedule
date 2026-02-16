# Weekly Schedule App

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
