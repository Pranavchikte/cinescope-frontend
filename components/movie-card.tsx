"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Bookmark, BookmarkCheck } from "lucide-react"
import Link from "next/link"
import { watchlistAPI, ratingsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Movie {
  id: number
  title: string
  rating: number
  poster: string
  year: number
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [showRatingMenu, setShowRatingMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const ratingOptions = [
    { value: "skip", label: "Skip", color: "text-red-400" },
    { value: "timepass", label: "Timepass", color: "text-yellow-400" },
    { value: "go_for_it", label: "Go for it", color: "text-green-400" },
    { value: "perfection", label: "Perfection", color: "text-primary" }
  ]

  const showNotification = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3000)
  }

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      if (isInWatchlist) {
        // Remove from watchlist logic here
        setIsInWatchlist(false)
        showNotification("Removed from watchlist", "success")
      } else {
        await watchlistAPI.add({ tmdb_id: movie.id, media_type: "movie" })
        setIsInWatchlist(true)
        showNotification("Added to watchlist!", "success")
      }
    } catch (error) {
      showNotification("Failed. Please login first.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (ratingValue: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      await ratingsAPI.create({ tmdb_id: movie.id, media_type: "movie", rating: ratingValue })
      setShowRatingMenu(false)
      showNotification(`Rated as ${ratingOptions.find(r => r.value === ratingValue)?.label}!`, "success")
    } catch (error) {
      showNotification("Failed to rate. Please login first.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Link href={`/movie/${movie.id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          className="relative group cursor-pointer w-[185px] bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
        >
          {/* Poster */}
          <div className="relative aspect-[2/3] bg-muted">
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            
            {/* Watchlist Button - Top Right */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWatchlistToggle}
              disabled={isLoading}
              className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {isInWatchlist ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4 text-white" />
              )}
            </motion.button>

            {/* Rating Badge - Top Left */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">{movie.rating.toFixed(1)}</span>
            </div>

            {/* Rate Button - Bottom Overlay on Hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowRatingMenu(!showRatingMenu)
                  }}
                  className="w-full py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded text-sm font-semibold transition-colors"
                >
                  Rate this
                </motion.button>

                {/* Rating Menu */}
                <AnimatePresence>
                  {showRatingMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-secondary/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden z-20"
                    >
                      {ratingOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={(e) => handleRating(option.value, e)}
                          disabled={isLoading}
                          className={`block w-full px-3 py-2 text-sm hover:bg-secondary/80 transition-colors text-left ${option.color} disabled:opacity-50`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-3 bg-card">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{movie.title}</h3>
            <p className="text-xs text-muted-foreground">{movie.year}</p>
          </div>
        </motion.div>
      </Link>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              showToast.type === 'success' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            } backdrop-blur-sm`}
          >
            <p className="text-sm font-medium">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}