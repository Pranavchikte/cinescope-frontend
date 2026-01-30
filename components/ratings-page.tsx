"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Loader2, ArrowLeft, SlidersHorizontal, Sparkles, ThumbsUp, Clock, XCircle, Trash2, Edit3 } from "lucide-react"
import { ratingsAPI, moviesAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

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
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    hover: "hover:bg-red-500/20 hover:border-red-500/50",
    glow: "shadow-red-500/20",
  },
  timepass: {
    label: "Timepass",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    hover: "hover:bg-amber-500/20 hover:border-amber-500/50",
    glow: "shadow-amber-500/20",
  },
  go_for_it: {
    label: "Go For It",
    icon: ThumbsUp,
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    hover: "hover:bg-green-500/20 hover:border-green-500/50",
    glow: "shadow-green-500/20",
  },
  perfection: {
    label: "Perfection",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
    hover: "hover:bg-violet-500/20 hover:border-violet-500/50",
    glow: "shadow-violet-500/20",
  },
}

export function RatingsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [ratings, setRatings] = useState<EnrichedRatingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
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

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    if (sortBy === "recent") {
      return b.tmdb_id - a.tmdb_id
    }
    return a.tmdb_id - b.tmdb_id
  })

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

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="mb-8">
            <div className="h-10 bg-neutral-800 rounded-lg w-48 mb-6 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-neutral-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-neutral-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center max-w-md"
        >
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 inline-flex">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-neutral-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-neutral-50 mb-2 tracking-tight">
                My Ratings
              </h1>
              <p className="text-sm md:text-base text-neutral-400">
                {ratings.length} {ratings.length === 1 ? "rating" : "ratings"} in your collection
              </p>
            </div>
            <button
              onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-700 text-neutral-300 rounded-xl transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">
                {sortBy === "recent" ? "Recent First" : "Oldest First"}
              </span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {Object.entries(RATING_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              const count = stats[key as keyof typeof stats]
              const isActive = filter === key

              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setFilter(key)}
                  className={`relative p-4 md:p-6 rounded-xl border transition-all group ${
                    isActive
                      ? `${config.bg} ${config.border} ${config.text}`
                      : "bg-neutral-900/30 border-neutral-800/50 text-neutral-500 hover:border-neutral-700/50 hover:bg-neutral-900/50"
                  }`}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} opacity-0 ${isActive ? "opacity-5" : "group-hover:opacity-5"} transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-5 h-5 ${isActive ? config.text : "text-neutral-600"}`} />
                      <span className={`text-2xl md:text-3xl font-bold ${isActive ? config.text : "text-neutral-400"}`}>
                        {count}
                      </span>
                    </div>
                    <div className={`text-xs md:text-sm font-medium ${isActive ? config.text : "text-neutral-500"}`}>
                      {config.label}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                  : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
              }`}
            >
              All Ratings ({ratings.length})
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        {sortedRatings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl mb-6">
              <Star className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-300 mb-2">
              {filter === "all"
                ? "You haven't rated anything yet"
                : `No ${RATING_CONFIG[filter as keyof typeof RATING_CONFIG].label} ratings`}
            </h2>
            <p className="text-sm md:text-base text-neutral-500 text-center max-w-md mb-8">
              {filter === "all"
                ? "Start rating movies and TV shows to build your personal library"
                : "Try selecting a different rating filter or browse more content"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
            >
              Browse Movies
            </button>
          </motion.div>
        ) : (
          /* Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {sortedRatings.map((movie, index) => (
              <RatedMovieCard
                key={movie.id}
                movie={movie}
                onRemove={() => removeRating(movie.id)}
                onUpdate={(newRating) => updateRating(movie.id, newRating)}
                isEditing={editingId === movie.id}
                onEditToggle={() => setEditingId(editingId === movie.id ? null : movie.id)}
                delay={index * 0.02}
              />
            ))}
          </motion.div>
        )}
      </div>
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
  const [showActions, setShowActions] = useState(false)
  const config = RATING_CONFIG[movie.rating]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative group"
    >
      {/* Card */}
      <Link href={`/${movie.mediaType}/${movie.tmdb_id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all bg-neutral-900 group-hover:shadow-2xl group-hover:shadow-black/50">
          {/* Image */}
          <div className="absolute inset-0">
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </div>

          {/* Rating Badge */}
          <div className={`absolute top-3 right-3 backdrop-blur-xl ${config.bg} ${config.border} border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg ${config.glow}`}>
            <Icon className={`w-3.5 h-3.5 ${config.text}`} />
            <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 drop-shadow-lg">
              {movie.title}
            </h3>
            <p className="text-xs text-neutral-300 drop-shadow">{movie.year}</p>
          </div>
        </div>
      </Link>

      {/* Mobile: Action Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setShowActions(true)
        }}
        className="md:hidden absolute top-3 left-3 w-9 h-9 bg-black/80 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/10 hover:bg-black/90 transition-colors"
      >
        <Edit3 className="w-4 h-4 text-white" />
      </button>

      {/* Desktop: Hover Overlay */}
      <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl items-end justify-center p-4 gap-2">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEditToggle()
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-white text-neutral-900 rounded-lg text-sm font-semibold transition-all shadow-lg"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            onRemove()
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove</span>
        </button>
      </div>

      {/* Mobile Action Sheet */}
      <Sheet open={showActions} onOpenChange={setShowActions}>
        <SheetContent
          side="bottom"
          className="bg-neutral-900/95 backdrop-blur-xl border-neutral-800 rounded-t-2xl"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-neutral-100">Manage Rating</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            <p className="text-sm text-neutral-400 mb-4">Change rating for "{movie.title}"</p>
            {ratingOptions.map((option) => {
              const optionConfig = RATING_CONFIG[option]
              const OptionIcon = optionConfig.icon
              const isSelected = movie.rating === option

              return (
                <button
                  key={option}
                  onClick={() => {
                    onUpdate(option)
                    setShowActions(false)
                  }}
                  className={`w-full px-4 py-3.5 text-left rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? `${optionConfig.bg} ${optionConfig.border} ${optionConfig.text}`
                      : "bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <OptionIcon className={`w-5 h-5 ${isSelected ? optionConfig.text : "text-neutral-500"}`} />
                  <span className="font-medium">{optionConfig.label}</span>
                </button>
              )
            })}
            <button
              onClick={() => {
                onRemove()
                setShowActions(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold transition-all mt-4"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove from Ratings</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Edit Dropdown */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block absolute top-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-xl overflow-hidden z-20 shadow-2xl"
          >
            {ratingOptions.map((option) => {
              const optionConfig = RATING_CONFIG[option]
              const OptionIcon = optionConfig.icon

              return (
                <button
                  key={option}
                  onClick={() => onUpdate(option)}
                  className="w-full px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors text-left flex items-center gap-2.5"
                >
                  <OptionIcon className={`w-4 h-4 ${optionConfig.text}`} />
                  <span>{optionConfig.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}