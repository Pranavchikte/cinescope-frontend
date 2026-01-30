"use client"

import { motion } from "framer-motion"
import { MovieCard } from "./movie-card"
import { MovieCardSkeleton } from "./movie-card-skeleton"
import { Film } from "lucide-react"

interface Movie {
  id: number
  title: string
  rating: number
  poster: string
  year: number
}

interface MovieGridProps {
  movies: Movie[]
  isLoading?: boolean
  mediaType?: "movie" | "tv"
  skeletonCount?: number
  emptyMessage?: string
}

export function MovieGrid({ 
  movies, 
  isLoading = false, 
  mediaType = "movie",
  skeletonCount = 12,
  emptyMessage = "No movies found"
}: MovieGridProps) {
  
  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Show empty state
  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700 flex items-center justify-center">
            <Film className="w-10 h-10 text-zinc-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
      role="list"
      aria-label={`${mediaType === 'movie' ? 'Movies' : 'TV Shows'} grid`}
    >
      {movies.map((movie, index) => {
        // Only animate first 12 items for performance
        const shouldAnimate = index < 12
        const animationDelay = shouldAnimate ? index * 0.03 : 0

        return (
          <motion.div
            key={movie.id}
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: animationDelay,
              ease: [0.23, 1, 0.32, 1] // Custom ease-out curve
            }}
            role="listitem"
          >
            <MovieCard movie={movie} mediaType={mediaType} />
          </motion.div>
        )
      })}
    </div>
  )
}