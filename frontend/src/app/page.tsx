import Link from "next/link";

export default function Home() {
  const services = [
    {
      name: "Backend API",
      url: "http://localhost:8000",
      description: "FastAPI backend with Uvicorn",
    },
    {
      name: "API Documentation",
      url: "http://localhost:8000/docs",
      description: "Scalar API documentation",
    },
    {
      name: "Health Check",
      url: "http://localhost:8000/health",
      description: "Backend health status endpoint",
    },
    {
      name: "Supabase Studio",
      url: "http://127.0.0.1:54323",
      description: "Database management interface",
    },
    {
      name: "Supabase API",
      url: "http://127.0.0.1:54321",
      description: "Supabase REST API",
    },
    {
      name: "Email Testing (Inbucket)",
      url: "http://127.0.0.1:54324",
      description: "View test emails sent locally",
    },
  ];

  const technologies = [
    {
      category: "Frontend",
      items: [
        "Next.js 16",
        "React 19",
        "Tailwind CSS 4",
        "Headless UI",
        "Zustand",
      ],
    },
    {
      category: "Backend",
      items: ["FastAPI", "Uvicorn", "Python 3.11+", "Pydantic"],
    },
    {
      category: "Database & Auth",
      items: ["Supabase", "PostgreSQL", "Row Level Security"],
    },
    {
      category: "AI/ML",
      items: ["LangChain", "LangGraph", "Google GenAI", "pgvector"],
    },
    { category: "ETL", items: ["PySpark", "Delta Lake"] },
    {
      category: "Infrastructure",
      items: ["Railway", "Upstash Redis", "Sentry"],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Startup Template 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A production-ready, full-stack startup template with modern
            technologies for rapid MVP development and scalable growth.
          </p>
        </div>

        {/* Technologies Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <div
                key={tech.category}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {tech.category}
                </h3>
                <ul className="space-y-2">
                  {tech.items.map((item) => (
                    <li key={item} className="text-gray-600 text-sm">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Development Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-blue-500"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {service.description}
                </p>
                <p className="text-xs text-blue-600 font-mono break-all">
                  {service.url}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              API Documentation →
            </Link>
            <Link
              href="http://127.0.0.1:54323"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Supabase Studio →
            </Link>
            <Link
              href="http://localhost:8000/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Health Check →
            </Link>
            <Link
              href="http://127.0.0.1:54324"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Email Testing →
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This is a foundational template. Start building your application by
            customizing the codebase in each service directory.
          </p>
        </div>
      </div>
    </main>
  );
}
