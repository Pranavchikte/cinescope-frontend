"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, RefreshCw, X, CheckCircle2 } from "lucide-react"
import { authAPI } from "@/lib/api"

export function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVerified, setIsVerified] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) return

        const user = await authAPI.getCurrentUser()
        if (!user.is_email_verified) {
          setIsVerified(false)
          
          // Check if user dismissed banner in this session
          const dismissed = sessionStorage.getItem('verification_banner_dismissed')
          if (!dismissed) {
            setIsVisible(true)
          }
        }
      } catch (err) {
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
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (err) {
      // Could add error toast here instead of alert
      console.error("Failed to resend verification email:", err)
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    // Remember dismissal for this session only
    sessionStorage.setItem('verification_banner_dismissed', 'true')
  }

  const shouldShow = isVisible && !isVerified && !isDismissed

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
        >
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-[1px] shadow-2xl">
            <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Verify your email
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Unlock all features
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                Check your inbox for the verification link. Didn't receive it?
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-emerald-400 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Email sent successfully!
                  </motion.div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="h-10 px-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-400 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}