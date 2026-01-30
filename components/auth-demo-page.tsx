"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Film, Lock, Star, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function AuthDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const features = [
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Industry-standard security with encrypted credentials"
    },
    {
      icon: Star,
      title: "Personalized Experience",
      description: "Track your favorite movies and build custom watchlists"
    },
    {
      icon: Shield,
      title: "Email Verification",
      description: "Verified accounts get full access to all features"
    }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                <Film className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                CineScope
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Your personal movie tracking and discovery platform
            </p>

            {/* CTA Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-12 px-8 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/30"
            >
              Get Started
            </Button>

            {/* Demo Credentials Helper */}
            <div className="mt-6 p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl inline-block">
              <p className="text-xs text-zinc-500 mb-2">Demo Credentials (optional)</p>
              <div className="flex flex-col sm:flex-row gap-2 text-xs">
                <code className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg">
                  demo@cinescope.com
                </code>
                <code className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg">
                  password123
                </code>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group"
              >
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-zinc-500">
              Click "Get Started" to see the authentication modal in action
            </p>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}