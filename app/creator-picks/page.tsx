"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Loader2 } from "lucide-react"
import { creatorsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Creator {
  id: string
  username: string
  is_public_profile: boolean
}

export default function CreatorPicksPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const data = await creatorsAPI.getAll()
        setCreators(data)
      } catch (error) {
        console.error("Failed to fetch creators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreators()
  }, [])

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Creator Picks</h1>
          <p className="text-muted-foreground">
            Browse movie recommendations from our curated creators
          </p>
        </div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Creators Yet</h2>
            <p className="text-muted-foreground">Check back later for curator recommendations!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/creator-picks/${creator.username}`)}
                className="bg-secondary/50 border border-white/10 rounded-lg p-6 cursor-pointer hover:bg-secondary/70 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">@{creator.username}</h3>
                    <p className="text-sm text-muted-foreground">View Picks</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}