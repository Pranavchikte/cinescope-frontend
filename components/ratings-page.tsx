"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronDown, X, Loader2 } from "lucide-react"
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
  id: string // Backend rating ID
  tmdb_id: number
  title: string
  poster: string
  rating: "skip" | "timepass" | "go_for_it" | "perfection"
  year: number
}

const RATING_LABELS = {
  skip: "Skip",
  timepass: "Timepass",
  go_for_it: "Go for it",
  perfection: "Perfection",
}

const RATING_COLORS = {
  skip: "bg-red-500/20 text-red-400 border-red-500/50",
  timepass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  go_for_it: "bg-green-500/20 text-green-400 border-green-500/50",
  perfection: "bg-primary/30 text-primary border-primary/50",
}

export function RatingsPage() {
  const [filter, setFilter] = useState("all")
  const [ratings, setRatings] = useState<EnrichedRatingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  const filters = ["all", "skip", "timepass", "go_for_it", "perfection"]

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user's ratings from backend
        const ratingsData: RatingItem[] = await ratingsAPI.get()

        if (!ratingsData || ratingsData.length === 0) {
          setRatings([])
          setIsLoading(false)
          return
        }

        // Fetch TMDB details for each rating
        const enrichedItems = await Promise.all(
          ratingsData.map(async (item) => {
            try {
              const tmdbData = await moviesAPI.getDetails(item.tmdb_id)
              return {
                id: item.id, // Backend rating ID (UUID)
                tmdb_id: item.tmdb_id,
                title: tmdbData.title || tmdbData.name,
                poster: tmdbData.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` 
                  : "",
                rating: item.rating,
                year: tmdbData.release_date 
                  ? new Date(tmdbData.release_date).getFullYear() 
                  : 2024,
              }
            } catch (err) {
              console.error(`Failed to fetch details for tmdb_id ${item.tmdb_id}:`, err)
              return null
            }
          })
        )

        // Filter out any failed fetches
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

  const filteredRatings = filter === "all" ? ratings : ratings.filter((r) => r.rating === filter)

  const isEmpty = filteredRatings.length === 0

  const updateRating = async (ratingId: string, newRating: string) => {
    try {
      await ratingsAPI.update(ratingId, newRating)
      setRatings(ratings.map(r => 
        r.id === ratingId 
          ? { ...r, rating: newRating as "skip" | "timepass" | "go_for_it" | "perfection" } 
          : r
      ))
      setEditingId(null)
    } catch (err) {
      console.error("Failed to update rating:", err)
      alert("Failed to update rating. Please try again.")
    }
  }

  const removeRating = async (ratingId: string) => {
    try {
      await ratingsAPI.delete(ratingId)
      setRatings(ratings.filter((r) => r.id !== ratingId))
    } catch (err) {
      console.error("Failed to delete rating:", err)
      alert("Failed to delete rating. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Go Home
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-8">My Ratings</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Skip" count={stats.skip} color="bg-red-500/20 border-red-500/50" />
          <StatCard label="Timepass" count={stats.timepass} color="bg-yellow-500/20 border-yellow-500/50" />
          <StatCard label="Go for it" count={stats.go_for_it} color="bg-green-500/20 border-green-500/50" />
          <StatCard label="Perfection" count={stats.perfection} color="bg-primary/30 border-primary/50" />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 flex-wrap">
          {filters.map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "bg-secondary/50 text-foreground border border-white/10 hover:border-white/20"
              }`}
            >
              {f === "go_for_it" ? "Go for it" : f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {isEmpty ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-32 h-32 mb-6 rounded-full glass-dark flex items-center justify-center">
            <Star className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {filter === "all" ? "You haven't rated anything yet" : `No ${RATING_LABELS[filter as keyof typeof RATING_LABELS]} ratings`}
          </h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Start rating movies and TV shows to build your personal library
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Browse Movies
          </motion.button>
        </motion.div>
      ) : (
        /* Grid Layout */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredRatings.map((movie, index) => (
            <RatedMovieCard
              key={movie.id}
              movie={movie}
              onRemove={() => removeRating(movie.id)}
              onUpdate={(newRating) => updateRating(movie.id, newRating)}
              isEditing={editingId === movie.id}
              onEditToggle={() => setEditingId(editingId === movie.id ? null : movie.id)}
              delay={index * 0.05}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} border rounded-lg p-4 text-center`}
    >
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm opacity-80">{label}</div>
    </motion.div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative group"
    >
      {/* Card Container */}
      <Link href={`/movie/${movie.tmdb_id}`}>
        <div className="relative rounded-lg overflow-hidden glass-dark h-72 cursor-pointer">
          {/* Poster */}
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all"
          />

          {/* Rating Badge */}
          <div
            className={`absolute top-3 right-3 ${RATING_COLORS[movie.rating]} border rounded-lg px-2 py-1 text-xs font-bold`}
          >
            {RATING_LABELS[movie.rating]}
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 glass-dark p-3">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">{movie.title}</h3>
            <p className="text-xs text-muted-foreground">{movie.year}</p>
          </div>
        </div>
      </Link>

      {/* Hover Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditToggle}
            className="p-3 bg-primary/90 hover:bg-primary rounded-full transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-primary-foreground" />
          </motion.button>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-secondary border border-white/10 rounded-lg overflow-hidden z-20 min-w-max"
              >
                {ratingOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => onUpdate(option)}
                    className="block w-full px-4 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors text-center"
                  >
                    {RATING_LABELS[option]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRemove}
          className="p-3 bg-destructive/90 hover:bg-destructive rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}