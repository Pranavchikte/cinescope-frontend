import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { LayoutContent } from "./layout-content";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineScope - Track Your Movies & TV Shows",
  description:
    "Your ultimate movie and TV show tracking app. Keep track of what you watch, rate, and discover new content.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <LayoutContent>{children}</LayoutContent>
        <Toaster
          position="top-center"
          richColors={false}
          closeButton
          toastOptions={{
            style: {
              background: "rgba(26, 26, 26, 0.8)",
              color: "#F5F5F5",
              border: "1px solid rgba(42, 42, 42, 0.6)",
              borderRadius: "12px",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(16px)",
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
