"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token")
    }
  }, [token])

  const validatePassword = (pwd: string) => {
    if (pwd.length > 0 && pwd.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  const validateConfirm = (pwd: string, confirm: string) => {
    if (confirm.length > 0 && pwd !== confirm) {
      setConfirmError("Passwords don't match")
      return false
    }
    setConfirmError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPasswordError("")
    setConfirmError("")

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match")
      return
    }

    if (!token) {
      setError("Invalid reset token")
      return
    }

    setIsLoading(true)

    try {
      await authAPI.resetPassword(token, password)
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError("Failed to reset password. Token may be expired.")
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
                  Password reset!
                </h1>
                <p className="text-sm md:text-base text-neutral-400 mb-6 leading-relaxed">
                  Your password has been reset successfully. Redirecting to home...
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </motion.div>
            ) : error && !token ? (
              // Invalid Token State
              <motion.div
                key="invalid"
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
                  Invalid link
                </h1>
                <p className="text-sm md:text-base text-neutral-400 mb-8 leading-relaxed">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>

                <Link
                  href="/forgot-password"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
                >
                  Request new link
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
                    <Lock className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-2">
                    Set new password
                  </h1>
                  <p className="text-sm md:text-base text-neutral-400">
                    Choose a strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-neutral-300 mb-2 block"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          validatePassword(e.target.value)
                          if (confirmPassword) {
                            validateConfirm(e.target.value, confirmPassword)
                          }
                        }}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 bg-neutral-800/50 border ${
                          passwordError ? "border-red-500/50" : "border-neutral-700"
                        } rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70 transition-all pr-10`}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {passwordError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-red-400 text-xs mt-2 flex items-center gap-1"
                        >
                          <span className="w-1 h-1 bg-red-400 rounded-full" />
                          {passwordError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <p className="text-xs text-neutral-500 mt-2">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-neutral-300 mb-2 block"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        validateConfirm(password, e.target.value)
                      }}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-neutral-800/50 border ${
                        confirmError ? "border-red-500/50" : "border-neutral-700"
                      } rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70 transition-all`}
                      required
                      disabled={isLoading}
                    />
                    <AnimatePresence>
                      {confirmError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-red-400 text-xs mt-2 flex items-center gap-1"
                        >
                          <span className="w-1 h-1 bg-red-400 rounded-full" />
                          {confirmError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* General Error */}
                  <AnimatePresence>
                    {error && token && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isLoading || !password || !confirmPassword || !!passwordError || !!confirmError}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-900 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Reset password</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Additional help text */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Having trouble? Contact{" "}
          
          <a href="mailto:support@example.com"
            className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2">
            support@example.com 
          </a>
        </p>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}