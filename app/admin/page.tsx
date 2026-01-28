"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Loader2, Check, X, Users } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState<string>("pending")
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
      await creatorRequestsAPI.approve(requestId)
      setRequests(requests.filter((r) => r.id !== requestId))
      alert("Creator request approved!")
    } catch (error) {
      alert("Failed to approve request")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await creatorRequestsAPI.reject(requestId)
      setRequests(requests.filter((r) => r.id !== requestId))
      alert("Creator request rejected")
    } catch (error) {
      alert("Failed to reject request")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage creator requests</p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-secondary rounded-lg text-foreground border border-white/10"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Requests */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Requests</h2>
            <p className="text-muted-foreground">No {filter} creator requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/50 border border-white/10 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">@{request.username}</h3>
                    <p className="text-muted-foreground mb-2">{request.message || "No message provided"}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold"
                      >
                        <Check className="w-5 h-5" />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
                      >
                        <X className="w-5 h-5" />
                        Reject
                      </motion.button>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg font-semibold">
                      Approved
                    </span>
                  )}

                  {request.status === "rejected" && (
                    <span className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg font-semibold">
                      Rejected
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}