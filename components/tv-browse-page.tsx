"use client"

import { tvAPI, getAccessToken } from "@/lib/api"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2, Tv, TrendingUp, Star } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { MovieGrid } from "@/components/movie-grid"
import { FilterBar, FilterState } from "@/components/filter-bar"

interface TMDBShow {
  id: number
  name: string
  vote_average: number
  poster_path: string
  first_air_date: string
}

function ScrollContainer({
  title,
  shows,
  isLoading = false,
  icon: Icon,
}: {
  title: string
  shows: any[]
  isLoading?: boolean
  icon?: any
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
  }, [shows])

  useEffect(() => {
    const handleResize = () => checkScroll()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const element = scrollContainerRef.current
    if (element) {
      const scrollAmount = element.clientWidth * 0.8
      element.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-violet-400" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        {/* Desktop Scroll Buttons */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start">
                <div className="aspect-[2/3] bg-zinc-800 rounded-xl animate-pulse" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            shows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start"
              >
                <MovieCard movie={show} mediaType="tv" />
              </motion.div>
            ))
          )}
        </div>

        {/* Gradient Fade Edges - Mobile */}
        <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent" />
        <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent" />
      </div>
    </div>
  )
}

export function TVBrowsePage() {
  const [trendingShows, setTrendingShows] = useState<any[]>([])
  const [popularShows, setPopularShows] = useState<any[]>([])
  const [filteredShows, setFilteredShows] = useState<any[]>([])
  const [personalizedShows, setPersonalizedShows] = useState<any[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [providers, setProviders] = useState<{ provider_id: number; provider_name: string; logo_path: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const [trending, popular, genresData, providersData] = await Promise.all([
          tvAPI.getTrending(),
          tvAPI.getPopular(),
          tvAPI.getGenres(),
          tvAPI.getProviders("IN"),
        ])

        const transformShow = (s: TMDBShow) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        })

        setTrendingShows(trending.results.map(transformShow))
        setPopularShows(popular.results.map(transformShow))
        setFilteredShows(popular.results.map(transformShow))
        setGenres(genresData.genres || [])
        setProviders(providersData.results || [])
      } catch (error) {
        console.error("Failed to fetch TV shows:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchPersonalized = async () => {
      try {
        const token = getAccessToken()
        if (token) {
          setIsAuthenticated(true)
          const data = await tvAPI.getPersonalized(1, 500, 6.5)
          
          const transformShow = (s: TMDBShow) => ({
            id: s.id,
            title: s.name,
            rating: s.vote_average,
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
            year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
          })

          setPersonalizedShows(data.results.map(transformShow))
        }
      } catch (error) {
        console.error("Failed to fetch personalized TV shows:", error)
      }
    }

    fetchPersonalized()
  }, [])

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

        const data = await tvAPI.discover(params)

        const transformShow = (s: TMDBShow) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        })

        setFilteredShows(data.results.map(transformShow))
      } catch (error) {
        console.error("Failed to fetch filtered TV shows:", error)
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
    currentFilters.vote_average_max !== null

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      {!hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mb-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white">TV Shows</h1>
                <p className="text-zinc-400 mt-2">Discover your next binge-worthy series</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 mb-8">
        <FilterBar 
          onFilterChange={handleFilterChange} 
          mediaType="tv" 
          genres={genres} 
          providers={providers} 
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Carousel Sections */}
          {!hasActiveFilters && (
            <>
              {isAuthenticated && personalizedShows.length > 0 && (
                <ScrollContainer 
                  title="For You" 
                  shows={personalizedShows} 
                  isLoading={isLoading}
                  icon={Star}
                />
              )}

              <ScrollContainer 
                title="Trending Now" 
                shows={trendingShows} 
                isLoading={isLoading}
                icon={TrendingUp}
              />

              <ScrollContainer 
                title="Popular TV Shows" 
                shows={popularShows} 
                isLoading={isLoading}
                icon={Tv}
              />
            </>
          )}

          {/* Filtered Results Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {hasActiveFilters ? "Filtered Results" : "All TV Shows"}
              </h2>
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {!isFiltering && filteredShows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6">
                  <Tv className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No TV shows found</h3>
                <p className="text-sm text-zinc-500">Try adjusting your filters</p>
              </div>
            ) : (
              <MovieGrid 
                movies={filteredShows} 
                isLoading={isFiltering} 
                mediaType="tv"
                skeletonCount={12}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}