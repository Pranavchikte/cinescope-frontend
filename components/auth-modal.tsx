"use client";

import { authAPI } from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loginForm = useForm<LoginFormData>({
    mode: "onBlur",
  });

  const registerForm = useForm<RegisterFormData>({
    mode: "onBlur",
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    if (!data.email || !data.password) {
      if (!data.email)
        loginForm.setError("email", { message: "Email is required" });
      if (!data.password)
        loginForm.setError("password", { message: "Password is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      loginForm.setError("email", { message: "Please enter a valid email" });
      return;
    }

    try {
      await authAPI.login(data);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setTab("login");
        loginForm.reset();
        window.location.reload(); // Refresh to update auth state
      }, 1500);
    } catch (error) {
      loginForm.setError("email", { message: "Invalid credentials" });
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    if (!data.username || !data.email || !data.password) {
      if (!data.username)
        registerForm.setError("username", { message: "Username is required" });
      if (!data.email)
        registerForm.setError("email", { message: "Email is required" });
      if (!data.password)
        registerForm.setError("password", { message: "Password is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      registerForm.setError("email", { message: "Please enter a valid email" });
      return;
    }

    if (data.password.length < 8) {
      registerForm.setError("password", {
        message: "Password must be at least 8 characters",
      });
      return;
    }

    try {
      await authAPI.register(data);
      // Auto login after register
      await authAPI.login({ email: data.email, password: data.password });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setTab("login");
        registerForm.reset();
        window.location.reload();
      }, 1500);
    } catch (error) {
      registerForm.setError("email", {
        message: "Registration failed. Email may already exist.",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md glass-dark rounded-xl overflow-hidden">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-secondary/50 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>

              {/* Success State */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                  >
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {tab === "login" ? "Welcome back!" : "Account created!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {tab === "login"
                      ? "You're all set to start exploring."
                      : "You can now start tracking your movies."}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="border-b border-white/10 px-6 pt-6">
                    <div className="flex gap-4">
                      {(["login", "register"] as const).map((t) => (
                        <motion.button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`pb-3 px-1 relative font-semibold transition-colors ${
                            tab === t
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                          {tab === t && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      {tab === "login" ? (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                          className="space-y-4"
                        >
                          {/* Email Input */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Email
                            </label>
                            <input
                              type="email"
                              placeholder="you@example.com"
                              {...loginForm.register("email")}
                              className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {loginForm.formState.errors.email && (
                              <p className="text-destructive text-xs mt-1">
                                {loginForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          {/* Password Input */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...loginForm.register("password")}
                                className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {loginForm.formState.errors.password && (
                              <p className="text-destructive text-xs mt-1">
                                {loginForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          {/* Forgot Password */}
                          <div className="flex justify-end pt-2">
                            <a
                              href="/forgot-password"
                              className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              Forgot password?
                            </a>
                          </div>

                          {/* Submit Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors mt-6"
                          >
                            Login
                          </motion.button>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="register"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={registerForm.handleSubmit(
                            handleRegisterSubmit
                          )}
                          className="space-y-4"
                        >
                          {/* Username Input */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Username
                            </label>
                            <input
                              type="text"
                              placeholder="cinephile"
                              {...registerForm.register("username")}
                              className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {registerForm.formState.errors.username && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.username.message}
                              </p>
                            )}
                          </div>

                          {/* Email Input */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Email
                            </label>
                            <input
                              type="email"
                              placeholder="you@example.com"
                              {...registerForm.register("email")}
                              className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {registerForm.formState.errors.email && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          {/* Password Input */}
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...registerForm.register("password")}
                                className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {registerForm.formState.errors.password && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          {/* Submit Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors mt-6"
                          >
                            Register
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
