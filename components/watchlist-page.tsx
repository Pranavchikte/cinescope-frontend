"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Bookmark, ArrowLeft, X, Film, Tv } from "lucide-react"
import { watchlistAPI, moviesAPI, tvAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface WatchlistItem {
  id: string
  tmdb_id: number
  media_type: string
  added_at: string
}

interface EnrichedWatchlistItem {
  id: string
  tmdb_id: number
  title: string
  rating: number
  poster: string
  year: number
  mediaType: "movie" | "tv"
}

export function WatchlistPage() {
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all")
  const [watchlist, setWatchlist] = useState<EnrichedWatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const watchlistData: WatchlistItem[] = await watchlistAPI.get()

        if (!watchlistData || watchlistData.length === 0) {
          setWatchlist([])
          setIsLoading(false)
          return
        }

        const enrichedItems = await Promise.all(
          watchlistData.map(async (item) => {
            try {
              // Use correct API based on media type
              const api = item.media_type === "tv" ? tvAPI : moviesAPI
              const tmdbData = await api.getDetails(item.tmdb_id)
              
              return {
                id: item.id,
                tmdb_id: item.tmdb_id,
                title: tmdbData.title || tmdbData.name,
                rating: tmdbData.vote_average || 0,
                poster: tmdbData.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` 
                  : "",
                year: (tmdbData.release_date || tmdbData.first_air_date)
                  ? new Date(tmdbData.release_date || tmdbData.first_air_date).getFullYear() 
                  : 2024,
                mediaType: item.media_type as "movie" | "tv",
              }
            } catch (err) {
              console.error(`Failed to fetch details for tmdb_id ${item.tmdb_id}:`, err)
              return null
            }
          })
        )

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
    setRemovingId(watchlistId)
    try {
      await watchlistAPI.remove(watchlistId)
      setWatchlist(watchlist.filter((item) => item.id !== watchlistId))
    } catch (err) {
      console.error("Failed to remove from watchlist:", err)
    } finally {
      setRemovingId(null)
    }
  }

  const filteredWatchlist = filter === "all" 
    ? watchlist 
    : watchlist.filter(item => item.mediaType === filter)

  const stats = {
    all: watchlist.length,
    movies: watchlist.filter(item => item.mediaType === "movie").length,
    tvShows: watchlist.filter(item => item.mediaType === "tv").length,
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-zinc-800 rounded-lg w-48 mb-6 animate-pulse" />
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Filter Skeleton */}
            <div className="flex gap-2 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-zinc-800 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="relative">
                <div className="aspect-[2/3] bg-zinc-800 rounded-xl animate-pulse" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">😕</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
          <p className="text-zinc-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="h-12 px-6 bg-white hover:bg-zinc-200 text-black rounded-xl font-semibold transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">My Watchlist</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">{stats.all}</div>
              <div className="text-xs text-zinc-500">Total Items</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">{stats.movies}</div>
              <div className="text-xs text-zinc-500">Movies</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">{stats.tvShows}</div>
              <div className="text-xs text-zinc-500">TV Shows</div>
            </motion.div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`h-10 px-4 rounded-full text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-violet-500 text-white"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              All ({stats.all})
            </button>
            
            <button
              onClick={() => setFilter("movie")}
              className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "movie"
                  ? "bg-violet-500 text-white"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              <Film className="w-4 h-4" />
              Movies ({stats.movies})
            </button>
            
            <button
              onClick={() => setFilter("tv")}
              className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "tv"
                  ? "bg-violet-500 text-white"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              <Tv className="w-4 h-4" />
              TV Shows ({stats.tvShows})
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredWatchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700 flex items-center justify-center">
                <Bookmark className="w-10 h-10 text-zinc-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === "all" 
                ? "Your watchlist is empty" 
                : `No ${filter === "movie" ? "movies" : "TV shows"} in watchlist`}
            </h2>
            
            <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
              {filter === "all"
                ? "Start adding movies and TV shows to keep track of what you want to watch"
                : `Add some ${filter === "movie" ? "movies" : "TV shows"} to your watchlist`}
            </p>
            
            <button
              onClick={() => router.push(filter === "tv" ? "/tv" : "/")}
              className="h-12 px-6 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold transition-all"
            >
              Browse {filter === "tv" ? "TV Shows" : filter === "movie" ? "Movies" : "Content"}
            </button>
          </motion.div>
        ) : (
          /* Watchlist Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredWatchlist.map((item, index) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRemove={() => removeFromWatchlist(item.id)}
                isRemoving={removingId === item.id}
                delay={index * 0.03}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function WatchlistCard({
  item,
  onRemove,
  isRemoving,
  delay,
}: {
  item: EnrichedWatchlistItem
  onRemove: () => void
  isRemoving: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="relative group"
    >
      {/* Card */}
      <Link href={`/${item.mediaType}/${item.tmdb_id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-all bg-zinc-900">
          <img
            src={item.poster || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Media Type Badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
            {item.mediaType === "movie" ? (
              <Film className="w-3 h-3 text-zinc-400" />
            ) : (
              <Tv className="w-3 h-3 text-zinc-400" />
            )}
            <span className="text-xs font-medium text-zinc-400 capitalize">
              {item.mediaType}
            </span>
          </div>

          {/* Rating Badge - Top Left */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
            <span className="text-xs font-semibold text-yellow-400">
              ⭐ {item.rating.toFixed(1)}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 leading-tight">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400">{item.year}</p>
          </div>
        </div>
      </Link>

      {/* Remove Button - Hover Overlay on Desktop */}
      <div className="hidden md:flex absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl items-center justify-center">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          disabled={isRemoving}
          className="h-12 px-6 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {isRemoving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Remove
            </>
          )}
        </button>
      </div>

      {/* Remove Button - Always Visible on Mobile */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (window.confirm(`Remove "${item.title}" from your watchlist?`)) {
            onRemove()
          }
        }}
        disabled={isRemoving}
        className="md:hidden absolute bottom-16 right-2 z-20 w-10 h-10 bg-red-500/90 hover:bg-red-500 disabled:bg-red-500/50 text-white rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg"
      >
        {isRemoving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>

      {/* Card Info - Below Image */}
      <div className="mt-3 px-1">
        <h4 className="text-sm font-medium text-white line-clamp-1 mb-1">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{item.year}</span>
          <span className="flex items-center gap-1">
            ⭐ {item.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}