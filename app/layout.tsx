import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import DebugMenu from "@/components/shared/DebugMenu";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
    <html lang="en">
    <body className="antialiased" suppressHydrationWarning>
      <AuthProvider>
        <RequireAuth>
          {children}
        </RequireAuth>
        <DebugMenu />
      </AuthProvider>
    </body>
    </html>
  );
}

