import { getHomepageMarkdown } from "@/lib/homepage-content";
import Link from "next/link";
import { headers } from "next/headers";

export const metadata = {
  title: "Agents — Homepage content",
  description:
    "Machine-readable and human view of the Startup Template homepage content in markdown.",
};

export default async function AgentsPage() {
  const headersList = await headers();
  const acceptHeader = headersList.get("accept") || "";
  
  // Content negotiation: serve markdown if agent requests it
  if (acceptHeader.includes("text/markdown") || acceptHeader.includes("text/plain")) {
    const markdown = getHomepageMarkdown();
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // Default: serve HTML for humans
  const markdown = getHomepageMarkdown();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Agents — Homepage content
          </h1>
          <p className="text-slate-600 mb-4">
            This page exposes the same content as the homepage in markdown form
            for agents to fetch. Humans can read it here too.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/agents/markdown"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Get raw markdown (for agents)
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Back to homepage
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <span className="text-sm font-medium text-slate-600">
              Homepage content (markdown)
            </span>
          </div>
          <pre className="p-6 text-sm text-slate-800 whitespace-pre-wrap font-mono overflow-x-auto max-h-[70vh] overflow-y-auto">
            {markdown}
          </pre>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Agents: GET{" "}
          <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
            /agents/markdown
          </code>{" "}
          for the same content as <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">Content-Type: text/markdown</code>.
        </p>
      </div>
    </div>
  );
}
