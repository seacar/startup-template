# Startup Template

A production-ready, full-stack startup template based on optimal tech stack for 2026.

> **Note:** Supabase authentication middleware is **disabled by default** to allow immediate deployment of the landing page. See `frontend/SUPABASE_SETUP.md` for instructions to enable it when needed.

## Stack Overview

- **Backend**: FastAPI + Uvicorn + Supabase + Railway (Python 3.10+)
- **Frontend Web**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Headless UI + Supabase
- **Mobile**: Expo (React Native) + NativeWind + Zustand + Supabase
- **State Management**: Zustand
- **Caching**: Upstash Redis
- **ETL**: PySpark pipelines
- **AI/ML**: LangChain + LangGraph + Google GenAI
- **Observability**: Structured Logging + PostHog; optional Umami for privacy-first analytics

## Project Structure

```
startup-template/
├── backend/          # FastAPI backend (includes API, AI/ML, and ETL)
│   └── src/
│       ├── ai/       # AI/ML infrastructure (LangChain, LangGraph)
│       ├── etl/       # PySpark ETL pipelines
│       └── routers/  # API routes
├── frontend/         # Next.js web application (App Router, app/api/)
├── mobile/           # Expo React Native application
├── supabase/         # Supabase local development config
│   ├── migrations/   # Database migrations (timestamped SQL files)
│   └── seed.sql      # Seed data (runs after migrations)
└── documentation/    # In-repo docs (build-specs, guides)
```

## Getting Started

### Quick Start (All Services)

Start all services with a single command:

```bash
./start.sh
```

This script will:

1. **First time only:** Prompt for project name, optional custom ports, then remove the template’s git history and run `git init` for your new project.
2. Check prerequisites (Docker, Python, Node.js)
3. **Automatically handle port conflicts** - If ports are in use, it finds available ports and updates all configuration files
4. Start Supabase local instance
5. **Display Supabase keys** - Shows API URL, Publishable Key, and Secret Key for easy copy-paste
6. Start Backend API (FastAPI + Uvicorn)
7. Start Frontend (Next.js)

**Port Conflict Handling:**

- Automatically detects if ports are in use (especially useful for multiple Supabase projects)
- Finds next available ports if conflicts detected
- Updates `supabase/config.toml` with new ports
- Updates all `.env` and `.env.example` files with new Supabase URLs
- Displays updated service URLs

To start the mobile app separately:

```bash
./start-mobile.sh
```

### Prerequisites

- Python 3.10+
- Node.js 20+
- Docker (for local development)
- Supabase account
- Railway account (for deployment)
- Upstash Redis account

For step-by-step setup (env vars, Supabase, etc.), see [SETUP.md](SETUP.md).

### Backend Setup

The backend uses **Uvicorn** as the ASGI server for FastAPI:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Configure your environment variables in .env file
# Run with uvicorn (ASGI server)
uvicorn src.main:app --reload --host 0.0.0.0 --port 18000
```

The API will be available at `http://localhost:18000`. API docs (Scalar) at `http://localhost:18000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # Configure your environment variables
npm run dev
```

With default ports (e.g. when using `./start.sh`), the frontend runs at `http://localhost:13000`.

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

### Supabase Local Development

```bash
# From project root directory
supabase start  # Start local Supabase instance
supabase stop   # Stop local Supabase instance
supabase status # Check status
supabase db reset  # Reset database and run migrations + seeds
```

Supabase migrations are located in `supabase/migrations/` and will run automatically on `supabase start` or `supabase db reset`.

## Environment Variables

Each service has its own `.env.example` file. Copy and configure:

- `backend/.env.example` → `backend/.env` - Backend, AI/ML, and ETL configuration
- `frontend/.env.example` → `frontend/.env.local` - Frontend configuration
- `mobile/.env.example` → `mobile/.env` - Mobile configuration

## Deployment

### Railway

Backend (including API, AI/ML, and ETL jobs) can be deployed to Railway using the included `railway.toml` file.

### Vercel

Frontend can be deployed to Vercel:

```bash
cd frontend
vercel
```

### Expo

Mobile app can be built and submitted using EAS:

```bash
cd mobile
eas build --platform ios
eas build --platform android
```

## Database Migrations

Database migrations are located in `supabase/migrations/`. The initial migration includes:

- UUID extension
- pgvector extension for AI/ML use cases
- Basic profiles table with RLS policies
- Updated_at trigger function

To create a new migration:

```bash
supabase migration new your_migration_name
```

To apply migrations:

```bash
supabase db reset  # Resets and runs all migrations + seeds
```

## Testing & Development

- **Backend:** `cd backend && python -m pytest tests/` (use a single test file for speed, e.g. `tests/test_health.py`)
- **Frontend:** `npm run type-check` and `npm run lint` (from `frontend/`)
- **Mobile:** `npx expo start` from `mobile/`

Run type-check and tests after making changes before considering work done.

## Documentation

**In this repo:**

- [SETUP.md](SETUP.md) — Detailed setup (env vars, Supabase, Uvicorn options)
- [documentation/](documentation/) — Build specs (`documentation/build-specs/`), agent setup, and other guides

**External:**

- [FastAPI](https://fastapi.tiangolo.com/) · [Uvicorn](https://www.uvicorn.org/) · [Next.js](https://nextjs.org/docs) · [Expo](https://docs.expo.dev/) · [Supabase](https://supabase.com/docs) · [LangChain](https://python.langchain.com/)

## License

MIT
