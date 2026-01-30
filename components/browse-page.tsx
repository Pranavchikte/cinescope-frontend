"use client"

import { moviesAPI, getAccessToken } from "@/lib/api"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, X } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { MovieGrid } from "@/components/movie-grid"
import { MovieCardSkeleton } from "@/components/movie-card-skeleton"
import { FilterBar, FilterState } from "@/components/filter-bar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

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
    const element = scrollContainerRef.current
    if (element) {
      element.addEventListener("scroll", checkScroll)
      return () => element.removeEventListener("scroll", checkScroll)
    }
  }, [movies])

  useEffect(() => {
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const element = scrollContainerRef.current
    if (element) {
      const scrollAmount = element.clientWidth * 0.8
      const newScrollLeft = direction === "left" ? element.scrollLeft - scrollAmount : element.scrollLeft + scrollAmount
      element.scrollTo({ left: newScrollLeft, behavior: "smooth" })
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-100 tracking-tight">
          {title}
        </h2>
        <div className="h-px flex-1 ml-4 bg-gradient-to-r from-neutral-800 to-transparent" />
      </div>

      <div className="relative group">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all shadow-xl backdrop-blur-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}

          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all shadow-xl backdrop-blur-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[160px] md:w-[200px]">
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="shrink-0 w-[160px] md:w-[200px]"
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
        </div>
      </div>
    </motion.section>
  )
}

export function BrowsePage() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularMovies, setPopularMovies] = useState<any[]>([])
  const [filteredMovies, setFilteredMovies] = useState<any[]>([])
  const [personalizedMovies, setPersonalizedMovies] = useState<any[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [providers, setProviders] = useState<{ provider_id: number; provider_name: string; logo_path: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    genre: "",
    year: null,
    language: "",
    country: "",
    provider: "",
    sort_by: "popularity.desc",
    vote_count_min: 100,
    vote_average_min: null,
    vote_average_max: null,
    runtime_min: null,
    runtime_max: null,
  })

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const [trending, popular, genresData, providersData] = await Promise.all([
          moviesAPI.getTrending(),
          moviesAPI.getPopular(),
          moviesAPI.getGenres(),
          moviesAPI.getProviders("IN"),
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
        setProviders(providersData.results || [])
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch personalized movies if authenticated
  useEffect(() => {
    const fetchPersonalized = async () => {
      try {
        const token = getAccessToken()
        if (token) {
          setIsAuthenticated(true)
          const data = await moviesAPI.getPersonalized(1, 500, 6.5)

          const transformMovie = (m: TMDBMovie) => ({
            id: m.id,
            title: m.title,
            rating: m.vote_average,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
          })

          setPersonalizedMovies(data.results.map(transformMovie))
        }
      } catch (error) {
        console.error("Failed to fetch personalized movies:", error)
      }
    }

    fetchPersonalized()
  }, [])

  // Fetch filtered data when filters change
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFiltering(true)

        const params: any = {
          sort_by: currentFilters.sort_by,
          page: 1,
          vote_count_min: currentFilters.vote_count_min,
        }

        if (currentFilters.genre) params.genre = currentFilters.genre
        if (currentFilters.year) params.year = currentFilters.year
        if (currentFilters.language) params.language = currentFilters.language
        if (currentFilters.country) params.country = currentFilters.country
        if (currentFilters.provider) params.provider = currentFilters.provider
        if (currentFilters.vote_average_min !== null) params.vote_average_min = currentFilters.vote_average_min
        if (currentFilters.vote_average_max !== null) params.vote_average_max = currentFilters.vote_average_max
        if (currentFilters.runtime_min !== null) params.runtime_min = currentFilters.runtime_min
        if (currentFilters.runtime_max !== null) params.runtime_max = currentFilters.runtime_max

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

  const hasActiveFilters =
    currentFilters.genre ||
    currentFilters.year ||
    currentFilters.language ||
    currentFilters.country ||
    currentFilters.provider ||
    currentFilters.vote_count_min !== 100 ||
    currentFilters.vote_average_min !== null ||
    currentFilters.vote_average_max !== null ||
    currentFilters.runtime_min !== null ||
    currentFilters.runtime_max !== null

  const activeFilterCount = [
    currentFilters.genre,
    currentFilters.year,
    currentFilters.language,
    currentFilters.country,
    currentFilters.provider,
    currentFilters.vote_count_min !== 100,
    currentFilters.vote_average_min !== null,
    currentFilters.vote_average_max !== null,
    currentFilters.runtime_min !== null,
    currentFilters.runtime_max !== null,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none opacity-50" />

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-50 mb-2 md:mb-3">
            Browse Movies
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-light">
            Discover trending films and personalized recommendations
          </p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 md:mb-12"
        >
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-200"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-neutral-700 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md bg-neutral-950 border-neutral-800 overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-neutral-100">Filter Movies</SheetTitle>
                </SheetHeader>
                <FilterBar
                  onFilterChange={handleFilterChange}
                  mediaType="movie"
                  genres={genres}
                  providers={providers}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:block bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 lg:p-6 backdrop-blur-sm">
            <FilterBar
              onFilterChange={handleFilterChange}
              mediaType="movie"
              genres={genres}
              providers={providers}
            />
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-10 md:space-y-16">
          {!hasActiveFilters ? (
            <>
              {/* Personalized Section */}
              {isAuthenticated && personalizedMovies.length > 0 && (
                <ScrollContainer title="Recommended For You" movies={personalizedMovies} isLoading={isLoading} />
              )}

              {/* Trending */}
              <ScrollContainer title="Trending Now" movies={trendingMovies} isLoading={isLoading} />

              {/* Popular */}
              <ScrollContainer title="Popular Movies" movies={popularMovies} isLoading={isLoading} />

              {/* All Movies Grid */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-100 tracking-tight">
                    All Movies
                  </h2>
                </div>
                <MovieGrid movies={filteredMovies} isLoading={isFiltering} />
              </motion.section>
            </>
          ) : (
            /* Filtered Results Only */
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-100 tracking-tight">
                    Filtered Results
                  </h2>
                  {isFiltering && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full"
                    >
                      <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                      <span className="text-xs text-neutral-400">Loading</span>
                    </motion.div>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <span className="text-sm text-neutral-500">
                    {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                  </span>
                )}
              </div>
              <MovieGrid movies={filteredMovies} isLoading={isFiltering} />
            </motion.section>
          )}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}