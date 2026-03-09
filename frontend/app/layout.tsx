import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Startup Template 2026",
  description:
    "Production-ready full-stack startup template with modern technologies",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>{children}</PostHogProvider>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
