import { type NextRequest, NextResponse } from "next/server";

/**
 * Content negotiation: serve homepage as markdown when requested with
 * Accept: text/markdown or Accept: text/plain. Agents get markdown by default.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  if (pathname === "/" && (accept.includes("text/markdown") || accept.includes("text/plain"))) {
    return NextResponse.rewrite(new URL("/agents/markdown", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
