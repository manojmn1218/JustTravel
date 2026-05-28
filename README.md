# JustTravel (Full‑stack TypeScript)

This repo contains:

- `frontend/`: React + TypeScript + Tailwind (Vite)
- `backend/`: Express + TypeScript + Prisma + PostgreSQL

## Prerequisites

- Node.js 20+ (you have Node 22 already)
- PostgreSQL running locally **or** Docker (optional)

## Backend (API)

### 1) Configure env

Copy the example env:

- `backend/.env.example` → `backend/.env`

Set at least:

- `JWT_SECRET` (min 32 chars)
- `DATABASE_URL` (Postgres connection string)

Example:

```bash
DATABASE_URL=postgresql://travel:travel@localhost:5432/travel?schema=public
```

### 2) Install and migrate

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
node -e "console.log('db ready')"
```

Optional seed (creates `admin@travel.com` / `admin123`):

```bash
cd backend
npm run prisma:seed
```

### 3) Run API

```bash
cd backend
npm run dev
```

Health check: `GET /api/health`

## Frontend (Web)

### 1) Configure env

Copy the example:

- `frontend/.env.example` → `frontend/.env`

### 2) Run

```bash
cd frontend
npm install
npm run dev
```

Open the app at the printed Vite URL (usually `http://localhost:5173`).

## API routes (examples)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/admin/users` (admin only)
- `GET /api/admin/bookings` (admin only)

## Formatting

Prettier config is in the repo root (`.prettierrc.json`).

