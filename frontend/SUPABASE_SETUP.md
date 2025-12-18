# Supabase Setup Guide

> **Note:** Supabase authentication is currently **disabled** in this template to allow easy deployment of the landing page without requiring Supabase configuration.

## Why is Supabase Disabled?

The landing page is a static marketing page that doesn't require authentication or database access. By disabling Supabase middleware, you can:

- ✅ Deploy to Vercel immediately without setting up Supabase
- ✅ Avoid middleware errors when environment variables aren't set
- ✅ Keep the landing page fast and fully static

## When to Enable Supabase

Enable Supabase when you're ready to add:

- User authentication (sign up, login, logout)
- Protected routes and pages
- Database operations
- Real-time features
- Row Level Security (RLS)

## How to Enable Supabase

### 1. Rename Disabled Files

```bash
cd frontend

# Re-enable middleware
mv middleware.ts.disabled middleware.ts

# Re-enable Supabase library
mv lib/supabase.disabled lib/supabase
```

### 2. Set Environment Variables

Create `.env.local` (or set in Vercel dashboard):

```bash
# Required Supabase environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Get these values from:

- [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

### 3. Update next.config.js (Optional)

If you removed the env section, add it back:

```javascript
env: {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
}
```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:13000 and verify no errors in the console.

### 5. Deploy to Vercel

1. Push changes to GitHub
2. In Vercel Dashboard → Settings → Environment Variables
3. Add the same environment variables
4. Redeploy

## What Does the Middleware Do?

The middleware (`middleware.ts`) runs on every request and:

- ✅ Refreshes Supabase auth sessions automatically
- ✅ Updates authentication cookies
- ✅ Ensures users stay logged in
- ✅ Protects routes (when you add auth logic)

## Supabase Files Included

Once re-enabled, you'll have access to:

### `lib/supabase/client.ts`

Browser-side Supabase client for client components

```typescript
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### `lib/supabase/server.ts`

Server-side Supabase client for server components and API routes

```typescript
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### `lib/supabase/middleware.ts`

Session management for the middleware

```typescript
import { updateSession } from "@/lib/supabase/middleware";
```

## Example: Adding Authentication

### 1. Create a Login Page

```typescript
// app/login/page.tsx
"use client";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  return <div>{/* Your login form */}</div>;
}
```

### 2. Protect Routes (Optional)

Add to `middleware.ts` after re-enabling:

```typescript
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Protect specific routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/dashboard")) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}
```

## Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Troubleshooting

### "createClient is not a function"

- Make sure you've re-enabled the `lib/supabase` folder
- Restart your dev server: `npm run dev`

### Middleware errors on Vercel

- Verify environment variables are set in Vercel dashboard
- Check they start with `NEXT_PUBLIC_` prefix
- Redeploy after adding variables

### Session not persisting

- Check browser cookies are enabled
- Verify middleware is running (check Network tab for Set-Cookie headers)
- Ensure `middleware.ts` matcher includes your routes
