"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X } from "lucide-react"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  mediaType: "movie" | "tv"
  genres: { id: number; name: string }[]
  providers: { provider_id: number; provider_name: string; logo_path: string }[]
}

export interface FilterState {
  genre: string
  year: number | null
  language: string
  country: string
  provider: string
  sort_by: string
  vote_count_min: number
  vote_average_min: number | null
  vote_average_max: number | null
  runtime_min: number | null
  runtime_max: number | null
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
]

export function FilterBar({ onFilterChange, mediaType, genres, providers }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
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

  const [showGenres, setShowGenres] = useState(false)
  const [showProviders, setShowProviders] = useState(false)
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
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
  }

  const hasActiveFilters = filters.genre || filters.provider

  const getGenreName = () => {
    if (!filters.genre) return "Genre"
    const genre = genres.find((g) => g.id.toString() === filters.genre)
    return genre?.name || "Genre"
  }

  const getProviderName = () => {
    if (!filters.provider) return "Streaming"
    const provider = providers.find((p) => p.provider_id.toString() === filters.provider)
    return provider?.provider_name || "Streaming"
  }

  return (
    <div className="bg-[#0f0f0f] border-b border-[#2a2a2a] py-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Genre Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              setShowProviders(false)
              setShowSort(false)
              setShowGenres(!showGenres)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.genre
                ? "bg-[#e5e5e5] text-[#0f0f0f] border-[#e5e5e5]"
                : "bg-[#181818] text-white border-[#2a2a2a] hover:bg-[#222222]"
            }`}
          >
            {getGenreName()}
            <ChevronDown className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showGenres && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 bg-[#222222] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl z-50 min-w-48 max-h-64 overflow-y-auto"
              >
                <button
                  onClick={() => {
                    updateFilter("genre", "")
                    setShowGenres(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-150"
                >
                  All Genres
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => {
                      updateFilter("genre", genre.id.toString())
                      setShowGenres(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-150"
                  >
                    {genre.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Streaming Provider Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              setShowGenres(false)
              setShowSort(false)
              setShowProviders(!showProviders)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              filters.provider
                ? "bg-[#e5e5e5] text-[#0f0f0f] border-[#e5e5e5]"
                : "bg-[#181818] text-white border-[#2a2a2a] hover:bg-[#222222]"
            }`}
          >
            {getProviderName()}
            <ChevronDown className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showProviders && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 bg-[#222222] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl z-50 min-w-56 max-h-80 overflow-y-auto"
              >
                <button
                  onClick={() => {
                    updateFilter("provider", "")
                    setShowProviders(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-150 border-b border-[#2a2a2a]"
                >
                  All Platforms
                </button>
                {providers.map((provider) => (
                  <button
                    key={provider.provider_id}
                    onClick={() => {
                      updateFilter("provider", provider.provider_id.toString())
                      setShowProviders(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center gap-3"
                  >
                    {provider.logo_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span>{provider.provider_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort By */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              setShowGenres(false)
              setShowProviders(false)
              setShowSort(!showSort)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[#181818] text-white border border-[#2a2a2a] hover:bg-[#222222]"
          >
            {SORT_OPTIONS.find((s) => s.value === filters.sort_by)?.label || "Sort By"}
            <ChevronDown className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 bg-[#222222] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl z-50 min-w-48"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter("sort_by", option.value)
                      setShowSort(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-150"
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#2a2a2a] text-[#b3b3b3] hover:bg-[#222222] border border-[#2a2a2a] transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            Reset
          </motion.button>
        )}
      </div>
    </div>
  )
}