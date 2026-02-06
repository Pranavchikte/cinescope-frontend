"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, Film, Tv, Star, Trash2, Check } from "lucide-react"
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
      setTimeout(() => {
        setWatchlist(watchlist.filter((item) => item.id !== watchlistId))
        setRemovingId(null)
      }, 300)
    } catch (err) {
      console.error("Failed to remove from watchlist:", err)
      setRemovingId(null)
    }
  }

  const filteredWatchlist = filter === "all"
    ? watchlist
    : watchlist.filter((item) => item.mediaType === filter)

  const stats = {
    all: watchlist.length,
    movies: watchlist.filter((item) => item.mediaType === "movie").length,
    tvShows: watchlist.filter((item) => item.mediaType === "tv").length,
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
            <X className="w-8 h-8 text-[#b3b3b3]" />
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
            My List
          </h1>
          <p className="text-base text-[#b3b3b3]">
            {stats.all} {stats.all === 1 ? "title" : "titles"}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2a2a2a]"
        >
          <button
            onClick={() => setFilter("all")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              filter === "all"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("movie")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              filter === "movie"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setFilter("tv")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              filter === "tv"
                ? "border-[#e5e5e5] text-[#e5e5e5]"
                : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
            }`}
          >
            TV Shows
          </button>
        </motion.div>

        {/* Content Grid */}
        {filteredWatchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#2a2a2a] rounded-full">
              <Film className="w-8 h-8 text-[#808080]" />
            </div>
            <h2 className="text-xl font-medium text-[#e5e5e5] mb-2">
              {filter === "all"
                ? "Your list is empty"
                : `No ${filter === "movie" ? "movies" : "TV shows"} in your list`}
            </h2>
            <p className="text-[#b3b3b3] text-center max-w-md mb-8">
              {filter === "all"
                ? "Titles you add to your list will appear here"
                : `Add some ${filter === "movie" ? "movies" : "TV shows"} to your list`}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              Find Something to Watch
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
              {filteredWatchlist.map((item, index) => (
                <WatchlistCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromWatchlist(item.id)}
                  isRemoving={removingId === item.id}
                  delay={index * 0.03}
                />
              ))}
            </AnimatePresence>
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  const confirmRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
    setShowConfirm(false)
  }

  const cancelRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(false)
  }

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
        setShowConfirm(false)
      }}
    >
      <Link href={`/${item.mediaType}/${item.tmdb_id}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative aspect-[2/3] rounded overflow-hidden bg-[#2a2a2a] cursor-pointer"
        >
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-12 h-12 text-[#404040]" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Rating Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/80 backdrop-blur-sm rounded">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-white">{item.rating.toFixed(1)}</span>
          </div>

          {/* Media Type Badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded">
            {item.mediaType === "movie" ? (
              <Film className="w-3 h-3 text-[#e5e5e5]" />
            ) : (
              <Tv className="w-3 h-3 text-[#e5e5e5]" />
            )}
          </div>

          {/* Title Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-[#b3b3b3]">{item.year}</p>
          </div>
        </motion.div>
      </Link>

      {/* Remove Button - Desktop */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="hidden md:flex absolute -bottom-12 left-0 right-0 justify-center gap-2 z-20"
          >
            {!showConfirm ? (
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={confirmRemove}
                  className="px-3 py-2 bg-white hover:bg-[#e5e5e5] text-black rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Yes</span>
                </button>
                <button
                  onClick={cancelRemove}
                  className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>No</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Button - Mobile */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (window.confirm(`Remove "${item.title}" from your list?`)) {
            onRemove()
          }
        }}
        disabled={isRemoving}
        className="md:hidden absolute top-2 right-2 z-10 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
      </button>
    </motion.div>
  )
}