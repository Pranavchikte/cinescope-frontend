import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { LayoutContent } from "./layout-content"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CineScope - Track Your Movies & TV Shows",
  description:
    "Your ultimate movie and TV show tracking app. Keep track of what you watch, rate, and discover new content.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <LayoutContent>{children}</LayoutContent>
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}