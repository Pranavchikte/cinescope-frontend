"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Loader2, Check, X, Users, Clock, CheckCircle, XCircle, Filter } from "lucide-react"
import { creatorRequestsAPI, authAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface CreatorRequest {
  id: string
  user_id: string
  username: string
  status: string
  message: string
  created_at: string
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [allRequests, setAllRequests] = useState<CreatorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState<string>("pending")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [userData, requestsData] = await Promise.all([
          authAPI.getCurrentUser(),
          creatorRequestsAPI.getAll(filter),
        ])

        if (userData.role !== "admin") {
          router.push("/")
          return
        }

        setCurrentUser(userData)
        setRequests(requestsData)
        setAllRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        router.push("/")
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
    } catch (error) {
      console.error("Failed to approve request:", error)
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
    } catch (error) {
      console.error("Failed to reject request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusCounts = () => {
    return {
      pending: allRequests.filter((r) => r.status === "pending").length,
      approved: allRequests.filter((r) => r.status === "approved").length,
      rejected: allRequests.filter((r) => r.status === "rejected").length,
    }
  }

  const statusCounts = getStatusCounts()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-neutral-300" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-neutral-50 tracking-tight">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-sm md:text-base text-neutral-400">
                Manage creator access requests and permissions
              </p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-neutral-200">
                    {currentUser.username?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-200">{currentUser.username}</p>
                  <p className="text-xs text-neutral-500">Administrator</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Pending</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-100">{statusCounts.pending}</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Approved</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-100">{statusCounts.approved}</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Rejected</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-neutral-100">{statusCounts.rejected}</p>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-1 backdrop-blur-sm inline-flex w-full md:w-auto">
            <button
              onClick={() => setFilter("pending")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                filter === "pending"
                  ? "bg-neutral-800 text-neutral-100 shadow-lg"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">Pending</span>
              </span>
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                filter === "approved"
                  ? "bg-neutral-800 text-neutral-100 shadow-lg"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Approved</span>
                <span className="sm:hidden">Approved</span>
              </span>
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                filter === "rejected"
                  ? "bg-neutral-800 text-neutral-100 shadow-lg"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Rejected</span>
                <span className="sm:hidden">Rejected</span>
              </span>
            </button>
          </div>
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
              className="flex flex-col items-center justify-center py-16 md:py-24"
            >
              <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl mb-6">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-neutral-300 mb-2">
                No {filter} requests
              </h2>
              <p className="text-sm md:text-base text-neutral-500 text-center max-w-md">
                {filter === "pending" && "All creator requests have been processed"}
                {filter === "approved" && "No creator requests have been approved yet"}
                {filter === "rejected" && "No creator requests have been rejected yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm hover:border-neutral-700/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-neutral-200">
                            {request.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-neutral-100 mb-1 truncate">
                            @{request.username}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            Requested on {new Date(request.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3 mb-3">
                          <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3">
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions / Status */}
                    <div className="flex md:flex-col gap-2 shrink-0">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed min-w-[120px]"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed min-w-[120px]"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {request.status === "approved" && (
                        <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[120px]">
                          <CheckCircle className="w-4 h-4" />
                          <span>Approved</span>
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[120px]">
                          <XCircle className="w-4 h-4" />
                          <span>Rejected</span>
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