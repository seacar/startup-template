import Script from "next/script";

const DEFAULT_UMAMI_SCRIPT = "https://cloud.umami.is/script.js";

/**
 * Umami analytics (privacy-first). Loads only when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set.
 * Use NEXT_PUBLIC_UMAMI_SCRIPT_URL to point to a self-hosted instance (e.g. https://analytics.yourdomain.com/script.js).
 */
export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptSrc =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? DEFAULT_UMAMI_SCRIPT;

  if (!websiteId) {
    return null;
  }

  return (
    <Script
      async
      src={scriptSrc}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
