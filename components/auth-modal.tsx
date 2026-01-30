"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link" // Use Link for internal navigation

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  username: string
  email: string
  password: string
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterFormData>({
    mode: "onChange",
    defaultValues: { username: "", email: "", password: "" },
  })

  const watchedPassword = registerForm.watch("password")

  // Calculate password strength
  useEffect(() => {
    if (!watchedPassword) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (watchedPassword.length >= 8) strength++
    if (watchedPassword.length >= 12) strength++
    if (/[a-z]/.test(watchedPassword) && /[A-Z]/.test(watchedPassword)) strength++
    if (/\d/.test(watchedPassword)) strength++
    if (/[^a-zA-Z0-9]/.test(watchedPassword)) strength++

    setPasswordStrength(Math.min(strength, 4))
  }, [watchedPassword])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      loginForm.reset()
      registerForm.reset()
      setShowPassword(false)
      setIsSuccess(false)
      setPasswordStrength(0)
    }
  }, [isOpen, loginForm, registerForm])

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await authAPI.login(data)
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1500)
    } catch (error: any) {
      loginForm.setError("root", {
        message: error.message || "Invalid email or password.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      await authAPI.register(data)
      await authAPI.login({ email: data.email, password: data.password })
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1500)
    } catch (error: any) {
      registerForm.setError("root", {
        message: error.message || "Registration failed.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const colors = ["bg-red-500", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"]
    return colors[passwordStrength] || "bg-zinc-700"
  }

  const getPasswordStrengthText = () => {
    const texts = ["", "Weak", "Fair", "Good", "Strong"]
    return texts[passwordStrength]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-12 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {tab === "login" ? "Welcome back!" : "Account created!"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Redirecting you now...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="px-6 pt-6 pb-4">
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {tab === "login" ? "Welcome back" : "Create account"}
                      </h2>
                      <p className="text-sm text-zinc-400">
                        {tab === "login" ? "Sign in to continue" : "Sign up to start tracking"}
                      </p>
                    </div>

                    <div className="border-b border-zinc-800 px-6">
                      <div className="flex gap-6">
                        {(["login", "register"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setTab(t)
                              loginForm.clearErrors()
                              registerForm.clearErrors()
                            }}
                            className="relative pb-3 font-medium text-sm transition-colors"
                          >
                            <span className={tab === t ? "text-white" : "text-zinc-500 hover:text-zinc-300"}>
                              {t === "login" ? "Sign In" : "Sign Up"}
                            </span>
                            {tab === t && (
                              <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {tab === "login" ? (
                          <motion.form
                            key="login-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                            className="space-y-4"
                          >
                            {loginForm.formState.errors.root && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                {loginForm.formState.errors.root.message}
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Email</label>
                              <input
                                {...loginForm.register("email", { required: "Required" })}
                                className="w-full h-12 px-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                                type="email"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Password</label>
                              <div className="relative">
                                <input
                                  {...loginForm.register("password", { required: "Required" })}
                                  type={showPassword ? "text" : "password"}
                                  className="w-full h-12 px-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Link href="/forgot-password" title="reset-password" className="text-xs text-violet-400 hover:text-violet-300">
                                Forgot password?
                              </Link>
                            </div>
                            <button
                              disabled={isSubmitting}
                              className="w-full h-12 bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                            </button>
                          </motion.form>
                        ) : (
                          /* Register form goes here - structure is similar to login */
                          <motion.form
                            key="reg-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                            className="space-y-4"
                          >
                            {/* ... (Register Fields) ... */}
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Username</label>
                              <input
                                {...registerForm.register("username", { required: "Required" })}
                                className="w-full h-12 px-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Email</label>
                              <input
                                {...registerForm.register("email", { required: "Required" })}
                                className="w-full h-12 px-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Password</label>
                              <div className="relative">
                                <input
                                  {...registerForm.register("password", { required: "Required", minLength: 8 })}
                                  type={showPassword ? "text" : "password"}
                                  className="w-full h-12 px-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                                />
                              </div>
                              {/* Strength indicator */}
                              <div className="mt-2 flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength ? getPasswordStrengthColor() : "bg-zinc-700"}`} />
                                ))}
                              </div>
                            </div>
                            <button
                              disabled={isSubmitting}
                              className="w-full h-12 bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <p className="text-xs text-center text-zinc-500 mt-6">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-violet-400">Terms</Link> and{" "}
                        <Link href="/privacy" className="text-violet-400">Privacy</Link>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}