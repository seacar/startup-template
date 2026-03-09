import { getHomepageMarkdown } from "@/lib/homepage-content";
import { NextRequest, NextResponse } from "next/server";

/**
 * Content negotiation for /agents route.
 * 
 * Serves markdown when Accept header includes text/markdown or text/plain.
 * Otherwise serves HTML for human viewing.
 * 
 * Agents should request with: Accept: text/markdown
 * Example: curl -H 'Accept: text/markdown' http://localhost:13000/agents
 */
export async function GET(request: NextRequest) {
  const acceptHeader = request.headers.get("accept") || "";

  // Content negotiation: serve markdown for agents
  if (acceptHeader.includes("text/markdown") || acceptHeader.includes("text/plain")) {
    const markdown = getHomepageMarkdown();
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // Serve HTML for browsers (default)
  // Since route handlers take precedence over pages, we render HTML here
  const markdown = getHomepageMarkdown();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agents — Homepage content</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 56rem; margin: 0 auto; padding: 2rem; background: #f8fafc; }
    header { margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #0f172a; }
    p { color: #64748b; margin-bottom: 1rem; line-height: 1.6; }
    .content { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
    .content-header { padding: 1rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    pre { padding: 1.5rem; font-size: 0.875rem; overflow-x: auto; max-height: 70vh; overflow-y: auto; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #1e293b; margin: 0; }
    .links { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    a { padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .btn-primary { background: #0f172a; color: white; }
    .btn-primary:hover { background: #1e293b; }
    .btn-secondary { border: 1px solid #cbd5e1; color: #334155; }
    .btn-secondary:hover { background: #f1f5f9; }
    code { padding: 0.125rem 0.375rem; background: #e2e8f0; border-radius: 0.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875em; }
    .info { margin-top: 1rem; font-size: 0.875rem; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <h1>Agents — Homepage content</h1>
    <p>This page exposes the same content as the homepage in markdown form for agents to fetch. Humans can read it here too.</p>
    <div class="links">
      <a href="/agents/markdown" class="btn-primary">Get raw markdown (for agents)</a>
      <a href="/" class="btn-secondary">Back to homepage</a>
    </div>
  </header>
  <div class="content">
    <div class="content-header">
      <span style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Homepage content (markdown)</span>
    </div>
    <pre>${markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  </div>
  <p class="info">
    Agents: GET <code>/agents</code> with <code>Accept: text/markdown</code> header for the same content as <code>Content-Type: text/markdown</code>.
  </p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
