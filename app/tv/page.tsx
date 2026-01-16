"use client"

import { useState, useEffect } from "react"
import { TVBrowsePage } from "@/components/tv-browse-page"
import { AuthModal } from "@/components/auth-modal"
import { getAccessToken } from "@/lib/api"

export default function TVPage() {
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
      <TVBrowsePage />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}