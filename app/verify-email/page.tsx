"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

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
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = "/" // Hard redirect to refresh auth state
        }, 2000)
      } catch (err) {
        setStatus("error")
        setMessage("Verification failed. Token may be expired or invalid.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="glass-dark rounded-xl p-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait a moment</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting to home...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Verification failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                Return to home
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}