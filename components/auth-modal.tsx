"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterFormData>({
    mode: "onChange",
    defaultValues: { username: "", email: "", password: "" },
  })

  useEffect(() => {
    if (!isOpen) {
      loginForm.reset()
      registerForm.reset()
      setShowPassword(false)
      setIsSuccess(false)
      setTab("login")
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-black/95 backdrop-blur-xl rounded overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-16 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-[#46d369]/10 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-8 h-8 text-[#46d369]" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {tab === "login" ? "Welcome back!" : "Account created!"}
                    </h2>
                    <p className="text-sm text-[#b3b3b3]">Redirecting...</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      {tab === "login" ? "Sign In" : "Sign Up"}
                    </h2>

                    <AnimatePresence mode="wait">
                      {tab === "login" ? (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                          className="space-y-4"
                        >
                          {loginForm.formState.errors.root && (
                            <div className="p-3 bg-[#E87C03] text-white rounded text-sm">
                              {loginForm.formState.errors.root.message}
                            </div>
                          )}
                          <input
                            {...loginForm.register("email", { required: true })}
                            type="email"
                            placeholder="Email"
                            className="w-full h-12 px-4 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none"
                          />
                          <div className="relative">
                            <input
                              {...loginForm.register("password", { required: true })}
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              className="w-full h-12 px-4 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3]"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#E50914] hover:bg-[#C11119] disabled:bg-[#333333] text-white rounded font-medium flex items-center justify-center"
                          >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                          </button>
                          <p className="text-sm text-[#b3b3b3] text-center">
                            New to CineScope?{" "}
                            <button type="button" onClick={() => setTab("register")} className="text-white hover:underline">
                              Sign up now
                            </button>
                          </p>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="register"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                          className="space-y-4"
                        >
                          {registerForm.formState.errors.root && (
                            <div className="p-3 bg-[#E87C03] text-white rounded text-sm">
                              {registerForm.formState.errors.root.message}
                            </div>
                          )}
                          <input
                            {...registerForm.register("username", { required: true })}
                            placeholder="Username"
                            className="w-full h-12 px-4 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none"
                          />
                          <input
                            {...registerForm.register("email", { required: true })}
                            type="email"
                            placeholder="Email"
                            className="w-full h-12 px-4 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none"
                          />
                          <input
                            {...registerForm.register("password", { required: true, minLength: 4 })}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full h-12 px-4 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#E50914] hover:bg-[#C11119] disabled:bg-[#333333] text-white rounded font-medium flex items-center justify-center"
                          >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                          </button>
                          <p className="text-sm text-[#b3b3b3] text-center">
                            Already have an account?{" "}
                            <button type="button" onClick={() => setTab("login")} className="text-white hover:underline">
                              Sign in
                            </button>
                          </p>
                        </motion.form>
                      )}
                    </AnimatePresence>
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