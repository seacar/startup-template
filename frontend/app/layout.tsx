import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/ui/ToastProvider";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Layout } from "../components/layout/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Document Generator",
  description: "AI-powered document generation platform",
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
        <ErrorBoundary>
          <ToastProvider>
            <Layout>{children}</Layout>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
