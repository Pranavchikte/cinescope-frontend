"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Loader2, Check, X, Users, Clock, CheckCircle, XCircle } from "lucide-react"
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
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#808080] animate-spin" />
          <p className="text-sm text-[#b3b3b3]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-12">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] rounded flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#e5e5e5]">
                Admin Dashboard
              </h1>
              <p className="text-base text-[#b3b3b3] mt-1">
                Manage creator access requests
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-sm text-[#b3b3b3]">Pending</span>
              </div>
              <p className="text-2xl font-semibold text-[#e5e5e5]">{statusCounts.pending}</p>
            </div>

            <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm text-[#b3b3b3]">Approved</span>
              </div>
              <p className="text-2xl font-semibold text-[#e5e5e5]">{statusCounts.approved}</p>
            </div>

            <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-[#ef4444]" />
                <span className="text-sm text-[#b3b3b3]">Rejected</span>
              </div>
              <p className="text-2xl font-semibold text-[#e5e5e5]">{statusCounts.rejected}</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2a2a2a]"
        >
          <button
            onClick={() => setFilter("pending")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              filter === "pending"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              filter === "approved"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              filter === "rejected"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected
          </button>
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
              <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#2a2a2a] rounded-full">
                <Users className="w-8 h-8 text-[#808080]" />
              </div>
              <h2 className="text-xl font-medium text-[#e5e5e5] mb-2">
                No {filter} requests
              </h2>
              <p className="text-[#b3b3b3] text-center max-w-md">
                {filter === "pending" && "All creator requests have been processed"}
                {filter === "approved" && "No approved requests yet"}
                {filter === "rejected" && "No rejected requests yet"}
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
                  className="bg-[#181818] border border-[#2a2a2a] rounded p-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {request.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-[#e5e5e5] truncate">
                            @{request.username}
                          </h3>
                          <p className="text-xs text-[#808080]">
                            {new Date(request.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-3 mb-3">
                          <p className="text-sm text-[#b3b3b3] line-clamp-2">
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#2a2a2a] disabled:text-[#808080] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#2a2a2a] disabled:text-[#808080] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                Reject
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {request.status === "approved" && (
                        <div className="px-4 py-2 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] rounded text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <div className="px-4 py-2 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded text-sm font-medium flex items-center gap-2">
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