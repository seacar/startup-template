import { getHomepageMarkdown } from "@/lib/homepage-content";

/**
 * Serves the full homepage content as markdown for agents.
 * GET /agents/markdown
 */
export async function GET() {
  const markdown = getHomepageMarkdown();
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
