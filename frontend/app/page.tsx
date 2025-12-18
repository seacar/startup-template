"use client";

import { Tab, Disclosure } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faServer,
  faDatabase,
  faMobile,
  faCode,
  faBrain,
  faChartLine,
  faShieldAlt,
  faGauge,
  faCheck,
  faChevronDown,
  faTerminal,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const techStack = [
  {
    name: "Backend",
    icon: faServer,
    gradient: "from-blue-500 to-cyan-500",
    technologies: [
      {
        name: "FastAPI",
        color: "text-teal-600",
        url: "https://fastapi.tiangolo.com/",
      },
      {
        name: "Uvicorn",
        color: "text-green-600",
        url: "https://www.uvicorn.org/",
      },
      {
        name: "Supabase",
        color: "text-emerald-600",
        url: "https://supabase.com/",
      },
      {
        name: "Railway",
        color: "text-purple-600",
        url: "https://railway.app/",
      },
    ],
  },
  {
    name: "Frontend",
    icon: faCode,
    gradient: "from-purple-500 to-pink-500",
    technologies: [
      {
        name: "Next.js 16",
        color: "text-gray-900",
        url: "https://nextjs.org/",
      },
      {
        name: "Tailwind CSS",
        color: "text-cyan-600",
        url: "https://tailwindcss.com/",
      },
      {
        name: "Headless UI",
        color: "text-indigo-600",
        url: "https://headlessui.com/",
      },
      {
        name: "Zustand",
        color: "text-orange-600",
        url: "https://zustand.surge.sh/",
      },
    ],
  },
  {
    name: "Mobile",
    icon: faMobile,
    gradient: "from-pink-500 to-rose-500",
    technologies: [
      { name: "Expo", color: "text-blue-700", url: "https://expo.dev/" },
      {
        name: "React Native",
        color: "text-blue-600",
        url: "https://reactnative.dev/",
      },
      {
        name: "NativeWind",
        color: "text-cyan-600",
        url: "https://www.nativewind.dev/",
      },
    ],
  },
  {
    name: "Data & AI",
    icon: faBrain,
    gradient: "from-amber-500 to-orange-500",
    technologies: [
      {
        name: "LangChain",
        color: "text-green-700",
        url: "https://python.langchain.com/",
      },
      {
        name: "LangGraph",
        color: "text-green-600",
        url: "https://langchain-ai.github.io/langgraph/",
      },
      {
        name: "Google GenAI",
        color: "text-blue-600",
        url: "https://ai.google.dev/",
      },
      {
        name: "PySpark",
        color: "text-orange-600",
        url: "https://spark.apache.org/",
      },
    ],
  },
  {
    name: "Infrastructure",
    icon: faDatabase,
    gradient: "from-green-500 to-emerald-500",
    technologies: [
      {
        name: "PostgreSQL",
        color: "text-blue-700",
        url: "https://postgresql.org/",
      },
      {
        name: "pgvector",
        color: "text-purple-600",
        url: "https://github.com/pgvector/pgvector",
      },
      {
        name: "Upstash Redis",
        color: "text-red-600",
        url: "https://upstash.com/",
      },
      { name: "Docker", color: "text-blue-600", url: "https://docker.com/" },
    ],
  },
  {
    name: "Observability",
    icon: faChartLine,
    gradient: "from-red-500 to-pink-500",
    technologies: [
      { name: "Sentry", color: "text-purple-700", url: "https://sentry.io/" },
      {
        name: "LangSmith",
        color: "text-blue-600",
        url: "https://www.langchain.com/langsmith",
      },
      { name: "Structured Logging", color: "text-gray-700", url: "#" },
    ],
  },
];

const services = [
  { name: "Backend API", url: "http://localhost:18000", color: "bg-blue-500" },
  {
    name: "API Docs (Scalar)",
    url: "http://localhost:18000/docs",
    color: "bg-cyan-500",
  },
  {
    name: "Frontend Web",
    url: "http://localhost:13000",
    color: "bg-purple-500",
  },
  {
    name: "Supabase Studio",
    url: "http://127.0.0.1:58423",
    color: "bg-emerald-500",
  },
  {
    name: "Supabase API",
    url: "http://127.0.0.1:58421",
    color: "bg-green-500",
  },
];

const features = [
  {
    name: "Auto Port Management",
    description:
      "Automatically detects and handles port conflicts, finds available ports, and updates all configuration files.",
    icon: faGauge,
    color: "text-blue-600",
  },
  {
    name: "Database Migrations",
    description:
      "Timestamped SQL migrations with automatic execution, plus seed data support for development.",
    icon: faDatabase,
    color: "text-emerald-600",
  },
  {
    name: "AI/ML Ready",
    description:
      "Built-in LangChain, LangGraph, and Google GenAI integration with vector store support via pgvector.",
    icon: faBrain,
    color: "text-purple-600",
  },
  {
    name: "ETL Pipelines",
    description:
      "PySpark-powered ETL infrastructure for data processing and transformation workflows.",
    icon: faChartLine,
    color: "text-orange-600",
  },
  {
    name: "Production Ready",
    description:
      "Railway backend deployment, Vercel frontend hosting, and EAS mobile builds all configured.",
    icon: faRocket,
    color: "text-pink-600",
  },
  {
    name: "Security First",
    description:
      "Row Level Security policies, authentication middleware, and rate limiting built-in.",
    icon: faShieldAlt,
    color: "text-red-600",
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
      "python -m venv venv",
      "source venv/bin/activate",
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faRocket}
                  className="text-white text-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Startup Template
                </h1>
                <p className="text-xs text-slate-600">
                  Production-Ready Stack 2026
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://seacar.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center gap-2"
              >
                <span className="hidden sm:inline">seacar.ai</span>
              </a>
              <a
                href="https://github.com/seacar/startup-template"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faGithub} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium mb-6">
            <FontAwesomeIcon icon={faRocket} className="text-blue-600" />
            Full-Stack Startup Template
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Build Your Startup
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              10x Faster
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Production-ready template with FastAPI, Next.js, Expo, AI/ML
            infrastructure, ETL pipelines, and everything you need to launch
            quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/seacar/startup-template"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faGithub} />
              View on GitHub
            </a>
          </div>
        </section>

        {/* Service URLs */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Local Services
                </h3>
                <p className="text-sm text-slate-600">
                  Running on your development machine
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, idx) => (
                <a
                  key={idx}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 ${service.color} rounded-full animate-pulse`}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {service.name}
                      </h4>
                      <p className="text-xs text-slate-600 font-mono truncate">
                        {service.url}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faExternalLink}
                      className="text-slate-400 group-hover:text-slate-600 transition-colors"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Modern Tech Stack
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with the most powerful and proven technologies of 2026
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((category, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-white text-xl"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {category.name}
                  </h4>
                </div>
                <div className="space-y-2">
                  {category.technologies.map((tech, techIdx) => (
                    <a
                      key={techIdx}
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group/tech"
                    >
                      <span className={`font-semibold ${tech.color}`}>
                        {tech.name}
                      </span>
                      <FontAwesomeIcon
                        icon={faExternalLink}
                        className="text-xs text-slate-400 opacity-0 group-hover/tech:opacity-100 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to build and scale your startup
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${feature.color} mt-1`}>
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {feature.name}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start & Setup */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <Tab.Group>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <Tab.List className="flex border-b border-slate-200 bg-slate-50">
                <Tab
                  className={({ selected }) =>
                    `flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      selected
                        ? "text-blue-600 bg-white border-b-2 border-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Quick Start
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      selected
                        ? "text-blue-600 bg-white border-b-2 border-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Manual Setup
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Get Started in Seconds
                  </h3>
                  <div className="space-y-4">
                    {quickStart.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-2">
                              {step.title}
                            </h4>
                            <code className="block px-4 py-2 bg-slate-900 text-green-400 rounded-lg font-mono text-sm mb-2">
                              {step.command}
                            </code>
                            <p className="text-sm text-slate-600">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Tab.Panel>
                <Tab.Panel className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Step-by-Step Setup
                  </h3>
                  <div className="space-y-6">
                    {setupSteps.map((section, idx) => (
                      <Disclosure key={idx}>
                        {({ open }) => (
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <Disclosure.Button className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <span className="font-bold text-slate-900">
                                  {section.title}
                                </span>
                              </div>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`text-slate-600 transition-transform ${
                                  open ? "transform rotate-180" : ""
                                }`}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-6 py-4 bg-white">
                              <ul className="space-y-2">
                                {section.items.map((item, itemIdx) => (
                                  <li
                                    key={itemIdx}
                                    className="flex items-start gap-3"
                                  >
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className="text-green-600 mt-1 flex-shrink-0"
                                    />
                                    <code className="flex-1 px-3 py-1 bg-slate-100 text-slate-800 rounded font-mono text-sm">
                                      {item}
                                    </code>
                                  </li>
                                ))}
                              </ul>
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </div>
          </Tab.Group>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faRocket}
                    className="text-white text-sm"
                  />
                </div>
                <span className="text-slate-600 text-sm">
                  Built with the optimal tech stack for 2026
                </span>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="https://fastapi.tiangolo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  FastAPI
                </a>
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Next.js
                </a>
                <a
                  href="https://supabase.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Supabase
                </a>
                <a
                  href="https://expo.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Expo
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
