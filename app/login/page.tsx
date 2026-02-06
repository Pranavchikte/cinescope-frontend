"use client";

import { authAPI } from "@/lib/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await authAPI.login(data);
      window.location.href = "/"; // Force full page reload to trigger middleware
    } catch (error: any) {
      setError("root", {
        message: error.message || "Incorrect email or password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-6">
        <Link href="/">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            CineScope
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Decorative Background Element */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-3xl -z-10" />

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Message */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium"
                >
                  {errors.root.message}
                </motion.div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  {...register("email", {
                    required: "Please enter a valid email or phone number.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address.",
                    },
                  })}
                  type="text"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    {...register("password", {
                      required:
                        "Your password must contain between 4 and 60 characters.",
                      minLength: {
                        value: 4,
                        message: "Password must be at least 4 characters.",
                      },
                      maxLength: {
                        value: 60,
                        message: "Password must not exceed 60 characters.",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.password
                        ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-blue-400 bg-slate-700 border-slate-600"
                />
                <span className="text-slate-300">Keep me signed in</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up
              </Link>
            </div>

            {/* Security Notice */}
            <p className="mt-6 text-xs text-slate-500 text-center">
              This page is protected by Google reCAPTCHA to ensure your security.{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Learn more
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
