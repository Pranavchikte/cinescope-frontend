"use client"

import { moviesAPI, tvAPI } from "@/lib/api"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Film, Tv, AlertCircle } from "lucide-react"
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

        const [moviesData, tvData] = await Promise.all([
          moviesAPI.search(query),
          tvAPI.search(query),
        ])

        const transformMovie = (m: any) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
          mediaType: "movie" as const,
        })

        const transformTV = (s: any) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
          mediaType: "tv" as const,
        })

        const allResults = [
          ...moviesData.results.map(transformMovie),
          ...tvData.results.map(transformTV),
        ].sort((a, b) => b.rating - a.rating)

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

  useEffect(() => {
    let filtered = [...results]

    if (mediaFilter !== "all") {
      filtered = filtered.filter((item) => item.mediaType === mediaFilter)
    }

    setFilteredResults(filtered)
  }, [results, mediaFilter])

  const movieCount = results.filter((r) => r.mediaType === "movie").length
  const tvCount = results.filter((r) => r.mediaType === "tv").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-24">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="h-8 bg-[#2a2a2a] rounded w-48 mb-3 animate-pulse" />
          <div className="h-5 bg-[#2a2a2a] rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
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
            <AlertCircle className="w-8 h-8 text-[#b3b3b3]" />
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

  const isEmpty = filteredResults.length === 0

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
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#e5e5e5] mb-2">
            {query ? `Search results for "${query}"` : "Search Results"}
          </h1>
          {!isEmpty && (
            <p className="text-base text-[#b3b3b3]">
              {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}
            </p>
          )}
        </motion.div>

        {/* Filter Tabs */}
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-4 mb-8 border-b border-[#2a2a2a]"
          >
            <button
              onClick={() => setMediaFilter("all")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                mediaFilter === "all"
                  ? "border-[#e5e5e5] text-[#e5e5e5]"
                  : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setMediaFilter("movie")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                mediaFilter === "movie"
                  ? "border-[#e5e5e5] text-[#e5e5e5]"
                  : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
              }`}
            >
              <Film className="w-4 h-4" />
              Movies ({movieCount})
            </button>
            <button
              onClick={() => setMediaFilter("tv")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                mediaFilter === "tv"
                  ? "border-[#e5e5e5] text-[#e5e5e5]"
                  : "border-transparent text-[#808080] hover:text-[#b3b3b3]"
              }`}
            >
              <Tv className="w-4 h-4" />
              TV Shows ({tvCount})
            </button>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#2a2a2a] rounded-full">
                <Search className="w-8 h-8 text-[#808080]" />
              </div>
              <h2 className="text-xl font-medium text-[#e5e5e5] mb-2">
                No results found
              </h2>
              <p className="text-[#b3b3b3] text-center max-w-md mb-8">
                {query 
                  ? `We couldn't find any titles matching "${query}". Try different keywords.`
                  : "Try searching for movies or TV shows"
                }
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-[#e5e5e5] transition-colors"
              >
                Browse Titles
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
            >
              {filteredResults.map((movie, index) => (
                <motion.div
                  key={`${movie.mediaType}-${movie.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
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
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#808080] animate-spin" />
            <p className="text-sm text-[#b3b3b3]">Searching...</p>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}