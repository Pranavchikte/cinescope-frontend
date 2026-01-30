"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { watchlistAPI, ratingsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Movie {
  id: number
  title: string
  rating: number
  poster: string
  year: number
}

interface MovieCardProps {
  movie: Movie
  mediaType?: "movie" | "tv"
}

export function MovieCard({ movie, mediaType = "movie" }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [showRatingMenu, setShowRatingMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  const ratingOptions = [
    { value: "skip", label: "Skip", icon: "⏭️", color: "text-zinc-400" },
    { value: "timepass", label: "Timepass", icon: "⏱️", color: "text-white" },
    { value: "go_for_it", label: "Go for it", icon: "👍", color: "text-white" },
    { value: "perfection", label: "Perfection", icon: "✨", color: "text-yellow-400" }
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
        setIsInWatchlist(false)
        showNotification("Removed from watchlist", "success")
      } else {
        await watchlistAPI.add({ tmdb_id: movie.id, media_type: mediaType })
        setIsInWatchlist(true)
        showNotification("Added to watchlist!", "success")
      }
    } catch (error: any) {
      const errorText = error.message || ""
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error")
      } else {
        showNotification("Failed. Please login first.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (ratingValue: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    setIsLoading(true)
    try {
      await ratingsAPI.create({ tmdb_id: movie.id, media_type: mediaType, rating: ratingValue })
      setShowRatingMenu(false)
      showNotification(`Rated as ${ratingOptions.find(r => r.value === ratingValue)?.label}!`, "success")
    } catch (error: any) {
      const errorText = error.message || ""
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error")
      } else {
        showNotification("Failed to rate. Please login first.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const openRatingMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMobile(window.innerWidth < 768)
    setShowRatingMenu(true)
  }

  return (
    <>
      <Link href={`/${mediaType}/${movie.id}`}>
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative group cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 h-full flex flex-col"
        >
          {/* Poster Container */}
          <div className="relative aspect-[2/3] bg-zinc-800 overflow-hidden">
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Top Actions Bar */}
            <div className="absolute top-0 left-0 right-0 p-2 flex items-start justify-between z-10">
              {/* Rating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10"
              >
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-white">{movie.rating.toFixed(1)}</span>
              </motion.div>

              {/* Watchlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchlistToggle}
                disabled={isLoading}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/80 backdrop-blur-md rounded-lg border border-white/10 hover:bg-black/90 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : isInWatchlist ? (
                  <BookmarkCheck className="w-4 h-4 text-violet-400" />
                ) : (
                  <Bookmark className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>

            {/* Bottom Actions - Always Visible on Mobile, Hover on Desktop */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openRatingMenu}
                className="w-full min-h-[44px] py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                Rate this
              </motion.button>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1">
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-500">{movie.year}</p>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent" />
          </div>
        </motion.div>
      </Link>

      {/* Desktop Rating Menu - Dropdown */}
      {!isMobile && (
        <DropdownMenu open={showRatingMenu && !isMobile} onOpenChange={setShowRatingMenu}>
          <DropdownMenuTrigger asChild>
            <div className="hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-xl p-1.5"
          >
            {ratingOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => handleRating(option.value, e as any)}
                disabled={isLoading}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium ${option.color} focus:bg-zinc-800 focus:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                <span className="text-base">{option.icon}</span>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Mobile Rating Menu - Bottom Sheet */}
      <Sheet open={showRatingMenu && isMobile} onOpenChange={setShowRatingMenu}>
        <SheetContent side="bottom" className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-base">Rate: {movie.title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value)}
                disabled={isLoading}
                className={`w-full min-h-[56px] px-4 py-3 text-left rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className={`text-base font-medium ${option.color}`}>{option.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border min-w-[200px] max-w-[90vw] md:max-w-md ${
              showToast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            <p className="text-sm font-medium text-center">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}