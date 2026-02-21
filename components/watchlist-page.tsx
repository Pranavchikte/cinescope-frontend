"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, Film, Tv, Star, Trash2, Check, MoreVertical } from "lucide-react"
import { watchlistAPI, moviesAPI, tvAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface WatchlistItem {
  id: string
  tmdb_id: number
  media_type: string
  added_at: string
}

interface EnrichedWatchlistItem {
  id: string
  tmdb_id: number
  added_at: string
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
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})
  const router = useRouter()

  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }))

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }))
    }, 600)
  }

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
                added_at: item.added_at,
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

  const nowThresholdMs = 7 * 24 * 60 * 60 * 1000
  const nowItems = filteredWatchlist.filter((item) => {
    const addedAt = new Date(item.added_at ?? Date.now()).getTime()
    const safeAddedAt = Number.isNaN(addedAt) ? Date.now() : addedAt
    return Date.now() - safeAddedAt <= nowThresholdMs
  })
  const nextItems = filteredWatchlist.filter((item) => {
    const addedAt = new Date(item.added_at ?? Date.now()).getTime()
    const safeAddedAt = Number.isNaN(addedAt) ? Date.now() : addedAt
    return Date.now() - safeAddedAt > nowThresholdMs
  })

  const stats = {
    all: watchlist.length,
    movies: watchlist.filter((item) => item.mediaType === "movie").length,
    tvShows: watchlist.filter((item) => item.mediaType === "tv").length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-24">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="h-8 bg-[#1A1A1A]/80 md:backdrop-blur-xl border border-[#2A2A2A] rounded-lg w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#1A1A1A]/80 md:backdrop-blur-xl border border-[#2A2A2A] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#1A1A1A]/80 md:backdrop-blur-xl border border-[#2A2A2A] rounded-full">
            <X className="w-8 h-8 text-[#A0A0A0]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] mb-3">
            Something went wrong
          </h2>
          <p className="text-[#A0A0A0] mb-8">{error}</p>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'error-home')
              router.push("/")
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold md:transition-all duration-200 relative overflow-hidden group"
          >
            {ripples['error-home']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#0F0F0F]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Go Home</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#F5F5F5] mb-2">
            My List
          </h1>
          <p className="text-base text-[#A0A0A0]">
            {stats.all} {stats.all === 1 ? "title" : "titles"}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2A2A2A]"
        >
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'filter-all')
              setFilter("all")
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 md:transition-all duration-200 relative overflow-hidden ${
              filter === "all"
                ? "border-[#14B8A6] text-[#14B8A6]"
                : "border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]"
            }`}
          >
            {ripples['filter-all']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 80, height: 80, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <span className="relative z-10">All</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'filter-movie')
              setFilter("movie")
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 md:transition-all duration-200 relative overflow-hidden ${
              filter === "movie"
                ? "border-[#14B8A6] text-[#14B8A6]"
                : "border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]"
            }`}
          >
            {ripples['filter-movie']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 80, height: 80, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <span className="relative z-10">Movies</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'filter-tv')
              setFilter("tv")
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 md:transition-all duration-200 relative overflow-hidden ${
              filter === "tv"
                ? "border-[#14B8A6] text-[#14B8A6]"
                : "border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]"
            }`}
          >
            {ripples['filter-tv']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 80, height: 80, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <span className="relative z-10">TV Shows</span>
          </motion.button>
        </motion.div>

        {/* Content Grid */}
        {filteredWatchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#1A1A1A]/80 md:backdrop-blur-xl border border-[#2A2A2A] rounded-full">
              <Film className="w-8 h-8 text-[#A0A0A0]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
              {filter === "all"
                ? "Your list is empty"
                : `No ${filter === "movie" ? "movies" : "TV shows"} in your list`}
            </h2>
            <p className="text-[#A0A0A0] text-center max-w-md mb-8">
              {filter === "all"
                ? "Titles you add to your list will appear here"
                : `Add some ${filter === "movie" ? "movies" : "TV shows"} to your list`}
            </p>
            <motion.button
              onClick={(e) => {
                handleRipple(e, 'empty-browse')
                router.push("/")
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold md:transition-all duration-200 relative overflow-hidden group"
            >
              {ripples['empty-browse']?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#0F0F0F]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Find Something to Watch</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {/* Now Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#F5F5F5]">Now</h2>
                  <p className="text-xs sm:text-sm text-[#A0A0A0]">
                    Recently added
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-[#A0A0A0]">{nowItems.length}</span>
              </div>
              {nowItems.length === 0 ? (
                <div className="bg-[#1A1A1A]/60 border border-[#2A2A2A] rounded-lg p-4 text-sm text-[#A0A0A0]">
                  Nothing new yet. Add a few titles to see them here.
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                >
                  <AnimatePresence mode="popLayout">
                    {nowItems.map((item, index) => (
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
            </motion.div>

            {/* Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#F5F5F5]">Next</h2>
                  <p className="text-xs sm:text-sm text-[#A0A0A0]">
                    Older items to catch up on
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-[#A0A0A0]">{nextItems.length}</span>
              </div>
              {nextItems.length === 0 ? (
                <div className="bg-[#1A1A1A]/60 border border-[#2A2A2A] rounded-lg p-4 text-sm text-[#A0A0A0]">
                  Your backlog is clear. Nice work.
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                >
                  <AnimatePresence mode="popLayout">
                    {nextItems.map((item, index) => (
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
            </motion.div>
          </div>
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
  const [showActions, setShowActions] = useState(false)
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }))

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }))
    }, 600)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleRipple(e, 'remove-btn')
    setShowConfirm(true)
  }

  const confirmRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleRipple(e, 'confirm-yes')
    onRemove()
    setShowConfirm(false)
  }

  const cancelRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleRipple(e, 'confirm-no')
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
          className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A]/80 md:backdrop-blur-xl border border-[#2A2A2A] hover:border-[#14B8A6]/50 md:transition-all duration-200 cursor-pointer"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />

          {item.poster ? (
            <img
              src={item.poster || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-full object-cover relative z-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative z-0">
              <Film className="w-12 h-12 text-[#404040]" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

          {/* Rating Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-[#0F0F0F]/80 md:backdrop-blur-xl rounded-lg border border-[#2A2A2A] z-20">
            <Star className="w-3 h-3 fill-[#14B8A6] text-[#14B8A6]" />
            <span className="text-xs font-medium text-[#F5F5F5]">{item.rating.toFixed(1)}</span>
          </div>

          {/* Media Type Badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-[#0F0F0F]/80 md:backdrop-blur-xl rounded-lg border border-[#2A2A2A] z-20">
            {item.mediaType === "movie" ? (
              <Film className="w-3 h-3 text-[#F5F5F5]" />
            ) : (
              <Tv className="w-3 h-3 text-[#F5F5F5]" />
            )}
          </div>

          {/* Title Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <h3 className="text-sm font-medium text-[#F5F5F5] line-clamp-2 mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-[#A0A0A0]">{item.year}</p>
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
              <motion.button
                onClick={handleRemove}
                disabled={isRemoving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#1A1A1A]/80 hover:bg-red-500/10 text-[#F5F5F5] hover:text-red-400 border border-[#2A2A2A] hover:border-red-500/50 md:backdrop-blur-xl rounded-lg text-sm font-medium md:transition-all duration-200 disabled:opacity-50 flex items-center gap-2 relative overflow-hidden group"
              >
                {ripples['remove-btn']?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-red-500/20 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                    animate={{ width: 80, height: 80, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isRemoving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                    <span className="relative z-10">Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Remove</span>
                  </>
                )}
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={confirmRemove}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg text-sm font-medium md:transition-all duration-200 flex items-center gap-2 relative overflow-hidden group"
                >
                  {ripples['confirm-yes']?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-[#0F0F0F]/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                      animate={{ width: 80, height: 80, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Check className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Yes</span>
                </motion.button>
                <motion.button
                  onClick={cancelRemove}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-[#1A1A1A]/80 hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 md:backdrop-blur-xl rounded-lg text-sm font-medium md:transition-all duration-200 flex items-center gap-2 relative overflow-hidden group"
                >
                  {ripples['confirm-no']?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-[#14B8A6]/20 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                      animate={{ width: 80, height: 80, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-[#2A2A2A]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <X className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">No</span>
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Quick Manage Button on Poster */}
      <motion.button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowActions(true)
        }}
        disabled={isRemoving}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="md:hidden absolute top-2 right-2 z-10 w-8 h-8 bg-[#0F0F0F]/80 hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 md:backdrop-blur-xl rounded-full flex items-center justify-center md:transition-all duration-200 disabled:opacity-50"
      >
        {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <MoreVertical className="w-3 h-3" />}
      </motion.button>

      {/* Mobile: Action Row */}
      <div className="md:hidden mt-2 flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowActions(true)
          }}
          className="flex-1 h-10 rounded-lg bg-[#1A1A1A] text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-colors text-sm font-medium"
        >
          Manage
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowActions(true)
          }}
          className="h-10 px-4 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Mobile Actions Sheet */}
      <Sheet open={showActions} onOpenChange={setShowActions}>
        <SheetContent side="bottom" className="bg-[#0F0F0F] border-t border-[#2A2A2A]">
          <SheetHeader>
            <SheetTitle className="text-[#F5F5F5]">Manage</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-[#A0A0A0] truncate">{item.title}</div>
            <button
              onClick={() => {
                onRemove()
                setShowActions(false)
              }}
              className="w-full h-12 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              Remove from Watchlist
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="w-full h-12 rounded-lg bg-[#1A1A1A] text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
