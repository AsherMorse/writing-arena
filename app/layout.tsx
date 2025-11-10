import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

