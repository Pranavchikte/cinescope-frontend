'use client'

import React from "react"

import { authAPI } from '@/lib/api'
import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthBackground } from '@/components/auth-background'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
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
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  const validatePassword = (pwd: string) => {
    if (pwd.length > 0 && pwd.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirm = (pwd: string, confirm: string) => {
    if (confirm.length > 0 && pwd !== confirm) {
      setConfirmError("Passwords don't match")
      return false
    }
    setConfirmError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setConfirmError('')

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match")
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      await authAPI.resetPassword(token, password)
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError('Failed to reset password. Token may be expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Back Link */}
            <motion.div
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="mb-8"
            >
              <Link
                href="/"
                onClick={(e) => handleRipple(e as any, 'back-link')}
                className="inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors group relative overflow-hidden px-4 py-2 rounded-lg"
              >
                {/* Ripple effect */}
                {ripples['back-link']?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                
                <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Back to home</span>
              </Link>
            </motion.div>

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
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Check className="w-8 h-8 text-[#14B8A6] relative z-10" />
                  </motion.div>

                  <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3">
                    Password reset!
                  </h1>
                  <p className="text-sm md:text-base text-[#A0A0A0] mb-6 leading-relaxed">
                    Your password has been reset successfully. Redirecting to home...
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm text-[#A0A0A0]">
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
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
                  >
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </motion.div>

                  <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3">
                    Invalid link
                  </h1>
                  <p className="text-sm md:text-base text-[#A0A0A0] mb-8 leading-relaxed">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/forgot-password"
                      onClick={(e) => handleRipple(e as any, 'new-link')}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all relative overflow-hidden group"
                    >
                      {/* Ripple effect */}
                      {ripples['new-link']?.map((ripple) => (
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
                      
                      <span className="relative z-10">Request new link</span>
                    </Link>
                  </motion.div>
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
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="w-14 h-14 rounded-lg bg-[#1A1A1A]/50 border border-[#2A2A2A] flex items-center justify-center mx-auto mb-4 backdrop-blur-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Lock className="w-6 h-6 text-[#14B8A6] relative z-10" />
                    </motion.div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-2">
                      Set new password
                    </h1>
                    <p className="text-sm md:text-base text-[#A0A0A0]">
                      Choose a strong password for your account.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-[#F5F5F5] mb-2 block"
                      >
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            validatePassword(e.target.value)
                            if (confirmPassword) {
                              validateConfirm(e.target.value, confirmPassword)
                            }
                          }}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 bg-[#2A2A2A]/50 border ${
                            passwordError ? 'border-red-500/50' : 'border-[#2A2A2A]'
                          } rounded-lg text-[#F5F5F5] placeholder-[#A0A0A0] focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 transition-all pr-10 backdrop-blur-xl`}
                          required
                          disabled={isLoading}
                        />
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            handleRipple(e, 'password-toggle')
                            setShowPassword(!showPassword)
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors relative overflow-hidden"
                          tabIndex={-1}
                        >
                          {/* Ripple effect */}
                          {ripples['password-toggle']?.map((ripple) => (
                            <motion.span
                              key={ripple.id}
                              className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                              style={{ left: ripple.x, top: ripple.y }}
                              initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                              animate={{ width: 40, height: 40, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                            />
                          ))}
                          
                          <AnimatePresence mode="wait">
                            {showPassword ? (
                              <motion.div
                                key="eyeoff"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.2 }}
                              >
                                <EyeOff className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="eye"
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        {/* Gradient glow on focus */}
                        <div className="absolute inset-0 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: passwordError ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(20, 184, 166, 0.2)' }} />
                      </div>
                      <AnimatePresence>
                        {passwordError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-red-400 text-xs mt-2 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-400 rounded-full" />
                            {passwordError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className="text-xs text-[#A0A0A0] mt-2">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-[#F5F5F5] mb-2 block"
                      >
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            validateConfirm(password, e.target.value)
                          }}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 bg-[#2A2A2A]/50 border ${
                            confirmError ? 'border-red-500/50' : 'border-[#2A2A2A]'
                          } rounded-lg text-[#F5F5F5] placeholder-[#A0A0A0] focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 transition-all backdrop-blur-xl`}
                          required
                          disabled={isLoading}
                        />
                        {/* Gradient glow on focus */}
                        <div className="absolute inset-0 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: confirmError ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(20, 184, 166, 0.2)' }} />
                      </div>
                      <AnimatePresence>
                        {confirmError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
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
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-xl relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 relative z-10" />
                          <p className="text-sm text-red-400 relative z-10">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      onClick={(e) => handleRipple(e, 'submit-button')}
                      disabled={
                        isLoading ||
                        !password ||
                        !confirmPassword ||
                        !!passwordError ||
                        !!confirmError
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 disabled:bg-[#2A2A2A] disabled:text-[#A0A0A0] text-[#0F0F0F] rounded-lg font-semibold transition-all disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      {/* Ripple effect */}
                      {ripples['submit-button']?.map((ripple) => (
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
                      
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                          <span className="relative z-10">Resetting...</span>
                        </>
                      ) : (
                        <span className="relative z-10">Reset password</span>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Additional help text */}
        <p className="text-center text-xs text-[#A0A0A0]/60 mt-6">
          Having trouble? Contact{' '}
          <a
            href="mailto:support@example.com"
            className="text-[#A0A0A0] hover:text-[#F5F5F5] underline underline-offset-2 transition-colors relative group inline-block"
          >
            support@example.com
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
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
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
              <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin relative z-10" />
            </div>
            <p className="text-sm text-[#A0A0A0] animate-pulse">Loading...</p>
          </motion.div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}