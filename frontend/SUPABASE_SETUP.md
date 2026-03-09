# Enabling Supabase Authentication

Supabase auth is **disabled by default** so you can deploy the landing page immediately without configuration. Follow these steps when you want to add authentication.

## 1. Enable the Supabase client

Rename the disabled client folder so the app can use it:

```bash
# From frontend/
mv lib/supabase.disabled lib/supabase
```

This gives you:

- `lib/supabase/server.ts` — server-side client (Server Components, Route Handlers)
- `lib/supabase/client.ts` — browser client (Client Components)
- `lib/supabase/middleware.ts` — `updateSession()` for refreshing auth in middleware

## 2. Set environment variables

Copy the example env and set your Supabase keys:

```bash
cp env.example .env.local
```

Edit `.env.local` and set (uncomment if needed):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Use your project URL and **anon (publishable)** key from the Supabase dashboard (Project Settings → API). Never put the service role key in the frontend.

## 3. Enable auth in middleware

You have two options.

### Option A: Auth only (replace middleware)

If you don’t need the homepage markdown/plain content negotiation, replace the current middleware with the auth version:

```bash
mv middleware.ts middleware.content-negotiation.ts   # optional backup
cp middleware.ts.disabled middleware.ts
```

`middleware.ts.disabled` imports `updateSession` from `./lib/supabase/middleware`, so it will work once `lib/supabase` exists.

### Option B: Auth + content negotiation (recommended)

To keep both auth and the existing behavior (e.g. serving the homepage as markdown for `Accept: text/markdown`), update `middleware.ts` to run the Supabase session refresh and then your existing logic. For example:

```ts
// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  // Content negotiation for homepage
  if (pathname === "/" && (accept.includes("text/markdown") || accept.includes("text/plain"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/homepage.md";
    return NextResponse.rewrite(url);
  }

  // Refresh Supabase session for all other matching routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Use the same `config.matcher` as in `middleware.ts.disabled` so auth runs on all relevant routes.

## 4. Use the client in your app

- **Server Components / Route Handlers:** `import { createClient } from "@/lib/supabase/server";` then `const supabase = await createClient();`
- **Client Components:** `import { createClient } from "@/lib/supabase/client";` then `const supabase = createClient();`

Server-side, use `supabase.auth.getUser()` for the current user; don’t rely on `getSession()` alone. See `.cursor/rules/supabase.mdc` for conventions (RLS, no service role on client, etc.).

## 5. Regenerate types after schema changes

After changing Supabase migrations:

```bash
# From project root
supabase gen types typescript --local > frontend/types/supabase.ts
```

## Summary checklist

- [ ] `lib/supabase.disabled` renamed to `lib/supabase`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Middleware updated (Option A or B) so `updateSession` runs where needed
- [ ] (Optional) Regenerate `frontend/types/supabase.ts` after DB changes
