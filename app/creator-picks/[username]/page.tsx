'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  Film,
  Tv,
  Sparkles,
  Share2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { creatorsAPI, moviesAPI, tvAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { MovieCard } from '@/components/movie-card'

interface Rating {
  id: string
  tmdb_id: number
  media_type: string
  rating: string
  rated_at: string
}

interface MovieData {
  id: number
  title: string
  rating: number
  poster: string
  year: number
}

interface ToastMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

const RATING_CONFIG = {
  perfection: {
    label: 'Perfection',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500',
  },
  go_for_it: {
    label: 'Go For It',
    color: 'text-[#14B8A6]',
    bg: 'bg-[#14B8A6]/10',
    border: 'border-[#14B8A6]/30',
    gradient: 'from-[#14B8A6]',
  },
  timepass: {
    label: 'Timepass',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    gradient: 'from-yellow-500',
  },
  skip: {
    label: 'Skip',
    color: 'text-[#A0A0A0]',
    bg: 'bg-[#A0A0A0]/10',
    border: 'border-[#A0A0A0]/30',
    gradient: 'from-[#A0A0A0]',
  },
}

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const [username, setUsername] = useState<string>('')
  const [ratings, setRatings] = useState<Rating[]>([])
  const [moviesData, setMoviesData] = useState<{ [key: number]: MovieData }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all')
  const [showRatingDropdown, setShowRatingDropdown] = useState(false)
  const [showMediaDropdown, setShowMediaDropdown] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})
  const router = useRouter()

  // Toast management
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

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
    params.then((p) => setUsername(p.username))
  }, [params])

  useEffect(() => {
    if (!username) return

    const fetchRatings = async () => {
      try {
        setIsLoading(true)
        const ratingFilter = selectedRating !== 'all' ? selectedRating : undefined
        const mediaFilter = selectedMediaType !== 'all' ? selectedMediaType : undefined
        const data = await creatorsAPI.getRatings(
          username,
          ratingFilter,
          mediaFilter
        )
        setRatings(data)

        const movieIds = data
          .filter((r: Rating) => r.media_type === 'movie')
          .map((r: Rating) => r.tmdb_id)
          .slice(0, 50)

        const tvIds = data
          .filter((r: Rating) => r.media_type === 'tv')
          .map((r: Rating) => r.tmdb_id)
          .slice(0, 50)

        const [movieResults, tvResults] = await Promise.all([
          movieIds.length > 0
            ? moviesAPI.getBatchDetails(movieIds)
            : Promise.resolve([]),
          tvIds.length > 0 ? tvAPI.getBatchDetails(tvIds) : Promise.resolve([]),
        ])

        const details: { [key: number]: MovieData } = {}

        movieResults.forEach((movie: any) => {
          details[movie.id] = {
            id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            poster: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '',
            year: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 2024,
          }
        })

        tvResults.forEach((show: any) => {
          details[show.id] = {
            id: show.id,
            title: show.name,
            rating: show.vote_average,
            poster: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : '',
            year: show.first_air_date
              ? new Date(show.first_air_date).getFullYear()
              : 2024,
          }
        })

        setMoviesData(details)
      } catch (error) {
        console.error('Failed to fetch ratings:', error)
        showToast('error', 'Failed to load ratings. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatings()
  }, [username, selectedRating, selectedMediaType])

  const groupedRatings = {
    perfection: ratings.filter((r) => r.rating === 'perfection'),
    go_for_it: ratings.filter((r) => r.rating === 'go_for_it'),
    timepass: ratings.filter((r) => r.rating === 'timepass'),
    skip: ratings.filter((r) => r.rating === 'skip'),
  }

  const totalRatings = ratings.length
  const movieCount = ratings.filter((r) => r.media_type === 'movie').length
  const tvCount = ratings.filter((r) => r.media_type === 'tv').length

  const getRatingLabel = () => {
    if (selectedRating === 'all') return 'All Ratings'
    return (
      RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG]?.label ||
      'All Ratings'
    )
  }

  const getMediaLabel = () => {
    if (selectedMediaType === 'all') return 'All Types'
    return selectedMediaType === 'movie' ? 'Movies' : 'TV Shows'
  }

  const handleShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s Picks on CineScope`,
          text: `Check out ${username}'s curated ratings on CineScope`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('success', 'Profile link copied!')
      }
    } catch {
      if (url) {
        await navigator.clipboard.writeText(url)
        showToast('success', 'Profile link copied!')
      } else {
        showToast('error', 'Unable to share right now')
      }
    }
  }

  if (isLoading) {
    return (
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
          <p className="text-[#A0A0A0] animate-pulse">Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 relative">
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl flex items-center gap-3 min-w-[300px] ${
                toast.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-8">
        {/* Back Button */}
        <motion.button
          onClick={(e) => {
            handleRipple(e, 'back-button')
            router.push('/creator-picks')
          }}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#14B8A6] transition-all mb-8 group relative overflow-hidden px-4 py-2 rounded-lg"
        >
          {/* Ripple effect */}
          {ripples['back-button']?.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
              style={{ left: ripple.x, top: ripple.y }}
              initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
              animate={{ width: 100, height: 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
          
          {/* Gradient glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          
          <ArrowLeft className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium relative z-10">Back to Creators</span>
        </motion.button>

        {/* Creator Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#14B8A6]/20 backdrop-blur-xl relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488]" style={{ filter: 'blur(20px)' }} />
              <span className="text-4xl sm:text-5xl font-bold text-[#14B8A6] relative z-10">
                {username.charAt(0).toUpperCase()}
              </span>
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
                {username}
              </h1>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-[#A0A0A0]">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <Sparkles className="w-4 h-4 text-[#14B8A6] group-hover:scale-110 transition-transform duration-200" />
                  <span className="group-hover:text-[#F5F5F5] transition-colors duration-200">
                    {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <Film className="w-4 h-4 text-[#14B8A6] group-hover:scale-110 transition-transform duration-200" />
                  <span className="group-hover:text-[#F5F5F5] transition-colors duration-200">
                    {movieCount} {movieCount === 1 ? 'movie' : 'movies'}
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <Tv className="w-4 h-4 text-[#14B8A6] group-hover:scale-110 transition-transform duration-200" />
                  <span className="group-hover:text-[#F5F5F5] transition-colors duration-200">
                    {tvCount} {tvCount === 1 ? 'show' : 'shows'}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={(e) => {
                handleRipple(e, 'share-profile')
                handleShareProfile()
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group"
            >
              {ripples['share-profile']?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Share2 className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Share Profile</span>
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {/* Rating Filter */}
          <div className="relative">
            <motion.button
              onClick={(e) => {
                handleRipple(e, 'rating-filter')
                setShowRatingDropdown(!showRatingDropdown)
                setShowMediaDropdown(false)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Ripple effect */}
              {ripples['rating-filter']?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative z-10">{getRatingLabel()}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                  showRatingDropdown ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {showRatingDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRatingDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute top-full mt-2 left-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] shadow-2xl z-50 min-w-[200px] rounded-lg overflow-hidden"
                  >
                    <motion.button
                      onClick={(e) => {
                        handleRipple(e, 'filter-all-ratings')
                        setSelectedRating('all')
                        setShowRatingDropdown(false)
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all relative overflow-hidden group ${
                        selectedRating === 'all'
                          ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                          : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples['filter-all-ratings']?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative z-10">All Ratings</span>
                    </motion.button>
                    <div className="h-px bg-[#2A2A2A]" />
                    {Object.entries(RATING_CONFIG).map(([key, config]) => {
                      const count =
                        groupedRatings[key as keyof typeof groupedRatings].length
                      return (
                        <motion.button
                          key={key}
                          onClick={(e) => {
                            handleRipple(e, `filter-${key}`)
                            setSelectedRating(key)
                            setShowRatingDropdown(false)
                          }}
                          whileHover={{ x: 4 }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between relative overflow-hidden group ${
                            selectedRating === key
                              ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                              : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
                          }`}
                        >
                          {/* Ripple effect */}
                          {ripples[`filter-${key}`]?.map((ripple) => (
                            <motion.span
                              key={ripple.id}
                              className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                              style={{ left: ripple.x, top: ripple.y }}
                              initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                              animate={{ width: 100, height: 100, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                            />
                          ))}
                          
                          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                          <span className={`${config.color} relative z-10`}>{config.label}</span>
                          <span className="text-xs text-[#A0A0A0] relative z-10">{count}</span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Media Type Filter */}
          <div className="relative">
            <motion.button
              onClick={(e) => {
                handleRipple(e, 'media-filter')
                setShowMediaDropdown(!showMediaDropdown)
                setShowRatingDropdown(false)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Ripple effect */}
              {ripples['media-filter']?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative z-10">{getMediaLabel()}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                  showMediaDropdown ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {showMediaDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMediaDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute top-full mt-2 left-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] shadow-2xl z-50 min-w-[180px] rounded-lg overflow-hidden"
                  >
                    <motion.button
                      onClick={(e) => {
                        handleRipple(e, 'media-all')
                        setSelectedMediaType('all')
                        setShowMediaDropdown(false)
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all relative overflow-hidden group ${
                        selectedMediaType === 'all'
                          ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                          : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples['media-all']?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative z-10">All Types</span>
                    </motion.button>
                    <div className="h-px bg-[#2A2A2A]" />
                    <motion.button
                      onClick={(e) => {
                        handleRipple(e, 'media-movie')
                        setSelectedMediaType('movie')
                        setShowMediaDropdown(false)
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between relative overflow-hidden group ${
                        selectedMediaType === 'movie'
                          ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                          : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples['media-movie']?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative z-10">Movies</span>
                      <span className="text-xs text-[#A0A0A0] relative z-10">{movieCount}</span>
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        handleRipple(e, 'media-tv')
                        setSelectedMediaType('tv')
                        setShowMediaDropdown(false)
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between relative overflow-hidden group ${
                        selectedMediaType === 'tv'
                          ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                          : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {/* Ripple effect */}
                  {ripples['media-tv']?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                      animate={{ width: 100, height: 100, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative z-10">TV Shows</span>
                  <span className="text-xs text-[#A0A0A0] relative z-10">{tvCount}</span>
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Content */}
    <AnimatePresence mode="wait">
      {ratings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <h3 className="text-2xl font-semibold text-[#F5F5F5] mb-2">
            No titles found
          </h3>
          <p className="text-[#A0A0A0]">
            {selectedRating !== 'all' || selectedMediaType !== 'all'
              ? 'Try adjusting your filters'
              : "This creator hasn't rated anything yet"}
          </p>
        </motion.div>
      ) : selectedRating === 'all' ? (
        /* Grouped by Rating */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-12"
        >
          {Object.entries(groupedRatings).map(([ratingType, items], groupIndex) => {
            if (items.length === 0) return null
            const config =
              RATING_CONFIG[ratingType as keyof typeof RATING_CONFIG]
            return (
              <motion.div
                key={ratingType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`${config.bg} ${config.border} border px-4 py-2 rounded-lg backdrop-blur-xl relative overflow-hidden group cursor-default`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <h2 className={`text-lg font-semibold ${config.color} relative z-10`}>
                      {config.label}
                    </h2>
                  </motion.div>
                  <span className="text-sm text-[#A0A0A0]">
                    {items.length} {items.length === 1 ? 'title' : 'titles'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                  {items.map((rating) => {
                    const movieData = moviesData[rating.tmdb_id]
                    if (!movieData) return null
                    return (
                      <div key={rating.id}>
                        <MovieCard
                          movie={movieData}
                          mediaType={rating.media_type as 'movie' | 'tv'}
                        />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        /* Filtered View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4"
        >
          {ratings.map((rating) => {
            const movieData = moviesData[rating.tmdb_id]
            if (!movieData) return null
            return (
              <div key={rating.id}>
                <MovieCard
                  movie={movieData}
                  mediaType={rating.media_type as 'movie' | 'tv'}
                />
              </div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  {/* Bottom spacing */}
  <div className="h-20" />
</div>
)
}
