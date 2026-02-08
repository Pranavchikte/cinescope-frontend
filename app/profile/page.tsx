'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  Check, 
  X, 
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { authAPI, profileAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  email: string
  role: 'admin' | 'creator' | 'user'
  is_email_verified: boolean
  is_public_profile: boolean
  created_at: string
}

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    gradient: 'from-red-500',
  },
  creator: {
    label: 'Creator',
    icon: Crown,
    color: 'text-[#14B8A6]',
    bg: 'bg-[#14B8A6]/10',
    border: 'border-[#14B8A6]/30',
    gradient: 'from-[#14B8A6]',
  },
  user: {
    label: 'User',
    icon: User,
    color: 'text-[#A0A0A0]',
    bg: 'bg-[#A0A0A0]/10',
    border: 'border-[#A0A0A0]/30',
    gradient: 'from-[#A0A0A0]',
  },
}

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})
  const router = useRouter()

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setError('Failed to load profile. Please login again.')
        setTimeout(() => router.push('/login'), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleTogglePublicProfile = async () => {
    if (!user) return

    // Prevent non-creators from toggling
    if (user.role === 'user') {
      setShowToast({
        message: 'Only creators can have public profiles',
        type: 'error',
      })
      setTimeout(() => setShowToast(null), 3000)
      return
    }

    try {
      setIsSaving(true)
      const updatedUser = await profileAPI.update({
        is_public_profile: !user.is_public_profile,
      })
      setUser(updatedUser)
      setShowToast({
        message: `Profile is now ${updatedUser.is_public_profile ? 'public' : 'private'}`,
        type: 'success',
      })
      setTimeout(() => setShowToast(null), 3000)
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      setShowToast({
        message: err.message || 'Failed to update profile',
        type: 'error',
      })
      setTimeout(() => setShowToast(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
            <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin relative z-10" />
          </div>
          <p className="text-sm text-[#A0A0A0] animate-pulse">Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-full backdrop-blur-xl"
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] mb-3">
            Something went wrong
          </h2>
          <p className="text-[#A0A0A0] mb-8">{error}</p>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'go-home')
              router.push('/')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-colors relative overflow-hidden group"
          >
            {/* Ripple effect */}
            {ripples['go-home']?.map((ripple) => (
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
            
            <span className="relative z-10">Go Home</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[user.role]
  const RoleIcon = roleConfig.icon

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12 relative">
      {/* Toast Notification */}
      <div className="fixed top-20 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl flex items-center gap-3 min-w-[300px] ${
                showToast.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {showToast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{showToast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <motion.div
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8"
        >
          <Link
            href="/"
            onClick={(e) => handleRipple(e as any, 'back-button')}
            className="inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-[#14B8A6] transition-colors group relative overflow-hidden px-4 py-2 rounded-lg"
          >
            {/* Ripple effect */}
            {ripples['back-button']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Back to home</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">
            Profile Settings
          </h1>
          <p className="text-base text-[#A0A0A0]">
            Manage your account preferences
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-lg p-6 sm:p-8 mb-6 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-[#2A2A2A]">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-20 h-20 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-xl relative overflow-hidden group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-3xl font-bold text-[#14B8A6] relative z-10">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">
                  {user.username}
                </h2>
                <p className="text-sm text-[#A0A0A0] mb-4">{user.email}</p>

                {/* Role Badge */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 ${roleConfig.bg} ${roleConfig.border} border rounded-lg backdrop-blur-xl relative overflow-hidden group cursor-default`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${roleConfig.gradient} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <RoleIcon className={`w-4 h-4 ${roleConfig.color} relative z-10 group-hover:scale-110 transition-transform duration-200`} />
                  <span className={`text-sm font-medium ${roleConfig.color} relative z-10`}>
                    {roleConfig.label}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-6">
              {/* Email Verification Status */}
              <motion.div
                whileHover={{ scale: 1.01, x: 2 }}
                className="flex items-center justify-between p-4 bg-[#0F0F0F]/50 border border-[#2A2A2A] rounded-lg backdrop-blur-xl relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${user.is_email_verified ? 'from-[#10B981]/5' : 'from-[#F59E0B]/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="flex items-center gap-3 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      user.is_email_verified
                        ? 'bg-[#10B981]/10 border border-[#10B981]/30'
                        : 'bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                    } backdrop-blur-xl`}
                  >
                    <Mail
                      className={`w-5 h-5 ${
                        user.is_email_verified ? 'text-[#10B981]' : 'text-[#F59E0B]'
                      }`}
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F5]">
                      Email Verification
                    </p>
                    <p className="text-xs text-[#A0A0A0]">
                      {user.is_email_verified
                        ? 'Your email is verified'
                        : 'Please verify your email'}
                    </p>
                  </div>
                </div>
                {user.is_email_verified ? (
                  <Check className="w-5 h-5 text-[#10B981] relative z-10" />
                ) : (
                  <X className="w-5 h-5 text-[#F59E0B] relative z-10" />
                )}
              </motion.div>

              {/* Public Profile Toggle (Creators/Admins Only) */}
              {(user.role === 'creator' || user.role === 'admin') && (
                <motion.div
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="p-4 bg-[#0F0F0F]/50 border border-[#2A2A2A] rounded-lg backdrop-blur-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 flex-1">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-10 h-10 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg flex items-center justify-center backdrop-blur-xl"
                      >
                        {user.is_public_profile ? (
                          <Eye className="w-5 h-5 text-[#14B8A6]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#14B8A6]" />
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#F5F5F5] mb-1">
                          Public Profile
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {user.is_public_profile
                            ? 'Your ratings are visible to everyone'
                            : 'Your ratings are private'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <motion.button
                      onClick={(e) => {
                        handleRipple(e, 'toggle-switch')
                        handleTogglePublicProfile()
                      }}
                      disabled={isSaving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-14 h-7 rounded-full transition-all duration-200 overflow-hidden ${
                        user.is_public_profile
                          ? 'bg-[#14B8A6]'
                          : 'bg-[#2A2A2A]'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Ripple effect */}
                      {ripples['toggle-switch']?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-white/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 60, height: 60, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <motion.div
                        animate={{ x: user.is_public_profile ? 28 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                      />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* User Role Info (if user) */}
              {user.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/5 to-transparent" />
                  
                  <div className="flex items-start gap-3 relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-10 h-10 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <Crown className="w-5 h-5 text-[#F59E0B]" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-[#F5F5F5] mb-1">
                        Want to share your picks?
                      </p>
                      <p className="text-xs text-[#A0A0A0] mb-3">
                        Request creator access to make your profile public and share your ratings with the community.
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href="/creator-picks"
                          onClick={(e) => handleRipple(e as any, 'become-creator')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg text-sm font-semibold transition-all relative overflow-hidden group"
                        >
                          {/* Ripple effect */}
                          {ripples['become-creator']?.map((ripple) => (
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
                          
                          <Crown className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                          <span className="relative z-10">Become a Creator</span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-lg p-6 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
              Account Details
            </h3>
            <div className="space-y-3">
              <motion.div
                whileHover={{ x: 2 }}
                className="flex justify-between py-3 border-b border-[#2A2A2A] group"
              >
                <span className="text-sm text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors">Member since</span>
                <span className="text-sm font-medium text-[#F5F5F5]">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex justify-between py-3 group"
              >
                <span className="text-sm text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors">User ID</span>
                <span className="text-xs font-mono text-[#F5F5F5] bg-[#0F0F0F] px-3 py-1 rounded border border-[#2A2A2A] group-hover:border-[#14B8A6]/30 transition-colors">
                  {user.id.split('-')[0]}...
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}