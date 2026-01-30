"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2, Star, Film, Tv, Sparkles, ThumbsUp, Clock, Ban } from "lucide-react"
import { creatorsAPI, moviesAPI, tvAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { MovieCard } from "@/components/movie-card"

interface Rating {
  id: string
  tmdb_id: number
  media_type: string
  rating: string
  rated_at: string
}

interface MovieData {
  id: number
  title: string
  rating: number
  poster: string
  year: number
}

const RATING_CONFIG = {
  perfection: {
    label: "Perfection",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    icon: Sparkles,
  },
  go_for_it: {
    label: "Go For It",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: ThumbsUp,
  },
  timepass: {
    label: "Timepass",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: Clock,
  },
  skip: {
    label: "Skip",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: Ban,
  },
}

export default function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>("")
  const [ratings, setRatings] = useState<Rating[]>([])
  const [moviesData, setMoviesData] = useState<{ [key: number]: MovieData }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    params.then((p) => setUsername(p.username))
  }, [params])

  useEffect(() => {
    if (!username) return

    const fetchRatings = async () => {
      try {
        setIsLoading(true)
        const ratingFilter = selectedRating !== "all" ? selectedRating : undefined
        const mediaFilter = selectedMediaType !== "all" ? selectedMediaType : undefined
        const data = await creatorsAPI.getRatings(username, ratingFilter, mediaFilter)
        setRatings(data)

        // Fetch movie/TV details for each rating
        const details: { [key: number]: MovieData } = {}
        for (const rating of data.slice(0, 50)) {
          try {
            let itemData
            if (rating.media_type === "movie") {
              itemData = await moviesAPI.getDetails(rating.tmdb_id)
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.title,
                rating: itemData.vote_average,
                poster: itemData.poster_path ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}` : "",
                year: itemData.release_date ? new Date(itemData.release_date).getFullYear() : 2024,
              }
            } else {
              itemData = await tvAPI.getDetails(rating.tmdb_id)
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.name,
                rating: itemData.vote_average,
                poster: itemData.poster_path ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}` : "",
                year: itemData.first_air_date ? new Date(itemData.first_air_date).getFullYear() : 2024,
              }
            }
          } catch (err) {
            console.error(`Failed to fetch details for ${rating.tmdb_id}`)
          }
        }
        setMoviesData(details)
      } catch (error) {
        console.error("Failed to fetch ratings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatings()
  }, [username, selectedRating, selectedMediaType])

  const groupedRatings = {
    perfection: ratings.filter((r) => r.rating === "perfection"),
    go_for_it: ratings.filter((r) => r.rating === "go_for_it"),
    timepass: ratings.filter((r) => r.rating === "timepass"),
    skip: ratings.filter((r) => r.rating === "skip"),
  }

  const totalRatings = ratings.length
  const movieCount = ratings.filter((r) => r.media_type === "movie").length
  const tvCount = ratings.filter((r) => r.media_type === "tv").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
          <p className="text-sm text-neutral-500">Loading creator profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/creator-picks")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Creators</span>
        </motion.button>

        {/* Creator Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 md:mb-12"
        >
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-3xl md:text-4xl font-bold text-neutral-200">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-2 tracking-tight">
                  @{username}
                </h1>
                <p className="text-neutral-400 text-sm md:text-base mb-4">
                  Curated movie and TV show recommendations
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/30 rounded-lg">
                    <Star className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-300">
                      {totalRatings} {totalRatings === 1 ? "Rating" : "Ratings"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/30 rounded-lg">
                    <Film className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-300">
                      {movieCount} {movieCount === 1 ? "Movie" : "Movies"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/30 rounded-lg">
                    <Tv className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-300">
                      {tvCount} {tvCount === 1 ? "Show" : "Shows"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Filter by Rating</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRating("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedRating === "all"
                    ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                    : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                }`}
              >
                All Ratings
              </button>
              {Object.entries(RATING_CONFIG).map(([key, config]) => {
                const Icon = config.icon
                const count = groupedRatings[key as keyof typeof groupedRatings].length
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRating(key)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedRating === key
                        ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                        : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        selectedRating === key ? "bg-black/20" : "bg-neutral-800"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Media Type Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Filter by Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMediaType("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedMediaType === "all"
                    ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                    : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setSelectedMediaType("movie")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedMediaType === "movie"
                    ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                    : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movies</span>
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    selectedMediaType === "movie" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}
                >
                  {movieCount}
                </span>
              </button>
              <button
                onClick={() => setSelectedMediaType("tv")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedMediaType === "tv"
                    ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                    : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TV Shows</span>
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    selectedMediaType === "tv" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}
                >
                  {tvCount}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {ratings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 md:py-24"
            >
              <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl mb-6">
                <Star className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-neutral-300 mb-2">
                No ratings found
              </h2>
              <p className="text-sm md:text-base text-neutral-500 text-center max-w-md">
                {selectedRating !== "all" || selectedMediaType !== "all"
                  ? "Try adjusting your filters to see more content"
                  : "This creator hasn't rated any content yet"}
              </p>
            </motion.div>
          ) : selectedRating === "all" ? (
            /* Grouped by Rating */
            <motion.div
              key="grouped"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {Object.entries(groupedRatings).map(([ratingType, items], sectionIndex) => {
                if (items.length === 0) return null
                const config = RATING_CONFIG[ratingType as keyof typeof RATING_CONFIG]
                const Icon = config.icon
                return (
                  <motion.section
                    key={ratingType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <h2 className={`text-xl md:text-2xl font-semibold ${config.color}`}>
                        {config.label}
                      </h2>
                      <span className={`px-2.5 py-1 text-sm font-medium ${config.bgColor} ${config.color} rounded-full border ${config.borderColor}`}>
                        {items.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {items.map((rating, index) => {
                        const movieData = moviesData[rating.tmdb_id]
                        if (!movieData) return null
                        return (
                          <motion.div
                            key={rating.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                          >
                            <MovieCard movie={movieData} mediaType={rating.media_type as "movie" | "tv"} />
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.section>
                )
              })}
            </motion.div>
          ) : (
            /* Filtered View */
            <motion.div
              key="filtered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {ratings.map((rating, index) => {
                const movieData = moviesData[rating.tmdb_id]
                if (!movieData) return null
                return (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <MovieCard movie={movieData} mediaType={rating.media_type as "movie" | "tv"} />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}