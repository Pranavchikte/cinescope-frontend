"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Plus, ChevronDown, Loader2, ArrowLeft, Share2, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { moviesAPI, watchlistAPI, ratingsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

interface Movie {
  id: number
  title: string
  tagline: string
  vote_average: number
  genres: { id: number; name: string }[]
  release_date: string
  runtime: number
  overview: string
  poster_path: string | null
  backdrop_path: string | null
}

export function MovieDetailPage({ movieId }: { movieId: string }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRatingSheet, setShowRatingSheet] = useState(false)
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAllCast, setShowAllCast] = useState(false)
  const castScrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const ratingOptions = [
    { value: "skip", label: "Skip", icon: "⏭️", color: "text-zinc-400" },
    { value: "timepass", label: "Timepass", icon: "⏱️", color: "text-white" },
    { value: "go_for_it", label: "Go for it", icon: "👍", color: "text-white" },
    { value: "perfection", label: "Perfection", icon: "✨", color: "text-yellow-400" },
  ]

  const showNotification = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3000)
  }

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [movieData, creditsData, videosData] = await Promise.all([
          moviesAPI.getDetails(parseInt(movieId)),
          moviesAPI.getCredits(parseInt(movieId)),
          moviesAPI.getVideos(parseInt(movieId)),
        ])

        setMovie(movieData)
        setCast(creditsData.cast?.slice(0, 15) || [])

        const trailerVideo = videosData.results?.find(
          (v: Video) => v.type === "Trailer" && v.site === "YouTube"
        ) || videosData.results?.[0]
        setTrailer(trailerVideo || null)

        const [recommendationsData, similarData] = await Promise.all([
          moviesAPI.getRecommendations(parseInt(movieId)),
          moviesAPI.getSimilar(parseInt(movieId)),
        ])

        const transformMovie = (m: any) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        })

        setRecommendations(recommendationsData.results?.slice(0, 12).map(transformMovie) || [])
        setSimilarMovies(similarData.results?.slice(0, 12).map(transformMovie) || [])

      } catch (err) {
        console.error("Failed to fetch movie data:", err)
        setError("Failed to load movie details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieData()
  }, [movieId])

  const handleAddToWatchlist = async () => {
    setIsAddingToWatchlist(true)
    try {
      await watchlistAPI.add({ tmdb_id: parseInt(movieId), media_type: "movie" })
      showNotification("Added to watchlist!", "success")
    } catch (error: any) {
      const errorText = error.message || ""
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error")
      } else {
        showNotification("Failed. Please login first.", "error")
      }
    } finally {
      setIsAddingToWatchlist(false)
    }
  }

  const handleRating = async (ratingValue: string) => {
    try {
      await ratingsAPI.create({ tmdb_id: parseInt(movieId), media_type: "movie", rating: ratingValue })
      setShowRatingSheet(false)
      showNotification(`Rated as ${ratingOptions.find(r => r.value === ratingValue)?.label}!`, "success")
    } catch (error: any) {
      const errorText = error.message || ""
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error")
      } else {
        showNotification("Failed to rate. Please login first.", "error")
      }
    }
  }

  const scrollCast = (direction: 'left' | 'right') => {
    if (castScrollRef.current) {
      const scrollAmount = 300
      castScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Hero Skeleton */}
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] bg-zinc-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] bg-zinc-800 rounded-xl animate-pulse" />
            
            {/* Info Skeleton */}
            <div className="md:col-span-2 space-y-6">
              <div className="h-12 bg-zinc-800 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-zinc-800 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">😕</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
          <p className="text-zinc-400 mb-8">{error || "Movie not found"}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-white hover:bg-zinc-200 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </motion.div>
      </div>
    )
  }

  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg"
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "/placeholder.svg"
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0` : null

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button - Fixed on mobile */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-50 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-black/90 hover:border-white/20 transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </motion.button>

      {/* Hero Section with Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
      >
        <img
          src={backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        
        {/* Play Trailer Button (if available) */}
        {trailerUrl && (
          <motion.a
            href={`#trailer`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-8 right-8 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all group"
          >
            <Play className="w-6 h-6 text-white ml-1 group-hover:scale-110 transition-transform" />
          </motion.a>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center md:justify-start"
          >
            <div className="w-full max-w-[280px] md:max-w-none">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Title & Tagline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-base md:text-lg text-zinc-400 italic">{movie.tagline}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(movie.vote_average / 2) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-white">
                {movie.vote_average.toFixed(1)}<span className="text-zinc-500">/10</span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-sm text-white border border-white/10"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Release Date</p>
                <p className="text-base font-medium text-white">
                  {new Date(movie.release_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Runtime</p>
                <p className="text-base font-medium text-white">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAddToWatchlist}
                disabled={isAddingToWatchlist}
                className="flex-1 sm:flex-none h-12 px-6 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isAddingToWatchlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowRatingSheet(true)}
                className="flex-1 sm:flex-none h-12 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-xl transition-all"
              >
                <Star className="w-5 h-5 mr-2" />
                Rate
              </Button>

              <Button
                onClick={() => {
                  navigator.share?.({
                    title: movie.title,
                    text: movie.tagline || movie.overview,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href)
                    showNotification("Link copied!", "success")
                  })
                }}
                className="h-12 w-12 sm:w-auto sm:px-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl transition-all"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Overview */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
              <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                {movie.overview}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trailer Section */}
        {trailerUrl && (
          <motion.section
            id="trailer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Trailer</h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
              <iframe
                width="100%"
                height="100%"
                src={trailerUrl}
                title="Movie Trailer"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.section>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Cast</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCast('left')}
                  className="w-9 h-9 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => scrollCast('right')}
                  className="w-9 h-9 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div 
              ref={castScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cast.slice(0, showAllCast ? cast.length : 8).map((member) => (
                <div 
                  key={member.id} 
                  className="shrink-0 w-28 snap-start group cursor-pointer"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-zinc-800 mb-3 border-2 border-white/10 group-hover:border-white/30 transition-all">
                    <img
                      src={
                        member.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${member.profile_path}` 
                          : "/placeholder.svg"
                      }
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-white text-center line-clamp-1">
                    {member.name}
                  </h4>
                  <p className="text-xs text-zinc-500 text-center line-clamp-1">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>

            {cast.length > 8 && !showAllCast && (
              <button
                onClick={() => setShowAllCast(true)}
                className="mt-4 text-sm text-violet-400 hover:text-violet-300 font-medium"
              >
                View all {cast.length} cast members →
              </button>
            )}
          </motion.section>
        )}

        {/* Recommendations Grid */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendations.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <MovieCard movie={movie} mediaType="movie" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Movies Grid */}
        {similarMovies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {similarMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <MovieCard movie={movie} mediaType="movie" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Rating Bottom Sheet */}
      <Sheet open={showRatingSheet} onOpenChange={setShowRatingSheet}>
        <SheetContent 
          side="bottom" 
          className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-t-2xl"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-base">Rate: {movie.title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value)}
                className={`w-full min-h-[56px] px-4 py-3 text-left rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all flex items-center gap-3`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className={`text-base font-medium ${option.color}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border min-w-[200px] max-w-[90vw] md:max-w-md ${
              showToast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            <p className="text-sm font-medium text-center">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

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