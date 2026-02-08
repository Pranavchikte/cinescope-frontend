'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Send, Crown, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react'
import { creatorsAPI, creatorRequestsAPI, authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Creator {
  id: string
  username: string
  is_public_profile: boolean
}

interface ToastMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

function CreatorCardSkeleton() {
  return (
    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg p-6 backdrop-blur-xl animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-[#2A2A2A] rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-[#2A2A2A] rounded w-32 mb-2" />
          <div className="h-3 bg-[#2A2A2A] rounded w-24" />
        </div>
      </div>
      <div className="h-10 bg-[#2A2A2A] rounded-lg" />
    </div>
  )
}

function CreatorRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: string) => void
  isLoading: boolean
}) {
  const [message, setMessage] = useState('')
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onSubmit(message)
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1A1A1A]/90 border border-[#2A2A2A] rounded-lg max-w-md w-full p-8 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Gradient glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50" />
          
          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#14B8A6]/20 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">
                Become a Creator
              </h2>
              <p className="text-[#A0A0A0] text-sm mb-6">
                Share your curated picks with our community
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us why you'd be a great creator..."
                  className="w-full bg-[#2A2A2A]/50 border border-[#2A2A2A] text-[#F5F5F5] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#14B8A6]/50 focus:bg-[#2A2A2A]/70 transition-all duration-200 placeholder:text-[#A0A0A0]/50 backdrop-blur-xl"
                  rows={4}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3"
              >
                <motion.button
                  type="button"
                  onClick={(e) => {
                    handleRipple(e, 'cancel')
                    onClose()
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#2A2A2A] text-white rounded-lg py-2.5 font-medium relative overflow-hidden group disabled:opacity-50"
                >
                  {/* Ripple effect */}
                  {ripples['cancel']?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-white/20 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                      animate={{ width: 100, height: 100, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-[#A0A0A0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative z-10">Cancel</span>
                </motion.button>

                <motion.button
                  type="submit"
                  onClick={(e) => handleRipple(e, 'submit')}
                  disabled={isLoading || !message.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#14B8A6] text-black rounded-lg py-2.5 flex items-center justify-center gap-2 font-semibold relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Ripple effect */}
                  {ripples['submit']?.map((ripple) => (
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
                  
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                      <span className="relative z-10">Send Request</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function CreatorPicksPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [myRequest, setMyRequest] = useState<any>(null)
  const [requestLoading, setRequestLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

  const router = useRouter()

  // Toast management
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

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
    const init = async () => {
      try {
        const creatorsRes = await creatorsAPI.getAll()
        setCreators(creatorsRes)

        const user = await authAPI.getCurrentUser()
        setCurrentUser(user)

        if (user.role === 'user') {
          try {
            const req = await creatorRequestsAPI.getMyRequest()
            setMyRequest(req)
          } catch {
            setMyRequest(null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        showToast('error', 'Failed to load creators. Please try again.')
        setCurrentUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleSubmitRequest = async (message: string) => {
    try {
      setRequestLoading(true)
      const res = await creatorRequestsAPI.create(message)
      setMyRequest(res)
      setShowModal(false)
      showToast('success', 'Request submitted successfully!')
    } catch (error) {
      console.error('Failed to submit request:', error)
      showToast('error', 'Failed to submit request. Please try again.')
    } finally {
      setRequestLoading(false)
    }
  }

  const shouldShowCreatorButton =
    currentUser && currentUser.role === 'user' && !myRequest

  const shouldShowPendingStatus =
    currentUser &&
    currentUser.role === 'user' &&
    myRequest?.status === 'pending'

  const shouldShowApprovedBadge =
    currentUser &&
    (currentUser.role === 'creator' || currentUser.role === 'admin')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-20 relative">
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl flex items-center gap-3 min-w-[300px] ${
                toast.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">
              Creator Picks
            </h1>
            <p className="text-gray-400">
              Discover curated recommendations from movie enthusiasts
            </p>
          </div>

          {shouldShowCreatorButton && (
            <motion.button
              onClick={(e) => {
                handleRipple(e, 'become-creator')
                setShowModal(true)
              }}
              disabled={requestLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#14B8A6] text-black px-8 py-3 rounded-lg flex items-center gap-2 font-semibold relative overflow-hidden group"
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
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, transparent 70%)' }} />
              
              <Crown className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <span className="relative z-10">Become a Creator</span>
            </motion.button>
          )}

          {shouldShowPendingStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 backdrop-blur-xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse relative z-10" />
              <span className="text-yellow-400 text-sm relative z-10 font-medium">
                Request pending
              </span>
            </motion.div>
          )}

          {shouldShowApprovedBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 backdrop-blur-xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CheckCircle className="w-4 h-4 text-green-500 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-green-400 text-sm relative z-10 font-medium">
                You are a {currentUser.role}
              </span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, index) => (
            <motion.button
              key={creator.id}
              onClick={(e) => {
                handleRipple(e, `creator-${creator.id}`)
                router.push(`/creator-picks/${creator.username}`)
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg p-6 text-left backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Ripple effect */}
              {ripples[`creator-${creator.id}`]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/10 via-transparent to-[#0D9488]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 30px rgba(20, 184, 166, 0.2)' }} />

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-full bg-[#14B8A6]/10 flex items-center justify-center border border-[#14B8A6]/30 relative overflow-hidden group/avatar"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
                  <span className="text-xl font-bold text-[#14B8A6] relative z-10">
                    {creator.username[0].toUpperCase()}
                  </span>
                </motion.div>
                <div>
                  <p className="text-white font-semibold group-hover:text-[#14B8A6] transition-colors duration-200">
                    {creator.username}
                  </p>
                  <p className="text-gray-400 text-sm">Curator</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#2A2A2A]/50 px-4 py-3 rounded-lg relative z-10 group-hover:bg-[#14B8A6]/10 transition-all duration-200 border border-transparent group-hover:border-[#14B8A6]/30">
                <span className="text-white text-sm font-medium">View Picks</span>
                <ArrowRight className="w-4 h-4 text-[#14B8A6] group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <CreatorRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitRequest}
        isLoading={requestLoading}
      />
    </div>
  )
}