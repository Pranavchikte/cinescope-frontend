"use client"

import { authAPI } from "@/lib/api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mail, Check, Loader2 } from "lucide-react"
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
      setError("Please enter a valid email address")
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
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              // Success State
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
                  Check your email
                </h1>
                <p className="text-sm md:text-base text-neutral-400 mb-8 leading-relaxed">
                  If an account exists for{" "}
                  <span className="text-neutral-300 font-medium">{email}</span>, you'll receive a
                  password reset link shortly.
                </p>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-100 rounded-xl font-medium transition-all"
                >
                  Return to home
                </Link>
              </motion.div>
            ) : (
              // Form State
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-2">
                    Forgot password?
                  </h1>
                  <p className="text-sm md:text-base text-neutral-400">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-neutral-300 mb-2 block"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-neutral-800/50 border ${
                        error ? "border-red-500/50" : "border-neutral-700"
                      } rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70 transition-all`}
                      required
                      disabled={isLoading}
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-red-400 text-xs mt-2 flex items-center gap-1"
                        >
                          <span className="w-1 h-1 bg-red-400 rounded-full" />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-900 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send reset link</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Remember your password?{" "}
                    <span className="font-medium underline underline-offset-2">Sign in</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Additional help text */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Having trouble? Contact{" "}
          <a href="mailto:support@example.com" className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2">
            support@example.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}