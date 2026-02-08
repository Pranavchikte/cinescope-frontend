'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Loader2, Check, X, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { creatorRequestsAPI, authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface CreatorRequest {
  id: string
  user_id: string
  username: string
  status: string
  message: string
  created_at: string
}

interface ToastMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [allRequests, setAllRequests] = useState<CreatorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState<string>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
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
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [userData, requestsData] = await Promise.all([
          authAPI.getCurrentUser(),
          creatorRequestsAPI.getAll(filter),
        ])

        if (userData.role !== 'admin') {
          router.push('/')
          return
        }

        setCurrentUser(userData)
        setRequests(requestsData)
        setAllRequests(requestsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        showToast('error', 'Failed to load dashboard data. Redirecting...')
        setTimeout(() => router.push('/'), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filter, router])

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await creatorRequestsAPI.approve(requestId)
      setRequests(requests.filter((r) => r.id !== requestId))
      setAllRequests(allRequests.filter((r) => r.id !== requestId))
      showToast('success', 'Request approved successfully!')
    } catch (error) {
      console.error('Failed to approve request:', error)
      showToast('error', 'Failed to approve request. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await creatorRequestsAPI.reject(requestId)
      setRequests(requests.filter((r) => r.id !== requestId))
      setAllRequests(allRequests.filter((r) => r.id !== requestId))
      showToast('success', 'Request rejected successfully!')
    } catch (error) {
      console.error('Failed to reject request:', error)
      showToast('error', 'Failed to reject request. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusCounts = () => {
    return {
      pending: allRequests.filter((r) => r.status === 'pending').length,
      approved: allRequests.filter((r) => r.status === 'approved').length,
      rejected: allRequests.filter((r) => r.status === 'rejected').length,
    }
  }

  const statusCounts = getStatusCounts()

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
          <p className="text-sm text-[#A0A0A0] animate-pulse">Loading dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12 relative">
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

      <div className="px-4 sm:px-6 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center border border-[#14B8A6]/30 backdrop-blur-xl relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Shield className="w-6 h-6 text-[#14B8A6] relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">
                Admin Dashboard
              </h1>
              <p className="text-base text-[#A0A0A0] mt-1">
                Manage creator access requests
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Clock, label: 'Pending', count: statusCounts.pending, color: '#F59E0B', gradient: 'from-[#F59E0B]' },
              { icon: CheckCircle, label: 'Approved', count: statusCounts.approved, color: '#10B981', gradient: 'from-[#10B981]' },
              { icon: XCircle, label: 'Rejected', count: statusCounts.rejected, color: '#EF4444', gradient: 'from-[#EF4444]' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg p-4 backdrop-blur-xl relative overflow-hidden group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r ${stat.gradient} to-transparent`} style={{ filter: 'blur(20px)' }} />
                
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-sm text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors duration-200">{stat.label}</span>
                </div>
                <p className="text-2xl font-semibold text-[#F5F5F5] relative z-10">{stat.count}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2A2A2A] relative"
        >
          {[
            { key: 'pending', icon: Clock, label: 'Pending' },
            { key: 'approved', icon: CheckCircle, label: 'Approved' },
            { key: 'rejected', icon: XCircle, label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={(e) => {
                handleRipple(e, `tab-${tab.key}`)
                setFilter(tab.key)
              }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group ${
                filter === tab.key
                  ? 'border-[#14B8A6] text-[#14B8A6]'
                  : 'border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]'
              }`}
            >
              {/* Ripple effect */}
              {ripples[`tab-${tab.key}`]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              
              {/* Gradient underline on hover */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filter === tab.key ? 'opacity-100' : ''}`} />
              
              <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Requests List */}
        <AnimatePresence mode="wait">
          {requests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-16 h-16 mb-6 flex items-center justify-center bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-full backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Users className="w-8 h-8 text-[#A0A0A0] relative z-10" />
              </motion.div>
              <h2 className="text-xl font-medium text-[#F5F5F5] mb-2">
                No {filter} requests
              </h2>
              <p className="text-[#A0A0A0] text-center max-w-md">
                {filter === 'pending' && 'All creator requests have been processed'}
                {filter === 'approved' && 'No approved requests yet'}
                {filter === 'rejected' && 'No rejected requests yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg p-4 backdrop-blur-xl relative overflow-hidden group transition-all duration-300"
                >
                  {/* Gradient glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 20px rgba(20, 184, 166, 0.1)' }} />
                  
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-10 h-10 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-xl relative overflow-hidden group/avatar"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
                          <span className="text-sm font-semibold text-[#14B8A6] relative z-10">
                            {request.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-[#F5F5F5] truncate group-hover:text-[#14B8A6] transition-colors duration-200">
                            @{request.username}
                          </h3>
                          <p className="text-xs text-[#A0A0A0]">
                            {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-[#0F0F0F]/50 border border-[#2A2A2A] rounded p-3 mb-3 backdrop-blur-xl">
                          <p className="text-sm text-[#A0A0A0] line-clamp-2">
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {request.status === 'pending' && (
                        <>
                          <motion.button
                            onClick={(e) => {
                              handleRipple(e, `approve-${request.id}`)
                              handleApprove(request.id)
                            }}
                            disabled={processingId === request.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-[#10B981] hover:bg-[#10B981]/90 disabled:bg-[#2A2A2A] disabled:text-[#A0A0A0] text-[#0F0F0F] rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative overflow-hidden group/btn"
                          >
                            {/* Ripple effect */}
                            {ripples[`approve-${request.id}`]?.map((ripple) => (
                              <motion.span
                                key={ripple.id}
                                className="absolute bg-white/30 rounded-full"
                                style={{ left: ripple.x, top: ripple.y }}
                                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                                animate={{ width: 100, height: 100, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                              />
                            ))}
                            
                            {/* Gradient glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#059669] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)' }} />
                            
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform duration-200" />
                                <span className="relative z-10">Approve</span>
                              </>
                            )}
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              handleRipple(e, `reject-${request.id}`)
                              handleReject(request.id)
                            }}
                            disabled={processingId === request.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-[#EF4444] hover:bg-[#EF4444]/90 disabled:bg-[#2A2A2A] disabled:text-[#A0A0A0] text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative overflow-hidden group/btn"
                          >
                            {/* Ripple effect */}
                            {ripples[`reject-${request.id}`]?.map((ripple) => (
                              <motion.span
                                key={ripple.id}
                                className="absolute bg-white/30 rounded-full"
                                style={{ left: ripple.x, top: ripple.y }}
                                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                                animate={{ width: 100, height: 100, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                              />
                            ))}
                            
                            {/* Gradient glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#EF4444] to-[#DC2626] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)' }} />
                            
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                            ) : (
                              <>
                                <X className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform duration-200" />
                                <span className="relative z-10">Reject</span>
                              </>
                            )}
                          </motion.button>
                        </>
                      )}

                      {request.status === 'approved' && (
                        <div className="px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-xl">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </div>
                      )}

                      {request.status === 'rejected' && (
                        <div className="px-4 py-2 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-xl">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}