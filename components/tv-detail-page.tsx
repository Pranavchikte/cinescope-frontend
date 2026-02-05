"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Plus, Loader2, ArrowLeft, Share2, Play, ChevronLeft, ChevronRight, Tv } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { tvAPI, watchlistAPI, ratingsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

interface TVShow {
  id: number
  name: string
  tagline: string
  vote_average: number
  genres: { id: number; name: string }[]
  first_air_date: string
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  status: string
}

export function TVDetailPage({ tvId }: { tvId: string }) {
  const [show, setShow] = useState<TVShow | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [similarShows, setSimilarShows] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [images, setImages] = useState<{ backdrops: any[]; posters: any[] }>({ backdrops: [], posters: [] })
  const [activeMediaTab, setActiveMediaTab] = useState<'videos' | 'backdrops' | 'posters'>('videos')
  const [seasons, setSeasons] = useState<any[]>([])
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)
  const [seasonData, setSeasonData] = useState<{ [key: number]: any }>({})
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
    const fetchShowData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [showData, creditsData, videosData, providersData, imagesData] = await Promise.all([
          tvAPI.getDetails(parseInt(tvId)),
          tvAPI.getCredits(parseInt(tvId)),
          tvAPI.getVideos(parseInt(tvId)),
          tvAPI.getTVProviders(parseInt(tvId)),
          tvAPI.getImages(parseInt(tvId)),
        ])

        setShow(showData)
        setCast(creditsData.cast?.slice(0, 15) || [])

        const trailerVideo = videosData.results?.find(
          (v: Video) => v.type === "Trailer" && v.site === "YouTube"
        ) || videosData.results?.[0]
        setTrailer(trailerVideo || null)

        const inProviders = providersData.results?.IN?.flatrate || []
        setProviders(inProviders)

        setImages({
          backdrops: imagesData.backdrops?.slice(0, 12) || [],
          posters: imagesData.posters?.slice(0, 12) || [],
        })

        const [recommendationsData, similarData] = await Promise.all([
          tvAPI.getRecommendations(parseInt(tvId)),
          tvAPI.getSimilar(parseInt(tvId)),
        ])

        const transformShow = (s: any) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        })

        setRecommendations(recommendationsData.results?.slice(0, 12).map(transformShow) || [])
        setSimilarShows(similarData.results?.slice(0, 12).map(transformShow) || [])

        // Create seasons array
        const seasonsArr = Array.from({ length: showData.number_of_seasons }, (_, i) => ({
          season_number: i + 1,
          name: `Season ${i + 1}`
        }))
        setSeasons(seasonsArr)

      } catch (err) {
        console.error("Failed to fetch TV show data:", err)
        setError("Failed to load TV show details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShowData()
  }, [tvId])

  const handleAddToWatchlist = async () => {
    setIsAddingToWatchlist(true)
    try {
      await watchlistAPI.add({ tmdb_id: parseInt(tvId), media_type: "tv" })
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
      await ratingsAPI.create({ tmdb_id: parseInt(tvId), media_type: "tv", rating: ratingValue })
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

  const handleSeasonToggle = async (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null)
      return
    }

    setExpandedSeason(seasonNumber)

    // Fetch season data if not already loaded
    if (!seasonData[seasonNumber]) {
      try {
        const data = await tvAPI.getSeason(parseInt(tvId), seasonNumber)
        setSeasonData(prev => ({ ...prev, [seasonNumber]: data }))
      } catch (err) {
        console.error("Failed to fetch season data:", err)
      }
    }
  }


  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] bg-zinc-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="aspect-[2/3] bg-zinc-800 rounded-xl animate-pulse" />
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
  if (error || !show) {
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
          <p className="text-zinc-400 mb-8">{error || "TV show not found"}</p>
          <Button
            onClick={() => router.push("/tv")}
            className="bg-white hover:bg-zinc-200 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to TV Shows
          </Button>
        </motion.div>
      </div>
    )
  }

  const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder.svg"
  const backdropUrl = show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : "/placeholder.svg"
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0` : null
  const avgRuntime = show.episode_run_time?.[0] || 45

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-50 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-black/90 hover:border-white/20 transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </motion.button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
      >
        <img
          src={backdropUrl}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        
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
                  alt={show.name}
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <Tv className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-sm font-medium text-violet-400 uppercase tracking-wide">
                  TV Series
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-base md:text-lg text-zinc-400 italic">{show.tagline}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(show.vote_average / 2) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-white">
                {show.vote_average.toFixed(1)}<span className="text-zinc-500">/10</span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {show.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-sm text-white border border-white/10"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Details Grid - TV Specific */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-zinc-500 mb-1">First Air Date</p>
                <p className="text-base font-medium text-white">
                  {new Date(show.first_air_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Status</p>
                <p className="text-base font-medium text-white capitalize">
                  {show.status || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Seasons</p>
                <p className="text-base font-medium text-white">
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Episodes</p>
                <p className="text-base font-medium text-white">
                  {show.number_of_episodes} Episodes
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Episode Runtime</p>
                <p className="text-base font-medium text-white">{avgRuntime} min</p>
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
                    title: show.name,
                    text: show.tagline || show.overview,
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
                {show.overview}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Watch Providers */}
        {providers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Available On</h2>
            <div className="flex flex-wrap gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-10 h-10 rounded-lg"
                  />
                  <span className="text-white font-medium text-sm">
                    {provider.provider_name}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

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
                title="TV Show Trailer"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.section>
        )}

        {(trailer || images.backdrops.length > 0 || images.posters.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Media</h2>
            
            <div className="flex gap-2 mb-6 border-b border-white/10">
              {trailer && (
                <button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === 'videos'
                      ? 'text-white border-b-2 border-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Videos
                </button>
              )}
              {images.backdrops.length > 0 && (
                <button
                  onClick={() => setActiveMediaTab('backdrops')}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === 'backdrops'
                      ? 'text-white border-b-2 border-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Backdrops {images.backdrops.length}
                </button>
              )}
              {images.posters.length > 0 && (
                <button
                  onClick={() => setActiveMediaTab('posters')}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === 'posters'
                      ? 'text-white border-b-2 border-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Posters {images.posters.length}
                </button>
              )}
            </div>

            {activeMediaTab === 'videos' && trailer && (
              <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="Video"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {activeMediaTab === 'backdrops' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.backdrops.map((image, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                      alt="Backdrop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeMediaTab === 'posters' && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.posters.map((image, index) => (
                  <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                      alt="Poster"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
                <Link
                  key={member.id}
                  href={`/people/${member.id}`}
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
                </Link>
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

        {/* Seasons & Episodes */}
        {seasons.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Seasons</h2>
            <div className="space-y-3">
              {seasons.map((season) => (
                <div key={season.season_number} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                  <button
                    onClick={() => handleSeasonToggle(season.season_number)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <span className="text-white font-semibold">{season.name}</span>
                    <ChevronRight
                      className={`w-5 h-5 text-white transition-transform ${
                        expandedSeason === season.season_number ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {expandedSeason === season.season_number && seasonData[season.season_number] && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      {seasonData[season.season_number].episodes?.map((episode: any) => (
                        <div
                          key={episode.episode_number}
                          className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <div className="flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                            {episode.still_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                alt={episode.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-8 h-8 text-zinc-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-semibold">
                                {episode.episode_number}. {episode.name}
                              </h4>
                              {episode.vote_average > 0 && (
                                <div className="flex items-center gap-1 ml-4">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-zinc-400">{episode.vote_average.toFixed(1)}</span>
                                </div>
                              )}
                            </div>

                            {episode.air_date && (
                              <p className="text-sm text-zinc-500 mb-2">
                                {new Date(episode.air_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            )}

                            {episode.overview && (
                              <p className="text-sm text-zinc-300 line-clamp-2">{episode.overview}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              {recommendations.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <MovieCard movie={show} mediaType="tv" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Shows Grid */}
        {similarShows.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {similarShows.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <MovieCard movie={show} mediaType="tv" />
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
            <SheetTitle className="text-white text-base">Rate: {show.name}</SheetTitle>
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