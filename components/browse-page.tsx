"use client"

import { moviesAPI } from "@/lib/api"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { MovieGrid } from "@/components/movie-grid"
import { MovieCardSkeleton } from "@/components/movie-card-skeleton"
import { FilterBar, FilterState } from "@/components/filter-bar"

interface TMDBMovie {
  id: number
  title: string
  vote_average: number
  poster_path: string
  release_date: string
}

function ScrollContainer({
  title,
  movies,
  isLoading = false,
}: {
  title: string
  movies: any[]
  isLoading?: boolean
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const element = scrollContainerRef.current
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0)
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const element = scrollContainerRef.current
    if (element) {
      const scrollAmount = 400
      const newScrollLeft = direction === "left" ? element.scrollLeft - scrollAmount : element.scrollLeft + scrollAmount
      element.scrollTo({ left: newScrollLeft, behavior: "smooth" })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="relative group">
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}

        <div ref={scrollContainerRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  )
}

export function BrowsePage() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularMovies, setPopularMovies] = useState<any[]>([])
  const [filteredMovies, setFilteredMovies] = useState<any[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    genre: "",
    year: null,
    language: "",
    country: "",
    sort_by: "popularity.desc",
  })

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const [trending, popular, genresData] = await Promise.all([
          moviesAPI.getTrending(),
          moviesAPI.getPopular(),
          moviesAPI.getGenres(),
        ])

        const transformMovie = (m: TMDBMovie) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        })

        setTrendingMovies(trending.results.map(transformMovie))
        setPopularMovies(popular.results.map(transformMovie))
        setFilteredMovies(popular.results.map(transformMovie))
        setGenres(genresData.genres || [])
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch filtered data when filters change
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFiltering(true)

        const params: any = {
          sort_by: currentFilters.sort_by,
          page: 1,
        }

        if (currentFilters.genre) params.genre = currentFilters.genre
        if (currentFilters.year) params.year = currentFilters.year
        if (currentFilters.language) params.language = currentFilters.language
        if (currentFilters.country) params.country = currentFilters.country

        const data = await moviesAPI.discover(params)

        const transformMovie = (m: TMDBMovie) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        })

        setFilteredMovies(data.results.map(transformMovie))
      } catch (error) {
        console.error("Failed to fetch filtered movies:", error)
      } finally {
        setIsFiltering(false)
      }
    }

    fetchFilteredData()
  }, [currentFilters])

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters)
  }

  const hasActiveFilters = currentFilters.genre || currentFilters.year || currentFilters.language || currentFilters.country

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} mediaType="movie" genres={genres} />

      <div className="space-y-12 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        {!hasActiveFilters && (
          <>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Discover</h1>
              <p className="text-muted-foreground mt-2">Explore trending movies and TV shows</p>
            </div>

            <ScrollContainer title="Trending Movies" movies={trendingMovies} isLoading={isLoading} />
            <ScrollContainer title="Popular Movies" movies={popularMovies} isLoading={isLoading} />
          </>
        )}

        {/* Filtered Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {hasActiveFilters ? "Filtered Results" : "All Movies"}
            </h2>
            {isFiltering && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          </div>
          <MovieGrid movies={filteredMovies} isLoading={isFiltering} />
        </div>
      </div>
    </div>
  )
}