"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Loader2, Sparkles, ThumbsUp, Clock, XCircle, Trash2, Edit3 } from "lucide-react"
import { ratingsAPI, moviesAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface RatingItem {
  id: string
  user_id: string
  tmdb_id: number
  media_type: string
  rating: "skip" | "timepass" | "go_for_it" | "perfection"
  rated_at: string
}

interface EnrichedRatingItem {
  id: string
  tmdb_id: number
  title: string
  poster: string
  rating: "skip" | "timepass" | "go_for_it" | "perfection"
  year: number
  mediaType: string
}

const RATING_CONFIG = {
  skip: {
    label: "Skip",
    icon: XCircle,
    color: "#ef4444",
  },
  timepass: {
    label: "Timepass",
    icon: Clock,
    color: "#f59e0b",
  },
  go_for_it: {
    label: "Go For It",
    icon: ThumbsUp,
    color: "#10b981",
  },
  perfection: {
    label: "Perfection",
    icon: Sparkles,
    color: "#8b5cf6",
  },
}

export function RatingsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [ratings, setRatings] = useState<EnrichedRatingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const ratingsData: RatingItem[] = await ratingsAPI.get()

        if (!ratingsData || ratingsData.length === 0) {
          setRatings([])
          setIsLoading(false)
          return
        }

        const enrichedItems = await Promise.all(
          ratingsData.map(async (item) => {
            try {
              const tmdbData = await moviesAPI.getDetails(item.tmdb_id)
              return {
                id: item.id,
                tmdb_id: item.tmdb_id,
                title: tmdbData.title || tmdbData.name,
                poster: tmdbData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                  : "",
                rating: item.rating,
                year: tmdbData.release_date
                  ? new Date(tmdbData.release_date).getFullYear()
                  : 2024,
                mediaType: item.media_type,
              }
            } catch (err) {
              console.error(`Failed to fetch details for tmdb_id ${item.tmdb_id}:`, err)
              return null
            }
          })
        )

        const validItems = enrichedItems.filter((item): item is EnrichedRatingItem => item !== null)
        setRatings(validItems)
      } catch (err) {
        console.error("Failed to fetch ratings:", err)
        setError("Failed to load ratings. Please login or try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatings()
  }, [])

  const stats = {
    skip: ratings.filter((r) => r.rating === "skip").length,
    timepass: ratings.filter((r) => r.rating === "timepass").length,
    go_for_it: ratings.filter((r) => r.rating === "go_for_it").length,
    perfection: ratings.filter((r) => r.rating === "perfection").length,
  }

  const filteredRatings =
    filter === "all" ? ratings : ratings.filter((r) => r.rating === filter)

  const updateRating = async (ratingId: string, newRating: string) => {
    try {
      await ratingsAPI.update(ratingId, newRating)
      setRatings(
        ratings.map((r) =>
          r.id === ratingId
            ? { ...r, rating: newRating as "skip" | "timepass" | "go_for_it" | "perfection" }
            : r
        )
      )
      setEditingId(null)
    } catch (err) {
      console.error("Failed to update rating:", err)
    }
  }

  const removeRating = async (ratingId: string) => {
    try {
      await ratingsAPI.delete(ratingId)
      setRatings(ratings.filter((r) => r.id !== ratingId))
    } catch (err) {
      console.error("Failed to delete rating:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-24">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="h-8 bg-[#2a2a2a] rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#2a2a2a] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#2a2a2a] rounded-full">
            <XCircle className="w-8 h-8 text-[#b3b3b3]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#e5e5e5] mb-3">
            Something went wrong
          </h2>
          <p className="text-[#b3b3b3] mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-[#e5e5e5] transition-colors"
          >
            Go Home
          </button>
        </motion.div>
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
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#e5e5e5] mb-2">
            My Ratings
          </h1>
          <p className="text-base text-[#b3b3b3]">
            {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2a2a2a] overflow-x-auto hide-scrollbar"
        >
          <button
            onClick={() => setFilter("all")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === "all"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            All ({ratings.length})
          </button>
          {Object.entries(RATING_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const count = stats[key as keyof typeof stats]
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  filter === key
                    ? "border-[#e5e5e5] text-[#e5e5e5]"
                    : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: filter === key ? config.color : undefined }} />
                <span>{config.label} ({count})</span>
              </button>
            )
          })}
        </motion.div>

        {/* Content Grid */}
        {filteredRatings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#2a2a2a] rounded-full">
              <Star className="w-8 h-8 text-[#808080]" />
            </div>
            <h2 className="text-xl font-medium text-[#e5e5e5] mb-2">
              {filter === "all"
                ? "No ratings yet"
                : `No ${RATING_CONFIG[filter as keyof typeof RATING_CONFIG].label} ratings`}
            </h2>
            <p className="text-[#b3b3b3] text-center max-w-md mb-8">
              {filter === "all"
                ? "Start rating titles to see them here"
                : "Try selecting a different rating filter"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              Browse Titles
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredRatings.map((movie, index) => (
                <RatedMovieCard
                  key={movie.id}
                  movie={movie}
                  onRemove={() => removeRating(movie.id)}
                  onUpdate={(newRating) => updateRating(movie.id, newRating)}
                  isEditing={editingId === movie.id}
                  onEditToggle={() => setEditingId(editingId === movie.id ? null : movie.id)}
                  delay={index * 0.03}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

function RatedMovieCard({
  movie,
  onRemove,
  onUpdate,
  isEditing,
  onEditToggle,
  delay,
}: {
  movie: EnrichedRatingItem
  onRemove: () => void
  onUpdate: (newRating: string) => void
  isEditing: boolean
  onEditToggle: () => void
  delay: number
}) {
  const ratingOptions = ["skip", "timepass", "go_for_it", "perfection"] as const
  const [isHovered, setIsHovered] = useState(false)
  const config = RATING_CONFIG[movie.rating]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay, duration: 0.3 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        // setEditingId(null)
      }}
    >
      <Link href={`/${movie.mediaType}/${movie.tmdb_id}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative aspect-[2/3] rounded overflow-hidden bg-[#2a2a2a] cursor-pointer"
        >
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Star className="w-12 h-12 text-[#404040]" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Rating Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/80 backdrop-blur-sm rounded">
            <Icon className="w-3 h-3" style={{ color: config.color }} />
            <span className="text-xs font-medium text-white">{config.label}</span>
          </div>

          {/* Title Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
              {movie.title}
            </h3>
            <p className="text-xs text-[#b3b3b3]">{movie.year}</p>
          </div>
        </motion.div>
      </Link>

      {/* Desktop: Action Buttons on Hover */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="hidden md:flex absolute -bottom-12 left-0 right-0 justify-center gap-2 z-20"
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                onEditToggle()
              }}
              className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                if (window.confirm(`Remove "${movie.title}" from your ratings?`)) {
                  onRemove()
                }
              }}
              className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Edit Dropdown */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="hidden md:block absolute top-0 left-0 right-0 bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden z-30 shadow-2xl"
          >
            {ratingOptions.map((option) => {
              const optionConfig = RATING_CONFIG[option]
              const OptionIcon = optionConfig.icon

              return (
                <button
                  key={option}
                  onClick={(e) => {
                    e.preventDefault()
                    onUpdate(option)
                  }}
                  className="w-full px-3 py-2.5 text-sm text-[#e5e5e5] hover:bg-[#2a2a2a] transition-colors text-left flex items-center gap-2"
                >
                  <OptionIcon className="w-4 h-4" style={{ color: optionConfig.color }} />
                  <span>{optionConfig.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Edit Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          const newRating = prompt(
            `Current rating: ${config.label}\n\nSelect new rating:\n1 - Skip\n2 - Timepass\n3 - Go For It\n4 - Perfection\n\nOr press Cancel to delete`
          )
          if (newRating === null) {
            if (window.confirm(`Remove "${movie.title}" from your ratings?`)) {
              onRemove()
            }
          } else if (newRating === "1") {
            onUpdate("skip")
          } else if (newRating === "2") {
            onUpdate("timepass")
          } else if (newRating === "3") {
            onUpdate("go_for_it")
          } else if (newRating === "4") {
            onUpdate("perfection")
          }
        }}
        className="md:hidden absolute top-2 right-2 z-10 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}