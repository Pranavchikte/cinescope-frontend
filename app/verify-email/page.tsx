"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthBackground } from "@/components/auth-background"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(3)
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

  // Ripple effect handler
  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }))

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }))
    }, 600)
  }

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Invalid or missing verification token")
        return
      }

      try {
        const result = await authAPI.verifyEmail(token)
        setStatus("success")
        setMessage(result.message || "Email verified successfully!")

        // Start countdown
        let count = 3
        const countdownInterval = setInterval(() => {
          count -= 1
          setCountdown(count)
          if (count <= 0) {
            clearInterval(countdownInterval)
          }
        }, 1000)

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/" // Hard redirect to refresh auth state
        }, 3000)
      } catch (err) {
        setStatus("error")
        setMessage("Verification failed. Token may be expired or invalid.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-lg p-8 shadow-2xl relative overflow-hidden">
          {/* Gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent" />
                    <Loader2 className="w-8 h-8 text-[#14B8A6] relative z-10" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3">
                    Verifying your email...
                  </h1>
                  <p className="text-sm md:text-base text-[#A0A0A0]">
                    Please wait a moment while we verify your account
                  </p>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent" />
                    <Check className="w-8 h-8 text-[#14B8A6] relative z-10" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3">
                    Email verified!
                  </h1>
                  <p className="text-sm md:text-base text-[#A0A0A0] mb-6 leading-relaxed">
                    {message}
                  </p>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-lg backdrop-blur-xl">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className="w-4 h-4 text-[#14B8A6]" />
                    </motion.div>
                    <p className="text-sm text-[#A0A0A0]">
                      Redirecting to home in {countdown}s...
                    </p>
                  </div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                  >
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3">
                    Verification failed
                  </h1>
                  <p className="text-sm md:text-base text-[#A0A0A0] mb-8 leading-relaxed">
                    {message}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/"
                      onClick={(e) => handleRipple(e as any, 'return-home')}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all duration-200 relative overflow-hidden group"
                    >
                      {/* Ripple effect */}
                      {ripples['return-home']?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-white/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      {/* Gradient glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }} />
                      
                      <span className="relative z-10">Return to home</span>
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Help Text */}
        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center text-xs text-[#A0A0A0]/60 mt-6"
            >
              Need help? Contact{" "}
              <a 
                href="mailto:support@example.com"
                className="text-[#14B8A6] hover:text-[#0D9488] transition-colors relative group inline-block"
              >
                support@example.com
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
              </a>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-10 h-10 text-[#14B8A6] relative z-10" />
              </motion.div>
            </div>
            <p className="text-sm text-[#A0A0A0] animate-pulse">Loading...</p>
          </motion.div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}