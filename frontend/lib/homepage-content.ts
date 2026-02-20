/**
 * Single source of truth for homepage content. Used by the homepage UI
 * and by /agents for markdown export (agent-consumable).
 */

const techStack = [
  {
    name: "Backend",
    technologies: [
      { name: "FastAPI", url: "https://fastapi.tiangolo.com/" },
      { name: "Uvicorn", url: "https://www.uvicorn.org/" },
      { name: "Supabase", url: "https://supabase.com/" },
      { name: "Railway", url: "https://railway.app/" },
    ],
  },
  {
    name: "Frontend",
    technologies: [
      { name: "Next.js 16", url: "https://nextjs.org/" },
      { name: "Tailwind CSS", url: "https://tailwindcss.com/" },
      { name: "Headless UI", url: "https://headlessui.com/" },
      { name: "Zustand", url: "https://zustand.surge.sh/" },
    ],
  },
  {
    name: "Mobile",
    technologies: [
      { name: "Expo", url: "https://expo.dev/" },
      { name: "React Native", url: "https://reactnative.dev/" },
      { name: "NativeWind", url: "https://www.nativewind.dev/" },
    ],
  },
  {
    name: "Data & AI",
    technologies: [
      { name: "LangChain", url: "https://python.langchain.com/" },
      { name: "LangGraph", url: "https://langchain-ai.github.io/langgraph/" },
      { name: "Google GenAI", url: "https://ai.google.dev/" },
      { name: "PySpark", url: "https://spark.apache.org/" },
    ],
  },
  {
    name: "Infrastructure",
    technologies: [
      { name: "PostgreSQL", url: "https://postgresql.org/" },
      { name: "pgvector", url: "https://github.com/pgvector/pgvector" },
      { name: "Upstash Redis", url: "https://upstash.com/" },
      { name: "Docker", url: "https://docker.com/" },
    ],
  },
  {
    name: "Observability",
    technologies: [
      { name: "LangSmith", url: "https://www.langchain.com/langsmith" },
      { name: "Structured Logging", url: "#" },
    ],
  },
];

const services = [
  { name: "Backend API", url: "http://localhost:18000" },
  { name: "API Docs (Scalar)", url: "http://localhost:18000/docs" },
  { name: "Frontend Web", url: "http://localhost:13000" },
  { name: "Supabase Studio", url: "http://127.0.0.1:58423" },
  { name: "Supabase API", url: "http://127.0.0.1:58421" },
];

const features = [
  {
    name: "Auto Port Management",
    description:
      "Automatically detects and handles port conflicts, finds available ports, and updates all configuration files.",
  },
  {
    name: "Database Migrations",
    description:
      "Timestamped SQL migrations with automatic execution, plus seed data support for development.",
  },
  {
    name: "AI/ML Ready",
    description:
      "Built-in LangChain, LangGraph, and Google GenAI integration with vector store support via pgvector.",
  },
  {
    name: "ETL Pipelines",
    description:
      "PySpark-powered ETL infrastructure for data processing and transformation workflows.",
  },
  {
    name: "Production Ready",
    description:
      "Railway backend deployment, Vercel frontend hosting, and EAS mobile builds all configured.",
  },
  {
    name: "Security First",
    description:
      "Row Level Security policies, authentication middleware, and rate limiting built-in.",
  },
];

const quickStart = [
  {
    title: "Start All Services",
    command: "./start.sh",
    description:
      "Launches Supabase, Backend, and Frontend with automatic port conflict resolution",
  },
  {
    title: "Start Mobile",
    command: "./start-mobile.sh",
    description: "Starts the Expo development server for iOS and Android",
  },
  {
    title: "Stop All Services",
    command: "./stop.sh",
    description: "Gracefully stops all running services",
  },
];

const setupSteps = [
  {
    title: "Prerequisites",
    items: ["Python 3.11+", "Node.js 20+", "Docker Desktop", "Supabase CLI"],
  },
  {
    title: "Backend Setup",
    items: [
      "cd backend",
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install -r requirements.txt",
      "cp .env.example .env",
    ],
  },
  {
    title: "Frontend Setup",
    items: [
      "cd frontend",
      "npm install",
      "cp .env.example .env.local",
      "npm run dev",
    ],
  },
  {
    title: "Mobile Setup",
    items: [
      "cd mobile",
      "npm install",
      "cp .env.example .env",
      "npx expo start",
    ],
  },
];

export function getHomepageMarkdown(): string {
  const lines: string[] = [
    "# Startup Template",
    "",
    "Production-Ready Full-Stack Startup Template 2026.",
    "",
    "---",
    "",
    "## Overview",
    "",
    "Production-ready template with FastAPI, Next.js, Expo, AI/ML infrastructure, ETL pipelines, and everything you need to launch quickly.",
    "",
    "- **Site:** [seacar.ai](https://seacar.ai)",
    "- **Repository:** [GitHub — seacar/startup-template](https://github.com/seacar/startup-template)",
    "",
    "---",
    "",
    "## Local Services",
    "",
    "Running on your development machine:",
    "",
  ];

  for (const s of services) {
    lines.push(`- **${s.name}:** ${s.url}`);
  }

  lines.push("", "---", "", "## Tech Stack", "");

  for (const cat of techStack) {
    lines.push(`### ${cat.name}`, "");
    for (const t of cat.technologies) {
      lines.push(`- [${t.name}](${t.url})`);
    }
    lines.push("");
  }

  lines.push("---", "", "## Features", "");

  for (const f of features) {
    lines.push(`- **${f.name}** — ${f.description}`);
  }

  lines.push("", "---", "", "## Quick Start", "");

  for (const step of quickStart) {
    lines.push(`### ${step.title}`, "", "```", step.command, "```", "", step.description, "");
  }

  lines.push("---", "", "## Manual Setup", "");

  for (const section of setupSteps) {
    lines.push(`### ${section.title}`, "");
    for (const item of section.items) {
      lines.push(`- \`${item}\``);
    }
    lines.push("");
  }

  lines.push("---", "", "*Built with the optimal tech stack for 2026.*");
  return lines.join("\n");
}
