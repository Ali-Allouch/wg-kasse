import type { Metadata } from "next";
// Removed Geist fonts as they are not standard and not explicitly requested for this FinTech/SaaS design.
import "./globals.css";
import "../types/next.d"; // Import the custom types

export const metadata: Metadata = {
  title: "WGKasse - Shared Apartment Expense Tracker",
  description: "An enterprise-grade expense tracker for shared apartments.",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
