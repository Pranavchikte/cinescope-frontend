"use client"

import { authAPI } from "@/lib/api"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  username: string
  email: string
  password: string
}

export function AuthDemoPage() {
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

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await authAPI.login(data)
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/")
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
        router.push("/")
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Netflix-style background image with overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1574267432644-f65b8b5a6d0f?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-6">
        <Link href="/" className="inline-block">
          <span className="text-[#E50914] text-3xl font-black tracking-tighter">
            CINESCOPE
          </span>
        </Link>
      </div>

      {/* Auth Form Container */}
      <div className="relative z-10 min-h-[calc(100vh-88px)] flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-black/75 backdrop-blur-sm rounded p-16 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-[#46d369]/10 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-[#46d369]" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {tab === "login" ? "Welcome back!" : "Account created!"}
              </h2>
              <p className="text-base text-[#b3b3b3]">
                Redirecting you now...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-black/75 backdrop-blur-sm rounded p-12 sm:p-16"
            >
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-8">
                {tab === "login" ? "Sign In" : "Sign Up"}
              </h1>

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                    className="space-y-4"
                  >
                    {loginForm.formState.errors.root && (
                      <div className="p-4 bg-[#E87C03] text-white rounded text-sm">
                        {loginForm.formState.errors.root.message}
                      </div>
                    )}

                    <div>
                      <input
                        {...loginForm.register("email", {
                          required: "Please enter a valid email.",
                        })}
                        type="email"
                        placeholder="Email"
                        className="w-full h-14 px-5 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-[#E87C03]">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          {...loginForm.register("password", {
                            required: "Your password must contain between 4 and 60 characters.",
                          })}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="w-full h-14 px-5 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-[#E87C03]">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-[#E50914] hover:bg-[#C11119] disabled:bg-[#333333] disabled:text-[#8c8c8c] text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="text-[#b3b3b3] text-base">
                      New to CineScope?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("register")
                          loginForm.clearErrors()
                        }}
                        className="text-white hover:underline"
                      >
                        Sign up now
                      </button>
                      .
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                    className="space-y-4"
                  >
                    {registerForm.formState.errors.root && (
                      <div className="p-4 bg-[#E87C03] text-white rounded text-sm">
                        {registerForm.formState.errors.root.message}
                      </div>
                    )}

                    <div>
                      <input
                        {...registerForm.register("username", {
                          required: "Please enter a username.",
                        })}
                        type="text"
                        placeholder="Username"
                        className="w-full h-14 px-5 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="mt-1 text-sm text-[#E87C03]">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        {...registerForm.register("email", {
                          required: "Please enter a valid email.",
                        })}
                        type="email"
                        placeholder="Email"
                        className="w-full h-14 px-5 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-[#E87C03]">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          {...registerForm.register("password", {
                            required: "Your password must contain between 4 and 60 characters.",
                            minLength: {
                              value: 4,
                              message: "Password must be at least 4 characters.",
                            },
                          })}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="w-full h-14 px-5 bg-[#333333] border border-[#333333] focus:border-white rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-[#E87C03]">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-[#E50914] hover:bg-[#C11119] disabled:bg-[#333333] disabled:text-[#8c8c8c] text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Sign Up"
                      )}
                    </button>

                    <div className="text-[#b3b3b3] text-base">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("login")
                          registerForm.clearErrors()
                        }}
                        className="text-white hover:underline"
                      >
                        Sign in
                      </button>
                      .
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="text-xs text-[#8c8c8c] mt-6">
                This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
                <a href="#" className="text-[#0071eb] hover:underline">
                  Learn more
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}