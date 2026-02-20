import { getHomepageMarkdown } from "@/lib/homepage-content";

/**
 * API endpoint that serves homepage content as markdown.
 * Used by middleware for content negotiation.
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
