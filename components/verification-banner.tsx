"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"
import { authAPI } from "@/lib/api"

export function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVerified, setIsVerified] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) return

        const user = await authAPI.getCurrentUser()
        if (!user.is_email_verified) {
          setIsVerified(false)
          setIsVisible(true)
        }
      } catch (err) {
        // User not logged in or error
        setIsVisible(false)
      }
    }

    checkVerificationStatus()
  }, [])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authAPI.resendVerification()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      alert("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!isVisible || isVerified) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500/95 backdrop-blur-sm border-t border-yellow-500/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-6 h-6 text-yellow-900 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">
                Verify your email to unlock all features
              </p>
              <p className="text-xs text-yellow-800 mt-1">
                Check your inbox for the verification link or resend it below
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showSuccess ? (
              <span className="text-sm text-green-900 font-semibold">Email sent! ✓</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="px-4 py-2 bg-yellow-900 hover:bg-yellow-800 text-yellow-50 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                Resend Email
              </button>
            )}
            
            
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}