"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Loader2, Star, Film, Tv, ArrowRight } from "lucide-react"
import { creatorsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Creator {
  id: string
  username: string
  is_public_profile: boolean
}

function CreatorCardSkeleton() {
  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 backdrop-blur-sm animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-neutral-800 rounded-2xl" />
        <div className="flex-1">
          <div className="h-5 bg-neutral-800 rounded w-32 mb-2" />
          <div className="h-4 bg-neutral-800 rounded w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-neutral-800 rounded-lg flex-1" />
        <div className="h-8 bg-neutral-800 rounded-lg flex-1" />
      </div>
    </div>
  )
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
      <div className="min-h-screen bg-neutral-950">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="mb-8 md:mb-12">
            <div className="h-10 md:h-12 bg-neutral-800 rounded-lg w-64 mb-3 animate-pulse" />
            <div className="h-5 bg-neutral-800 rounded w-96 max-w-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-neutral-50 mb-2 md:mb-3 tracking-tight">
                Creator Picks
              </h1>
              <p className="text-sm md:text-base text-neutral-400">
                Discover curated movie and TV show recommendations from trusted creators
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 md:p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="p-3 bg-neutral-800/50 rounded-xl shrink-0">
                <Users className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-neutral-200 mb-1">
                  Curated Content from Experts
                </h2>
                <p className="text-sm text-neutral-500">
                  Browse personalized recommendations from our community of movie enthusiasts and critics
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl mb-6">
              <Users className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-300 mb-2">
              No Creators Yet
            </h2>
            <p className="text-sm md:text-base text-neutral-500 text-center max-w-md">
              We're building our community of curators. Check back soon for expert recommendations!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => router.push(`/creator-picks/${creator.username}`)}
                className="group bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 backdrop-blur-sm cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all"
              >
                {/* Creator Info */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-2xl font-bold text-neutral-200">
                      {creator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-100 mb-0.5 truncate group-hover:text-white transition-colors">
                      @{creator.username}
                    </h3>
                    <p className="text-sm text-neutral-500">Content Creator</p>
                  </div>
                </div>

                {/* Stats - Placeholder for future enhancement */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/50 border border-neutral-700/30 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-400">Curator</span>
                  </div>
                  {creator.is_public_profile && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium text-green-500">Active</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
                    View Recommendations
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Future Enhancement Notice */}
        {creators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-neutral-500">
              More creators coming soon • Want to become a curator?{" "}
              <button className="text-neutral-300 hover:text-neutral-100 underline underline-offset-2 transition-colors">
                Apply here
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}