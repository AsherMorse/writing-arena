import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FantasyDebugMenu } from "@/components/fantasy";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingState } from "@/components/shared/LoadingState";
import { dutch809, avenirNext, memento } from "./fonts";

export const metadata: Metadata = {
  title: "Writing Arena",
  description: "Learn to write, one quest at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`antialiased ${dutch809.variable} ${avenirNext.variable} ${memento.variable}`} suppressHydrationWarning>
      <AuthProvider>
        <Suspense fallback={<LoadingState message="Loading..." />}>
          <RequireAuth>
            {children}
          </RequireAuth>
        </Suspense>
        <FantasyDebugMenu />
      </AuthProvider>
    </body>
    </html>
  );
}

