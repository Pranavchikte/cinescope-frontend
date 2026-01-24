"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X } from "lucide-react"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  mediaType: "movie" | "tv"
  genres: { id: number; name: string }[]
}

export interface FilterState {
  genre: string
  year: number | null
  language: string
  country: string
  sort_by: string
}

const LANGUAGES = [
  { code: "", name: "All Languages" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "bn", name: "Bengali" },
  { code: "mr", name: "Marathi" },
  { code: "pa", name: "Punjabi" },
]

const COUNTRIES = [
  { code: "", name: "All Countries" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
]

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
]

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

export function FilterBar({ onFilterChange, mediaType, genres }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: "",
    year: null,
    language: "",
    country: "",
    sort_by: "popularity.desc",
  })

  const [showGenres, setShowGenres] = useState(false)
  const [showYears, setShowYears] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [showCountries, setShowCountries] = useState(false)
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
      sort_by: "popularity.desc",
    })
  }

  const hasActiveFilters = filters.genre || filters.year || filters.language || filters.country

  const getGenreName = () => {
    if (!filters.genre) return "Genre"
    const genre = genres.find((g) => g.id.toString() === filters.genre)
    return genre?.name || "Genre"
  }

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-white/10 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Genre Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowGenres(!showGenres)
                setShowYears(false)
                setShowLanguages(false)
                setShowCountries(false)
                setShowSort(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filters.genre
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              } border border-white/10`}
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
                  className="absolute top-full mt-2 left-0 bg-secondary border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-48 max-h-64 overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      updateFilter("genre", "")
                      setShowGenres(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
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
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                    >
                      {genre.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowYears(!showYears)
                setShowGenres(false)
                setShowLanguages(false)
                setShowCountries(false)
                setShowSort(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filters.year
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              } border border-white/10`}
            >
              {filters.year || "Year"}
              <ChevronDown className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showYears && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 bg-secondary border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-32 max-h-64 overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      updateFilter("year", null)
                      setShowYears(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                  >
                    All Years
                  </button>
                  {YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        updateFilter("year", year)
                        setShowYears(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowLanguages(!showLanguages)
                setShowGenres(false)
                setShowYears(false)
                setShowCountries(false)
                setShowSort(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filters.language
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              } border border-white/10`}
            >
              {LANGUAGES.find((l) => l.code === filters.language)?.name || "Language"}
              <ChevronDown className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 bg-secondary border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-48 max-h-64 overflow-y-auto"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        updateFilter("language", lang.code)
                        setShowLanguages(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Country Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowCountries(!showCountries)
                setShowGenres(false)
                setShowYears(false)
                setShowLanguages(false)
                setShowSort(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filters.country
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              } border border-white/10`}
            >
              {COUNTRIES.find((c) => c.code === filters.country)?.name || "Country"}
              <ChevronDown className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showCountries && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 bg-secondary border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-48"
                >
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        updateFilter("country", country.code)
                        setShowCountries(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                    >
                      {country.name}
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
              onClick={() => {
                setShowSort(!showSort)
                setShowGenres(false)
                setShowYears(false)
                setShowLanguages(false)
                setShowCountries(false)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-secondary/50 text-foreground hover:bg-secondary border border-white/10"
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
                  className="absolute top-full mt-2 left-0 bg-secondary border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-48"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter("sort_by", option.value)
                        setShowSort(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
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
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/50 transition-colors"
            >
              <X className="w-4 h-4" />
              Reset
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}