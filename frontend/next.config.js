/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Partial Prerendering (PPR) is now enabled via cacheComponents
  // See: https://nextjs.org/docs/app/api-reference/next-config-js/cacheComponents

  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
