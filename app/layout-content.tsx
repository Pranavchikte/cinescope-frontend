'use client'

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VerificationBanner } from "@/components/verification-banner"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/signup') || 
                     pathname?.startsWith('/forgot-password')

  return (
    <>
      {!isAuthPage && (
        <>
          <Navbar />
          <VerificationBanner />
        </>
      )}
      <main className={!isAuthPage ? "pt-16" : ""}>{children}</main>
    </>
  )
}