import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { LayoutContent } from "./layout-content";

export const metadata: Metadata = {
  title: "CineScope - Stream Movies & TV",
  description:
    "Stream instantly and pick up where you left off. Watch, resume, and discover movies and TV shows.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <LayoutContent>{children}</LayoutContent>
        <Toaster
          position="top-center"
          richColors={false}
          closeButton
          toastOptions={{
            style: {
              background: "rgba(18, 22, 28, 0.9)",
              color: "var(--foreground)",
              border: "1px solid rgba(36, 42, 51, 0.8)",
              borderRadius: "16px",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(18px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            },
            className: "custom-toast",
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
