# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **multi-project workspace** containing three independent applications:
1. **teacher2/Teacher2** – React + Vite instructor evaluation system with Express backend
2. **json** – Static survey form with Vercel serverless analytics endpoint
3. **mikluyoes** – Collection of Korean-language teaching materials and course exercises

Each project has its own `package.json` and deployment configuration. This is not a monorepo.

---

## Commands by Project

### teacher2/Teacher2 (React + Vite + Express)

Located in `/teacher2/Teacher2/`

```bash
# Development server (React + HMR at port 3000)
npm run dev

# Build for production (Vite)
npm run build

# Preview production build locally
npm run preview

# Type checking only (no emit)
npm run lint

# Clean build artifacts
npm run clean
```

**Key files:**
- Entry point: `src/main.tsx` → `App.tsx`
- Instructor data: `src/data/instructors.ts` (100+ records)
- Evaluation rules: `src/data/presets.ts`
- Filter logic: `src/utils/evaluator.ts`

### json (Static HTML/JS Survey)

Located in `/json/`

No build step. It's a static HTML file deployed directly to Vercel.
- Main file: `index.html` (Korean food preference survey, 3-tab interface)
- Analytics tracker: `tracker.js` (form engagement tracking)
- Serverless endpoint: `api/events.js` (Vercel function for event logging)
- CORS config: `vercel.json` (allows POST to `/api/*`)

### mikluyoes (Teaching Materials)

Located in `/mikluyoes/`

Static HTML/JS learning exercises. No build process. Includes:
- Job listing filter exercises (`starter/`, `starter 2/`, `0_starter/`)
- Course portals and rental projects (`01_rental/`, `02_free_course_portal/`)
- Career portfolio pages (`index.html`, `career.html`)
- Various training datasets and archived projects

---

## Technology Stack

**teacher2/Teacher2:**
- **Frontend**: React 19, Vite 6.2, TypeScript 5.8, Tailwind CSS 4.1
- **Icons/Animations**: lucide-react, motion (Framer Motion)
- **Backend**: Express, Google Gemini API (@google/genai)
- **Configuration**: Environment variables via `.env` (see `.env.example`)

**json:**
- Pure HTML/CSS/JavaScript (no framework)
- Vercel Analytics + custom tracking script
- Serverless function runtime (Node.js)

---

## Architecture Notes

### teacher2/Teacher2: Instructor Evaluation System

**Data Flow:**
1. User selects or creates evaluation rules via `PresetSelector` or `FilterForm`
2. Rules are passed to `evaluator.ts` which filters `instructors.ts` records
3. Results display in either table (`InstructorTable`) or grid (`InstructorCardGrid`) view
4. Clicking an instructor opens `InstructorDetailModal` with full details
5. Users can bookmark instructors (persisted to localStorage)

**Key Components:**
- `FilterForm` – Dynamic form with rule inputs
- `InstructorTable` / `InstructorCardGrid` – Dual view modes
- `KpiSummary` – Dashboard showing evaluation stats
- `InstructorDetailModal` / `BookmarkListModal` – Modal dialogs
- `HelpModal` – Help/documentation UI

**State Management:** React hooks with localStorage for bookmarks and notes. No external state library.

**Styling:** Tailwind CSS. Custom design tokens defined in Tailwind config. Animations via motion library.

### json: Survey Form Application

**Data Flow:**
1. User fills three-tab survey form in `index.html`
2. Form submission POSTs to `/api/events` serverless function
3. `tracker.js` logs intermediate events (page views, field starts/completions)
4. `api/events.js` validates and acknowledges the request

**Analytics Events Tracked:**
- `page_view` – Survey tab views
- `field_start` / `field_complete` – User field interactions
- `form_submit` – Final submission with all form data

---

## Deployment

Both **teacher2** and **json** are Vercel projects (`.vercel/` config present in each).

**teacher2 deployment:** `npm run build` creates `dist/` → deployed to Vercel
**json deployment:** Static HTML file directly → deployed to Vercel with CORS headers for API calls

No CI/CD pipeline configured. Deployments are manual via Vercel CLI or web dashboard.

---

## Development Tips

- **Port 3000** is used for teacher2 dev server. Change in `vite.config.ts` if needed.
- **TypeScript only** – teacher2 uses strict TypeScript. Run `npm run lint` before commits.
- **Tailwind JIT** – Styles are generated at build time. Check `vite.config.ts` for tailwind plugin config.
- **HMR** – Hot module replacement is configured for dev. Changes to components will auto-refresh.
- **Analytics in json** – Form submission is visible in Vercel Analytics dashboard. Custom events logged to `/api/events`.
- **Environment variables** – teacher2 requires `GEMINI_API_KEY` and `APP_URL` in `.env` for full functionality.

---

## Important Files to Know

- `/teacher2/Teacher2/src/data/instructors.ts` – Master data source (100+ instructor records)
- `/teacher2/Teacher2/src/utils/evaluator.ts` – Core filtering/evaluation logic
- `/teacher2/Teacher2/src/data/presets.ts` – Predefined evaluation rule sets
- `/json/index.html` – Survey form UI and inline styles
- `/json/tracker.js` – Form event tracking logic
- `/json/api/events.js` – Serverless event logger
- `/vite.config.ts` – Build config, path aliases (`@/`), HMR settings
- `/.env.example` – Required environment variables for teacher2
