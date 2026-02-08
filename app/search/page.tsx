'use client'

import { moviesAPI, tvAPI } from '@/lib/api'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Film, Tv, AlertCircle } from 'lucide-react'
import { MovieCard } from '@/components/movie-card'
import { MovieCardSkeleton } from '@/components/movie-card-skeleton'

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
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<any[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all')
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

  // Ripple effect handler
  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }))

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }))
    }, 600)
  }

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

        const transformMovie = (m: any) => {
          const popularity = m.popularity || 0
          const vote_count = Math.max(m.vote_count || 0, 1)
          const vote_average = m.vote_average || 5.0

          const searchScore =
            popularity * (1 + Math.log10(vote_count)) * (vote_average / 10)

          return {
            id: m.id,
            title: m.title,
            rating: m.vote_average,
            poster: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : '',
            year: m.release_date
              ? new Date(m.release_date).getFullYear()
              : 2024,
            mediaType: 'movie' as const,
            searchScore,
          }
        }

        const transformTV = (s: any) => {
          const popularity = s.popularity || 0
          const vote_count = Math.max(s.vote_count || 0, 1)
          const vote_average = s.vote_average || 5.0

          const searchScore =
            popularity * (1 + Math.log10(vote_count)) * (vote_average / 10)

          return {
            id: s.id,
            title: s.name,
            rating: s.vote_average,
            poster: s.poster_path
              ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
              : '',
            year: s.first_air_date
              ? new Date(s.first_air_date).getFullYear()
              : 2024,
            mediaType: 'tv' as const,
            searchScore,
          }
        }

        const allResults = [
          ...moviesData.results.map(transformMovie),
          ...tvData.results.map(transformTV),
        ].sort((a, b) => b.searchScore - a.searchScore)

        setResults(allResults)
        setFilteredResults(allResults)
      } catch (err) {
        console.error('Search failed:', err)
        setError('Failed to search. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  useEffect(() => {
    let filtered = [...results]

    if (mediaFilter !== 'all') {
      filtered = filtered.filter((item) => item.mediaType === mediaFilter)
    }

    setFilteredResults(filtered)
  }, [results, mediaFilter])

  const movieCount = results.filter((r) => r.mediaType === 'movie').length
  const tvCount = results.filter((r) => r.mediaType === 'tv').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-32">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="h-10 bg-[#1A1A1A] rounded-lg w-64 mb-3 animate-pulse" />
          <div className="h-5 bg-[#1A1A1A] rounded w-96 mb-12 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg backdrop-blur-xl"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">
            Something went wrong
          </h2>
          <p className="text-[#A0A0A0] mb-8">{error}</p>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'error-home')
              router.push('/')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all relative overflow-hidden group"
          >
            {/* Ripple effect */}
            {ripples['error-home']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            
            {/* Gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }} />
            
            <span className="relative z-10">Go Home</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const isEmpty = filteredResults.length === 0

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-32 pb-12">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">
            {query ? `Search results for "${query}"` : 'Search Results'}
          </h1>
          {!isEmpty && (
            <p className="text-base text-[#A0A0A0] flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block w-2 h-2 bg-[#14B8A6] rounded-full"
              />
              {filteredResults.length}{' '}
              {filteredResults.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </motion.div>

        {/* Filter Tabs */}
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-2 mb-8 pb-4 border-b border-[#2A2A2A]"
          >
            {[
              { key: 'all', label: 'All', count: results.length, icon: null },
              { key: 'movie', label: 'Movies', count: movieCount, icon: Film },
              { key: 'tv', label: 'TV Shows', count: tvCount, icon: Tv },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                onClick={(e) => {
                  handleRipple(e, `filter-${filter.key}`)
                  setMediaFilter(filter.key as 'all' | 'movie' | 'tv')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative overflow-hidden group ${
                  mediaFilter === filter.key
                    ? 'bg-[#14B8A6] text-[#0F0F0F]'
                    : 'text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#1A1A1A]/50 border border-[#2A2A2A] backdrop-blur-xl'
                }`}
              >
                {/* Ripple effect */}
                {ripples[`filter-${filter.key}`]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                
                {/* Gradient glow for active tab */}
                {mediaFilter === filter.key && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)' }} />
                  </>
                )}
                
                {/* Gradient glow for inactive tabs */}
                {mediaFilter !== filter.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {filter.icon && (
                  <filter.icon className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span className="relative z-10">
                  {filter.label} ({filter.count})
                </span>
              </motion.button>
            ))}
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
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-16 h-16 mb-6 flex items-center justify-center bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-lg backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Search className="w-8 h-8 text-[#A0A0A0] relative z-10" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">
                No results found
              </h2>
              <p className="text-[#A0A0A0] text-center max-w-md mb-8">
                {query
                  ? `We couldn't find any titles matching "${query}". Try different keywords.`
                  : 'Try searching for movies or TV shows'}
              </p>
              <motion.button
                onClick={(e) => {
                  handleRipple(e, 'browse-titles')
                  router.push('/')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all relative overflow-hidden group"
              >
                {/* Ripple effect */}
                {ripples['browse-titles']?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                
                {/* Gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }} />
                
                <span className="relative z-10">Browse Titles</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
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
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
              <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin relative z-10" />
            </div>
            <p className="text-sm text-[#A0A0A0] animate-pulse">Searching...</p>
          </motion.div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}