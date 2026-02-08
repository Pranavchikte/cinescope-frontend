"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/lib/api";

export function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Ripple state
  const [ripples, setRipples] = useState<{
    [key: string]: { x: number; y: number; id: number }[];
  }>({});

  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }));
    }, 600);
  };

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const user = await authAPI.getCurrentUser();
        if (!user.is_email_verified) {
          setIsVerified(false);

          const dismissed = sessionStorage.getItem(
            "verification_banner_dismissed"
          );
          if (!dismissed) {
            setIsVisible(true);
          }
        }
      } catch (err) {
        setIsVisible(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authAPI.resendVerification();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem("verification_banner_dismissed", "true");
  };

  const shouldShow = isVisible && !isVerified && !isDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50"
        >
          <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] rounded-lg shadow-2xl">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center shrink-0 border border-[#14B8A6]/30">
                    <Mail className="w-5 h-5 text-[#14B8A6]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F5F5]">
                      Verify your email
                    </h3>
                    <p className="text-xs text-[#A0A0A0] mt-0.5">
                      Get full access to all features
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    handleRipple(e, "dismiss");
                    handleDismiss();
                  }}
                  className="w-7 h-7 flex items-center justify-center hover:bg-[#14B8A6]/10 rounded-lg transition-colors duration-200 shrink-0 relative overflow-hidden"
                >
                  {ripples["dismiss"]?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                      animate={{ width: 50, height: 50, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                  <X className="w-4 h-4 text-[#A0A0A0] hover:text-[#14B8A6] relative z-10" />
                </motion.button>
              </div>

              {/* Body */}
              <p className="text-xs text-[#A0A0A0] mb-4">
                Check your inbox for the verification link. Didn't receive it?
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-[#14B8A6] font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Email sent successfully
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      handleRipple(e, "resend");
                      handleResend();
                    }}
                    disabled={isResending}
                    className="h-9 px-4 bg-[#14B8A6] hover:bg-[#14B8A6]/90 disabled:bg-[#1A1A1A] disabled:border disabled:border-[#2A2A2A] disabled:cursor-not-allowed text-[#0F0F0F] disabled:text-[#A0A0A0] rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative overflow-hidden group"
                  >
                    {ripples["resend"]?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    {/* Gradient glow */}
                    {!isResending && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                          }}
                        />
                      </>
                    )}
                    <RefreshCw
                      className={`w-4 h-4 relative z-10 ${
                        isResending ? "animate-spin" : ""
                      }`}
                    />
                    <span className="relative z-10">
                      {isResending ? "Sending..." : "Resend Email"}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}