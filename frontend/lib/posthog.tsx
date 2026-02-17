"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false, // we capture manually for App Router
    person_profiles: "identified_only",
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname && posthogKey && posthog) {
      posthog.capture("$pageview", { path: pathname });
    }
  }, [pathname]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!posthogKey) {
    return <>{children}</>;
  }
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}

export { posthog };
