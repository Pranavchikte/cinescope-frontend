"use client"

import { moviesAPI, tvAPI } from "@/lib/api"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Loader2 } from "lucide-react"
import { MovieCard } from "@/components/movie-card"

interface TMDBMovie {
  id: number
  title: string
  vote_average: number
  poster_path: string
  release_date: string
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""

  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Search both movies and TV shows
        const [moviesData, tvData] = await Promise.all([
          moviesAPI.search(query),
          tvAPI.search(query),
        ])

        // Transform movies
        const transformMovie = (m: any) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
          mediaType: "movie" as const,
        })

        // Transform TV shows
        const transformTV = (s: any) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
          mediaType: "tv" as const,
        })

        // Combine and sort by rating
        const allResults = [
          ...moviesData.results.map(transformMovie),
          ...tvData.results.map(transformTV),
        ].sort((a, b) => b.rating - a.rating)

        setResults(allResults)
      } catch (err) {
        console.error("Search failed:", err)
        setError("Failed to search. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

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

  const isEmpty = results.length === 0

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">Search Results</h1>
        {query && (
          <p className="text-muted-foreground">
            {isEmpty ? "No results found for" : `Found ${results.length} results for`}{" "}
            <span className="text-foreground font-semibold">"{query}"</span>
          </p>
        )}
      </motion.div>

      {isEmpty ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-32 h-32 mb-6 rounded-full glass-dark flex items-center justify-center">
            <Search className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Try searching with different keywords or check your spelling
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
        /* Results Grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {results.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MovieCard movie={movie} mediaType={movie.mediaType} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}