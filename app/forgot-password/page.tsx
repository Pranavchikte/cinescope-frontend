"use client"

import { authAPI } from "@/lib/api"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Check } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email")
      setIsLoading(false)
      return
    }

    try {
      await authAPI.forgotPassword(email)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-dark rounded-xl p-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {isSuccess ? (
            // Success State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                If an account exists for {email}, you'll receive a password reset link shortly.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                Return to home
              </Link>
            </motion.div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
                <p className="text-muted-foreground">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                  {error && <p className="text-destructive text-xs mt-1">{error}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}