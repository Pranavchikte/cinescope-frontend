'use client'

import { authAPI } from '@/lib/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthBackground } from '@/components/auth-background'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

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

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await authAPI.login(data)
      window.location.href = '/' // Force full page reload to trigger middleware
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Incorrect email or password.',
      })
    } finally {
      setIsSubmitting(false)
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <h1 className="text-4xl font-bold text-[#F5F5F5] mb-2">Welcome Back</h1>
                <p className="text-[#A0A0A0]">Sign in to your account to continue</p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Message */}
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium backdrop-blur-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
                      <span className="relative z-10">{errors.root.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email', {
                        required: 'Please enter a valid email or phone number.',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address.',
                        },
                      })}
                      type="text"
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-[#2A2A2A]/50 border rounded-lg text-[#F5F5F5] placeholder:text-[#A0A0A0] focus:outline-none transition-all backdrop-blur-xl ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-[#2A2A2A] focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20'
                      }`}
                    />
                    {/* Gradient glow on focus */}
                    <div className="absolute inset-0 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: errors.email ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(20, 184, 166, 0.2)' }} />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-red-400 font-medium"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#F5F5F5]">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#14B8A6] hover:text-[#0D9488] transition-colors relative group inline-block"
                    >
                      Forgot password?
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required:
                          'Your password must contain between 4 and 60 characters.',
                        minLength: {
                          value: 4,
                          message: 'Password must be at least 4 characters.',
                        },
                        maxLength: {
                          value: 60,
                          message: 'Password must not exceed 60 characters.',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pr-12 bg-[#2A2A2A]/50 border rounded-lg text-[#F5F5F5] placeholder:text-[#A0A0A0] focus:outline-none transition-all backdrop-blur-xl ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-[#2A2A2A] focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20'
                      }`}
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
                            <EyeOff className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    {/* Gradient glow on focus */}
                    <div className="absolute inset-0 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: errors.password ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(20, 184, 166, 0.2)' }} />
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-red-400 font-medium"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Remember Me */}
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-3 text-sm cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-[#14B8A6] bg-[#2A2A2A] border-[#2A2A2A] cursor-pointer peer"
                    />
                    <div className="absolute inset-0 rounded opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ boxShadow: '0 0 10px rgba(20, 184, 166, 0.5)' }} />
                  </div>
                  <span className="text-[#F5F5F5] group-hover:text-[#14B8A6] transition-colors">
                    Keep me signed in
                  </span>
                </motion.label>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  onClick={(e) => handleRipple(e, 'submit-button')}
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 bg-[#14B8A6] hover:bg-[#14B8A6]/90 disabled:bg-[#2A2A2A] disabled:text-[#A0A0A0] text-[#0F0F0F] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group disabled:cursor-not-allowed relative overflow-hidden"
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
                  
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <>
                      <span className="relative z-10">Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center text-[#A0A0A0]"
              >
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#14B8A6] hover:text-[#0D9488] font-semibold transition-colors relative group inline-block"
                >
                  Sign up
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-[#14B8A6] to-[#0D9488] group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>

              {/* Security Notice */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-xs text-[#A0A0A0]/60 text-center"
              >
                This page is protected by Google reCAPTCHA to ensure your security.{" "}
                <a
                  href="#"
                  className="text-[#14B8A6] hover:text-[#0D9488] transition-colors relative group inline-block"
                >
                  Learn more
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
                </a>
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}