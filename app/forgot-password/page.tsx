'use client'

import React from "react"
import { authAPI } from '@/lib/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AuthBackground } from '@/components/auth-background'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      await authAPI.forgotPassword(email)
      setIsSuccess(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0F0F0F] flex flex-col">
      <AuthBackground />

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-6">
        <Link href="/">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block text-2xl sm:text-3xl font-bold text-[#14B8A6] cursor-pointer"
          >
            CineScope
          </motion.span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-lg p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
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
                      Check your email
                    </h1>
                    <p className="text-sm md:text-base text-[#A0A0A0] mb-8 leading-relaxed">
                      If an account exists for{" "}
                      <span className="text-[#F5F5F5] font-medium">{email}</span>, you'll receive a
                      password reset link shortly.
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/"
                        onClick={(e) => handleRipple(e as any, 'return-home')}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all relative overflow-hidden group"
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
                ) : (
                  // Form State
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-14 h-14 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl relative overflow-hidden group cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Mail className="w-6 h-6 text-[#14B8A6] relative z-10" />
                      </motion.div>
                      <h1 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] mb-2 text-center">
                        Forgot password?
                      </h1>
                      <p className="text-sm md:text-base text-[#A0A0A0] text-center">
                        No worries, we'll send you reset instructions.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Error Message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium backdrop-blur-xl relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
                            <span className="relative z-10">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-[#F5F5F5] mb-2 block"
                        >
                          Email address
                        </label>
                        <motion.div
                          whileFocus={{ scale: 1.01 }}
                          className="relative"
                        >
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setError('')
                            }}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 bg-[#2A2A2A]/50 border border-[#2A2A2A] focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 rounded-lg text-[#F5F5F5] placeholder-[#A0A0A0] focus:outline-none transition-all backdrop-blur-xl"
                            required
                            disabled={isLoading}
                          />
                          {/* Gradient glow on focus */}
                          <div className="absolute inset-0 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)' }} />
                        </motion.div>
                      </div>

                      <motion.button
                        type="submit"
                        onClick={(e) => handleRipple(e, 'submit-button')}
                        disabled={isLoading || !email}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-[#14B8A6] hover:bg-[#14B8A6]/90 disabled:bg-[#2A2A2A] disabled:text-[#A0A0A0] text-[#0F0F0F] rounded-lg font-semibold transition-all disabled:cursor-not-allowed relative overflow-hidden group"
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
                            <span className="relative z-10">Sending...</span>
                          </>
                        ) : (
                          <span className="relative z-10">Send reset link</span>
                        )}
                      </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                      <Link
                        href="/login"
                        className="text-sm text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors inline-block group"
                      >
                        <span className="relative">
                          Remember your password?{" "}
                          <span className="font-medium text-[#14B8A6] group-hover:text-[#0D9488] transition-colors">
                            Sign in
                          </span>
                          {/* Underline gradient on hover */}
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-[#14B8A6] to-[#0D9488] group-hover:w-full transition-all duration-300" />
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Notice */}
              <p className="mt-6 text-xs text-[#A0A0A0]/60 text-center">
                Having trouble? Contact{" "}
                <a
                  href="mailto:support@cinescope.com"
                  className="text-[#14B8A6] hover:text-[#0D9488] transition-colors relative group inline-block"
                >
                  support@cinescope.com
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}