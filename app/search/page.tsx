"use client"

import { moviesAPI, tvAPI } from "@/lib/api"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, ArrowLeft, Film, Tv, SlidersHorizontal, AlertCircle } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { MovieCardSkeleton } from "@/components/movie-card-skeleton"

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
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all")
  const [sortBy, setSortBy] = useState<"rating" | "year">("rating")

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setFilteredResults([])
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

        // Combine results
        const allResults = [
          ...moviesData.results.map(transformMovie),
          ...tvData.results.map(transformTV),
        ]

        setResults(allResults)
        setFilteredResults(allResults)
      } catch (err) {
        console.error("Search failed:", err)
        setError("Failed to search. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results]

    // Media type filter
    if (mediaFilter !== "all") {
      filtered = filtered.filter((item) => item.mediaType === mediaFilter)
    }

    // Sort
    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "year") {
      filtered.sort((a, b) => b.year - a.year)
    }

    setFilteredResults(filtered)
  }, [results, mediaFilter, sortBy])

  const movieCount = results.filter((r) => r.mediaType === "movie").length
  const tvCount = results.filter((r) => r.mediaType === "tv").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="mb-8">
            <div className="h-10 bg-neutral-800 rounded-lg w-48 mb-3 animate-pulse" />
            <div className="h-5 bg-neutral-800 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center max-w-md"
        >
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 inline-flex">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-neutral-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    )
  }

  const isEmpty = filteredResults.length === 0

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-50 mb-3 tracking-tight">
            Search Results
          </h1>
          {query && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm md:text-base text-neutral-400">
                {isEmpty ? "No results found for" : `Found ${filteredResults.length} results for`}
              </p>
              <span className="px-3 py-1 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-neutral-200 font-medium">
                "{query}"
              </span>
            </div>
          )}
        </motion.div>

        {!isEmpty && (
          /* Filter Bar */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Media Type Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Filter by Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMediaFilter("all")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    mediaFilter === "all"
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                  }`}
                >
                  <span>All</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    mediaFilter === "all" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}>
                    {results.length}
                  </span>
                </button>
                <button
                  onClick={() => setMediaFilter("movie")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    mediaFilter === "movie"
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Movies</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    mediaFilter === "movie" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}>
                    {movieCount}
                  </span>
                </button>
                <button
                  onClick={() => setMediaFilter("tv")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    mediaFilter === "tv"
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>TV Shows</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    mediaFilter === "tv" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}>
                    {tvCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Sort By</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    sortBy === "rating"
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                  }`}
                >
                  Highest Rated
                </button>
                <button
                  onClick={() => setSortBy("year")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    sortBy === "year"
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-900/30 text-neutral-400 border border-neutral-800/50 hover:border-neutral-700/50 hover:text-neutral-300"
                  }`}
                >
                  Most Recent
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 md:py-24"
            >
              <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl mb-6">
                <Search className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-neutral-300 mb-2">
                No results found
              </h2>
              <p className="text-sm md:text-base text-neutral-500 text-center max-w-md mb-8">
                Try searching with different keywords, check your spelling, or adjust your filters
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl font-semibold transition-all"
              >
                Browse Movies
              </button>
            </motion.div>
          ) : (
            /* Results Grid */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {filteredResults.map((movie, index) => (
                <motion.div
                  key={`${movie.mediaType}-${movie.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <MovieCard movie={movie} mediaType={movie.mediaType} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
            <p className="text-sm text-neutral-500">Searching...</p>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}