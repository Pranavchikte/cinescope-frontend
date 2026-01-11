"use client"

import { motion } from "framer-motion"
import { MovieCard } from "./movie-card"
import { MovieCardSkeleton } from "./movie-card-skeleton"

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
}

export function MovieGrid({ movies, isLoading = false }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
        : movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
    </div>
  )
}
