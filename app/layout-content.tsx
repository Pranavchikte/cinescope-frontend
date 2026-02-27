'use client'

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VerificationBanner } from "@/components/verification-banner"
import { ChatButton } from "@/components/chat/chat-button"
import { AuthProvider } from "@/lib/auth"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/signup') || 
                     pathname?.startsWith('/forgot-password')
  
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {!isAuthPage && (
          <>
            <Navbar />
            <VerificationBanner />
          </>
        )}
        <main className={!isAuthPage ? "pt-16" : ""}>{children}</main>
        {!isAuthPage && <ChatButton />}
      </AuthProvider>
    </QueryClientProvider>
  )
}