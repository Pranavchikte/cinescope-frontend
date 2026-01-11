"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Loader2, Bookmark } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { watchlistAPI, moviesAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface WatchlistItem {
  id: string
  tmdb_id: number
  media_type: string
  added_at: string
}

interface EnrichedWatchlistItem {
  id: string // Backend watchlist ID
  tmdb_id: number
  title: string
  rating: number
  poster: string
  year: number
}

export function WatchlistPage() {
  const [filter, setFilter] = useState("all")
  const [watchlist, setWatchlist] = useState<EnrichedWatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const filters = ["all", "movies", "tv-shows"]

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user's watchlist from backend
        const watchlistData: WatchlistItem[] = await watchlistAPI.get()

        if (!watchlistData || watchlistData.length === 0) {
          setWatchlist([])
          setIsLoading(false)
          return
        }

        // Fetch TMDB details for each item
        const enrichedItems = await Promise.all(
          watchlistData.map(async (item) => {
            try {
              const tmdbData = await moviesAPI.getDetails(item.tmdb_id)
              return {
                id: item.id, // Backend watchlist ID (UUID)
                tmdb_id: item.tmdb_id,
                title: tmdbData.title || tmdbData.name,
                rating: tmdbData.vote_average || 0,
                poster: tmdbData.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` 
                  : "",
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
        const validItems = enrichedItems.filter((item): item is EnrichedWatchlistItem => item !== null)
        setWatchlist(validItems)

      } catch (err) {
        console.error("Failed to fetch watchlist:", err)
        setError("Failed to load watchlist. Please login or try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWatchlist()
  }, [])

  const removeFromWatchlist = async (watchlistId: string) => {
    try {
      await watchlistAPI.remove(watchlistId)
      setWatchlist(watchlist.filter((item) => item.id !== watchlistId))
    } catch (err) {
      console.error("Failed to remove from watchlist:", err)
      alert("Failed to remove from watchlist. Please try again.")
    }
  }

  const filteredWatchlist = filter === "all" 
    ? watchlist 
    : filter === "movies" 
      ? watchlist 
      : []

  const isEmpty = filteredWatchlist.length === 0

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
        <h1 className="text-4xl font-bold text-foreground mb-6">My Watchlist</h1>

        {/* Filter Chips */}
        <div className="flex gap-3 flex-wrap">
          {filters.map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "bg-secondary/50 text-foreground border border-white/10 hover:border-white/20"
              }`}
            >
              {f === "tv-shows" ? "TV Shows" : f.charAt(0).toUpperCase() + f.slice(1)}
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
            <Bookmark className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Start adding movies and TV shows to keep track of what you want to watch
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
          {filteredWatchlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <MovieCard movie={{
                id: item.tmdb_id,
                title: item.title,
                rating: item.rating,
                poster: item.poster,
                year: item.year,
              }} />

              {/* Remove Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 left-2 p-2 bg-destructive/90 hover:bg-destructive text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}