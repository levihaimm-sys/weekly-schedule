IMPORTANT: Read this entire file before doing anything else

# Weekly Schedule App

# Project Instructions

## Language
Always respond in Hebrew, unless I explicitly ask otherwise.

## Performance Rules
- Never run `tsc --noEmit` — skip type checking entirely
- Never run `npm install` unless I explicitly ask
- Keep bash commands short and focused — avoid chaining long commands
- If a command takes more than 30 seconds, stop and tell me instead of waiting

## General
- Prefer small, focused changes over large rewrites
- After each task, summarize what you did in 2-3 lines
- **Stop immediately after completing work.** Do NOT run any verification commands (type checks, linting, builds) at the end of a task unless explicitly asked. This causes the session to hang.

## להבין לפני שבונים
כשבקשה עמומה או נוגעת בכללים עסקיים (רוטציה, ציוד, דוחות, "להסתיר כמו X"), לפני שמשנים קוד או נתונים:
כתוב משפט אחד-שניים בעברית: מה הבנת, אילו מסכים ישתנו (לוח שבועי, לוח קבוע, אריחים, אפליקציית מדריכים, דוחות), ומה **לא** ישתנה. חכה לאישור.
בשינוי קטן וברור אין צורך לשאול.

## כללים עסקיים
**שיבוץ ומדריכים**
- מדריך חדש ברוטציה נכנס **אחרי** הקיימים. לא מעבירים היסטוריה או ציוד בלי בקשה מפורשת.
- סדר הרוטציה קובע מי מופיע בטבלת השיבוצים. בהחלפת מדריך מעדכנים גם את סדר הרוטציה.
- עריכה במערכת הקבועה חלה מהיום והלאה בלבד, ולעולם לא דורסת שיעורים עם `is_one_time_change=true` (שינויים ידניים בלוח השבועי).
- השבוע מתחלף ביום חמישי ב-18:00, גם אצל מנהלים וגם אצל מדריכים.
- שאלות על "מי היה משובץ" בעבר נבדקות ב-`schedule_undo_log`, לא בטבלת `lessons` הנוכחית.

**מקומות ולקוחות**
- אזורים נפרדים נשארים נפרדים (באר יעקב ≠ ראשון לציון). מקבצים לפי לקוח + עיר, אף פעם לא לפי עיר בלבד.
- אותו שם גן קיים בכמה ערים, לכן מזהים גן לפי עיר + שם. "פת" במסד = פתח תקווה.
- הלקוח נשמר כטקסט חופשי (`client_name`) ברוב הטבלאות ולא כמפתח (`client_id`). צריך להיזהר מאי-התאמות בשמות.

**ספירות ודוחות**
- סופרים רק שיעורים שהתקיימו: בלי שיעורים מבוטלים ובלי היעדרויות מדריך. בודקים כפילויות (אותו גן, תאריך ושעה).
- בהפרש בין מספרים מוצאים את השיעורים המדויקים שסכומם שווה להפרש.
- הנתונים מתחילים בפברואר 2026. בשאלות שנתיות מציינים זאת.
- דוח אפטר סקול: טבלה אחת, שורה לכל מסגרת, בלי שמות מדריכים (פירוט בזיכרון).

**ציוד ומערכים**
- "ציוד נדרש" = רק פריטים נוספים מהמחסן מעבר לערכה הבסיסית, לא רשימה מלאה.
- מחיקת פריט ציוד מוחקת את הקישורים שלו למערכים. מעבירים קודם את הקישורים לפריט אחר.
- "מערך N" = קטגוריית המערכים החדשים, `week_number` = N+65. מזהים מערך לפי שם.

**מסכים**
- אפליקציית המדריכים נקייה: בלי הערות מנהל, בלי סיבות היעדרות ובלי מידע על השלמות.
- משנים עיצוב רק במקום שביקשתי. באריחים השבועיים שם המדריך נשאר ראשון.

## לפני פקודות ההעלאה (git)
- לפני שאתה נותן לי פקודות `git add / commit / push`, הרץ `git status` (פקודה קצרה, לא build).
- כל קובץ חדש (`??`) שהשינוי משתמש בו חייב להיכנס ל-`git add`. אחרת Vercel ייכשל או יחזיר 404.
- הודעת ה-commit באנגלית.

## PowerShell
- הסביבה היא Windows + PowerShell. בכל פקודה שאני מריץ, נתיב עם סוגריים או רווחים נכתב בתוך מרכאות, למשל `git add "src/app/(dashboard)/schedule/page.tsx"`.
- בלי `&&` ובלי תחביר bash בפקודות שאתה נותן לי.
- כשיש כמה פקודות שרצות ברצף, כתוב את כולן בבלוק קוד אחד (שורה לכל פקודה), כדי שאוכל להעתיק ולהדביק בבת אחת.

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