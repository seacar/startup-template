# Startup Template

A production-ready, full-stack startup template based on optimal tech stack for 2026.

## Stack Overview

- **Backend**: FastAPI + Uvicorn + Supabase + Railway
- **Frontend Web**: Next.js 16 + Tailwind CSS + Headless UI
- **Mobile**: Expo (React Native) + NativeWind
- **State Management**: Zustand
- **Caching**: Upstash Redis
- **ETL**: PySpark pipelines
- **AI/ML**: LangChain + LangGraph + Google GenAI
- **Observability**: Sentry + Structured Logging

## Project Structure

```
startup-template/
├── backend/          # FastAPI backend (includes API, AI/ML, and ETL)
│   └── src/
│       ├── ai/       # AI/ML infrastructure (LangChain, LangGraph)
│       ├── etl/       # PySpark ETL pipelines
│       └── ...        # FastAPI application code
├── frontend/         # Next.js web application
├── mobile/           # Expo React Native application
└── supabase/         # Supabase local development config
    ├── migrations/   # Database migrations (timestamped SQL files)
    └── seed.sql      # Seed data (runs after migrations)
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (for local development)
- Supabase account
- Railway account (for deployment)
- Upstash Redis account

### Backend Setup

The backend uses **Uvicorn** as the ASGI server for FastAPI:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Configure your environment variables in .env file
# Run with uvicorn (ASGI server)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation (Scalar) will be at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # Configure your environment variables
npm run dev
```

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

Each service has its own environment configuration:

- `backend/.env` - Backend, AI/ML, and ETL configuration (see backend/.env.example for reference)
- `frontend/env.example` → `frontend/.env.local`
- `mobile/env.example` → `mobile/.env`

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

## Documentation

For detailed documentation on each component, refer to:

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [LangChain Documentation](https://python.langchain.com/)

## License

MIT
