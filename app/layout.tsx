import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import DebugMenu from "@/components/shared/DebugMenu";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingState } from "@/components/shared/LoadingState";

export const metadata: Metadata = {
  title: "Writing Arena - Competitive Writing Platform",
  description: "Transform your writing skills through competitive matches and AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="antialiased" suppressHydrationWarning>
      <AuthProvider>
        <Suspense fallback={<LoadingState message="Loading..." />}>
          <RequireAuth>
            {children}
          </RequireAuth>
        </Suspense>
        <DebugMenu />
      </AuthProvider>
    </body>
    </html>
  );
}

