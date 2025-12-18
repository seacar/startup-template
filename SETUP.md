# Setup Guide

This guide will help you set up each service in the startup template.

## Prerequisites

Before starting, ensure you have:

1. **Python 3.11+** installed
2. **Node.js 20+** installed
3. **Docker** installed (for local development)
4. Accounts for:
   - Supabase (https://supabase.com)
   - Railway (https://railway.app)
   - Upstash Redis (https://upstash.com)
   - Google Cloud (for GenAI API key)
   - LangSmith (optional, for AI observability)
   - Sentry (optional, for error tracking)

## 1. Backend Setup (FastAPI + Uvicorn + AI/ML + ETL)

The backend includes FastAPI (served with Uvicorn ASGI server), AI/ML infrastructure, and ETL pipelines in a single service.

### Initial Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Supabase Local Development

Supabase has been initialized at the project root. Start local Supabase instance:

```bash
# From project root directory
supabase start
```

This will start:

- PostgreSQL database (port 54322)
- Supabase API (port 54321)
- Supabase Studio (port 54323)
- Inbucket email testing (port 54324)

### Environment Configuration

Create a `.env` file with your configuration:

- `SUPABASE_URL`: Your Supabase project URL (or `http://127.0.0.1:54321` for local)
- `SUPABASE_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_DB_HOST`: Database host (or `127.0.0.1` for local)
- `SUPABASE_DB_PORT`: Database port (54322 for local)
- `SUPABASE_DB_NAME`: Database name (usually "postgres")
- `SUPABASE_DB_USER`: Database user (usually "postgres")
- `SUPABASE_DB_PASSWORD`: Database password
- `REDIS_URL`: Your Upstash Redis URL
- `SENTRY_DSN`: Your Sentry DSN (optional)
- `LANGCHAIN_API_KEY`: Your LangSmith API key (optional)
- `GOOGLE_API_KEY`: Your Google GenAI API key

### Run Locally with Uvicorn

The backend uses **Uvicorn** as the ASGI server for FastAPI:

```bash
# Basic development server with auto-reload
uvicorn src.main:app --reload

# Or specify host and port explicitly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Production-like server (no reload)
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`
API documentation (Scalar) will be at `http://localhost:8000/docs`

**Uvicorn Options:**

- `--reload`: Enable auto-reload on code changes (development only)
- `--host`: Bind to specific host (default: 127.0.0.1)
- `--port`: Bind to specific port (default: 8000)
- `--workers`: Number of worker processes (production)

## 2. Frontend Setup (Next.js)

### Initial Setup

```bash
cd frontend
npm install
```

### Environment Configuration

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_API_URL`: Your backend API URL (default: http://localhost:8000)

### Run Locally

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 3. Mobile Setup (Expo)

### Initial Setup

```bash
cd mobile
npm install
```

### Environment Configuration

Create a `.env` file:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `EXPO_PUBLIC_API_URL`: Your backend API URL

### Run Locally

```bash
npx expo start
```

Follow the prompts to open on iOS simulator, Android emulator, or physical device.

## 4. Using AI/ML Features

AI/ML infrastructure is included in the backend. Import and use:

```python
from src.ai.llm.google_genai import get_llm
from src.ai.agents.base_agent import BaseAgent
from src.ai.rag.vector_store import get_vector_store
```

## 5. Running ETL Jobs

ETL pipelines are included in the backend. Run ETL jobs:

```bash
cd backend
python -m src.etl.jobs.example_job
```

Or create your own ETL jobs by extending `BaseETLJob` in `src/etl/jobs/`.

## Deployment

### Backend to Railway

1. Connect your GitHub repository to Railway
2. Railway will detect the `railway.toml` file
3. Add environment variables in Railway dashboard
4. Deploy!

### Frontend to Vercel

```bash
cd frontend
vercel
```

Follow the prompts and add environment variables in Vercel dashboard.

### Mobile with EAS

```bash
cd mobile
eas build:configure
eas build --platform ios
eas build --platform android
```

### Running ETL Jobs on Railway

ETL jobs are part of the backend service. You can:

1. Trigger ETL jobs via FastAPI endpoints
2. Set up Railway cron jobs that call your ETL endpoints
3. Or create separate Railway services for long-running ETL jobs

## Database Migrations

Supabase migrations are located in `supabase/migrations/`. To create a new migration:

```bash
# From project root
supabase migration new your_migration_name
```

This creates a new migration file with a timestamp prefix. Edit the file and add your SQL changes.

To apply migrations:

```bash
supabase db reset  # Resets database and runs all migrations + seeds
# OR
supabase migration up  # Applies pending migrations only
```

Seed data is located in `supabase/seed.sql` and runs automatically after migrations during `supabase db reset`.

## Next Steps

1. Customize database schema in `supabase/migrations/`
2. Add seed data to `supabase/seed.sql`
3. Configure Row Level Security (RLS) policies
4. Add your business logic to each service
5. Set up CI/CD pipelines
6. Configure monitoring and alerts

## Troubleshooting

### Backend Issues

- Ensure Python 3.11+ is installed
- Check that all environment variables are set
- Verify Supabase and Redis connections

### Frontend Issues

- Clear `.next` directory and rebuild: `rm -rf .next && npm run build`
- Check that environment variables start with `NEXT_PUBLIC_`
- Verify Supabase client configuration

### Mobile Issues

- Clear Expo cache: `npx expo start -c`
- Ensure `EXPO_PUBLIC_` prefix for environment variables
- Check that NativeWind is properly configured

### ETL Issues

- Ensure Java 17+ is installed (required for Spark)
- Check Spark configuration in `src/etl/utils/spark_session.py`
- Verify database connection credentials
- For local Supabase: Use `127.0.0.1:54322` as database host

### Supabase Issues

- Ensure Docker is running (required for local Supabase)
- Run Supabase commands from the project root directory
- Check Supabase status: `supabase status` (from root)
- View logs: `supabase logs` (from root)
- Reset local database: `supabase db reset` (from root)
