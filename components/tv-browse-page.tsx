"use client"

import { tvAPI, getAccessToken } from "@/lib/api"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { MovieGrid } from "@/components/movie-grid"
import { MovieCardSkeleton } from "@/components/movie-card-skeleton"
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
}: {
  title: string
  shows: any[]
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
            : shows.map((show) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <MovieCard movie={show} mediaType="tv" />
                </motion.div>
              ))}
        </div>
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

  // Fetch initial data
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

  // Fetch personalized TV shows if authenticated
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
    <div className="space-y-8">
      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} mediaType="tv" genres={genres} providers={providers} />

      <div className="space-y-12 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        {!hasActiveFilters && (
          <>
            <div>
              <h1 className="text-4xl font-bold text-foreground">TV Shows</h1>
              <p className="text-muted-foreground mt-2">Explore trending and popular TV shows</p>
            </div>

            {/* Personalized Section */}
            {isAuthenticated && personalizedShows.length > 0 && (
              <ScrollContainer title="For You" shows={personalizedShows} isLoading={isLoading} />
            )}

            <ScrollContainer title="Trending TV Shows" shows={trendingShows} isLoading={isLoading} />
            <ScrollContainer title="Popular TV Shows" shows={popularShows} isLoading={isLoading} />
          </>
        )}

        {/* Filtered Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {hasActiveFilters ? "Filtered Results" : "All TV Shows"}
            </h2>
            {isFiltering && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          </div>
          <MovieGrid movies={filteredShows} isLoading={isFiltering} />
        </div>
      </div>
    </div>
  )
}