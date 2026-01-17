import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { VerificationBanner } from "@/components/verification-banner"

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
        <Navbar />
        <VerificationBanner />
        <main className="pt-16">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}