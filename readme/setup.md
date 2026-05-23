# Karyakram

Calendly-style scheduling app: manage event types, availability, and meetings on the admin side; invitees book via a public page without logging in.

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL, Prisma 7 |

## Prerequisites

- Node.js 20+
- PostgreSQL

## Setup

### 1. Database

Create a PostgreSQL database and set connection URLs in `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/karyakram"
DIRECT_URL="postgresql://user:password@localhost:5432/karyakram"
PORT=4000
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev   # listens on port 4000 (set in package.json / .env)
```

The API runs at **http://localhost:4000**. Do **not** use `PORT=4000 npx tsx seed && npm run dev` — `PORT` only applies to the first command unless you run `PORT=4000 npm run dev`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000** — you are redirected to the admin **Scheduling** page.

API requests are proxied from the Next app via `next.config.ts` rewrites (`/api/*` → backend).

## Routes

| URL | Description |
|-----|-------------|
| `/scheduling` | Event types (create, list, copy link, delete) |
| `/meetings` | Upcoming / past meetings, cancel |
| `/availability` | Weekly hours per schedule |
| `/{userSlug}/{eventSlug}` | Public booking (e.g. `/alice/30min`) |
| `/cancel/{token}` | Cancel via email token |

## Assumptions

- **No login**: Admin routes use a fixed default user (`alice`, seeded). Replace `injectUser` middleware when adding real auth.
- **Sample data**: Seed creates user `alice`, schedule “Work Hours” (Mon–Fri 9–5, Asia/Kolkata), and event types `15min`, `30min`, `60min`.
- **Email**: Notifications are logged to the console (stream transport), not sent via SMTP.
- **UI**: Components under `frontend/src/components/` follow a Calendly-inspired layout; theme tokens live in `globals.css`.

## Project structure

```
backend/          Express API + Prisma
frontend/
  src/app/        Next.js routes
  src/components/ UI building blocks
  src/views/      Page-level compositions wired to API
  src/lib/        API client, types, formatters
readme/           Schema design notes
```

## Core features

- Event types: name, duration, slug, unique booking link
- Availability: weekly rules, timezone, date overrides (read on availability page)
- Public booking: calendar, slots, invitee form, double-booking prevention
- Meetings: upcoming/past lists, cancel

## Extra features (partial / UI-ready)

- Responsive admin and booking layouts
- Multiple schedules (selector on availability page)
- Date-specific hours (display overrides; add via API)
- Cancel by token; reschedule API exists on backend
- Buffer times on seeded event types
- Custom questions on `30min` event type
