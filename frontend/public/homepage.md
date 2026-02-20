# Startup Template

Production-Ready Full-Stack Startup Template 2026.

---

## Overview

Production-ready template with FastAPI, Next.js, Expo, AI/ML infrastructure, ETL pipelines, and everything you need to launch quickly.

- **Site:** [seacar.ai](https://seacar.ai)
- **Repository:** [GitHub — seacar/startup-template](https://github.com/seacar/startup-template)

---

## Local Services

Running on your development machine:

- **Backend API:** http://localhost:18000
- **API Docs (Scalar):** http://localhost:18000/docs
- **Frontend Web:** http://localhost:13000
- **Supabase Studio:** http://127.0.0.1:58423
- **Supabase API:** http://127.0.0.1:58421

---

## Tech Stack

### Backend

- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

### Frontend

- [Next.js 16](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.com/)
- [Zustand](https://zustand.surge.sh/)

### Mobile

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)

### Data & AI

- [LangChain](https://python.langchain.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [Google GenAI](https://ai.google.dev/)
- [PySpark](https://spark.apache.org/)

### Infrastructure

- [PostgreSQL](https://postgresql.org/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Upstash Redis](https://upstash.com/)
- [Docker](https://docker.com/)

### Observability

- [LangSmith](https://www.langchain.com/langsmith)
- [Structured Logging](#)

---

## Features

- **Auto Port Management** — Automatically detects and handles port conflicts, finds available ports, and updates all configuration files.
- **Database Migrations** — Timestamped SQL migrations with automatic execution, plus seed data support for development.
- **AI/ML Ready** — Built-in LangChain, LangGraph, and Google GenAI integration with vector store support via pgvector.
- **ETL Pipelines** — PySpark-powered ETL infrastructure for data processing and transformation workflows.
- **Production Ready** — Railway backend deployment, Vercel frontend hosting, and EAS mobile builds all configured.
- **Security First** — Row Level Security policies, authentication middleware, and rate limiting built-in.

---

## Quick Start

### Start All Services

```
./start.sh
```

Launches Supabase, Backend, and Frontend with automatic port conflict resolution

### Start Mobile

```
./start-mobile.sh
```

Starts the Expo development server for iOS and Android

### Stop All Services

```
./stop.sh
```

Gracefully stops all running services

---

## Manual Setup

### Prerequisites

- `Python 3.11+`
- `Node.js 20+`
- `Docker Desktop`
- `Supabase CLI`

### Backend Setup

- `cd backend`
- `python -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `cp .env.example .env`

### Frontend Setup

- `cd frontend`
- `npm install`
- `cp .env.example .env.local`
- `npm run dev`

### Mobile Setup

- `cd mobile`
- `npm install`
- `cp .env.example .env`
- `npx expo start`

---

*Built with the optimal tech stack for 2026.*