"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(3)

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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-3">
                  Verifying your email...
                </h1>
                <p className="text-sm md:text-base text-neutral-400">
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
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-8 h-8 text-green-500" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-3">
                  Email verified!
                </h1>
                <p className="text-sm md:text-base text-neutral-400 mb-6 leading-relaxed">
                  {message}
                </p>
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800/30 border border-neutral-700/30 rounded-xl">
                  <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                  <p className="text-sm text-neutral-400">
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
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-3">
                  Verification failed
                </h1>
                <p className="text-sm md:text-base text-neutral-400 mb-8 leading-relaxed">
                  {message}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
                >
                  Return to home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Text */}
        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center text-xs text-neutral-500 mt-6"
            >
              Need help? Contact{" "}
              
              <a href="mailto:support@example.com"
                className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2"
              >
                support@example.com
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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
            <p className="text-sm text-neutral-500">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}