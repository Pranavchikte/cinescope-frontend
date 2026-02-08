'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { AuthBackground } from '@/components/auth-background'

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <AuthBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        <div className="relative">
          {/* Gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
          
          {/* Spinner */}
          <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin relative z-10" />
        </div>
        
        <p className="text-sm text-[#A0A0A0] animate-pulse">Loading...</p>
      </motion.div>
    </div>
  )
}