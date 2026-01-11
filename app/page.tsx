"use client"

import { useState } from "react"
import { BrowsePage } from "@/components/browse-page"
import { AuthModal } from "@/components/auth-modal"
import { getAccessToken } from "@/lib/api"
import { useEffect } from "react"

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setIsAuthenticated(!!token)
    if (!token) {
      setShowAuthModal(true)
    }
  }, [])

  return (
    <>
      <BrowsePage />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}