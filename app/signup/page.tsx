"use client";

import { authAPI } from "@/lib/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    mode: "onChange",
    defaultValues: { username: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await authAPI.register(data);
      await authAPI.login({ email: data.email, password: data.password });
      window.location.href = "/"; // Force full page reload to trigger middleware
    } catch (error: any) {
      setError("root", {
        message:
          error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://assets.nflxext.com/ffe/siteui/vlv3/4690cab8-243a-4552-baef-1fb415632f74/web/IN-en-20241118-TRIFECTA-perspective_0b813abc-8365-4a43-a9d8-14c06e84c9f3_large.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-5">
        <Link href="/">
          <span className="text-[#E50914] text-2xl sm:text-3xl font-black tracking-tighter">
            CINESCOPE
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px] bg-black/75 rounded px-8 sm:px-16 py-12 sm:py-16"
        >
          <h1 className="text-3xl font-bold text-white mb-7">Sign Up</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {errors.root && (
              <div className="px-4 py-3 bg-[#E87C03] rounded text-white text-sm">
                {errors.root.message}
              </div>
            )}

            {/* Username Input */}
            <div>
              <input
                {...register("username", {
                  required: "Please enter a username.",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters.",
                  },
                  maxLength: {
                    value: 20,
                    message: "Username must not exceed 20 characters.",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      "Username can only contain letters, numbers, and underscores.",
                  },
                })}
                type="text"
                placeholder="Username"
                className={`w-full h-[50px] px-5 bg-[#333333] border rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors ${
                  errors.username
                    ? "border-[#E87C03] focus:border-[#E87C03]"
                    : "border-[#333333] focus:border-white"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-[#E87C03]">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <input
                {...register("email", {
                  required: "Please enter a valid email address.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address.",
                  },
                })}
                type="email"
                placeholder="Email address"
                className={`w-full h-[50px] px-5 bg-[#333333] border rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors ${
                  errors.email
                    ? "border-[#E87C03] focus:border-[#E87C03]"
                    : "border-[#333333] focus:border-white"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#E87C03]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
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
                  placeholder="Password"
                  className={`w-full h-[50px] px-5 bg-[#333333] border rounded text-white placeholder:text-[#8c8c8c] focus:outline-none transition-colors ${
                    errors.password
                      ? "border-[#E87C03] focus:border-[#E87C03]"
                      : "border-[#333333] focus:border-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#E87C03]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[50px] bg-[#E50914] hover:bg-[#C11119] disabled:bg-[#E50914]/60 text-white rounded font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-16 text-base text-[#737373]">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign in now
            </Link>
            .
          </div>

          {/* reCAPTCHA Notice */}
          <p className="mt-3 text-xs text-[#8c8c8c]">
            This page is protected by Google reCAPTCHA to ensure you're not a
            bot.{" "}
            <a href="#" className="text-[#0071eb] hover:underline">
              Learn more
            </a>
            .
          </p>
        </motion.div>
      </div>

      {/* Footer Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
