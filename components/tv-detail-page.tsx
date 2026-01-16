"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Plus, ChevronDown, Loader2 } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { tvAPI, watchlistAPI, ratingsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

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
}

export function TVDetailPage({ tvId }: { tvId: string }) {
  const [show, setShow] = useState<TVShow | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [similarShows, setSimilarShows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRatingMenu, setShowRatingMenu] = useState(false)
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const ratingOptions = [
    { value: "skip", label: "Skip" },
    { value: "timepass", label: "Timepass" },
    { value: "go_for_it", label: "Go for it" },
    { value: "perfection", label: "Perfection" },
  ]

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [showData, creditsData, videosData] = await Promise.all([
          tvAPI.getDetails(parseInt(tvId)),
          tvAPI.getCredits(parseInt(tvId)),
          tvAPI.getVideos(parseInt(tvId)),
        ])

        setShow(showData)
        setCast(creditsData.cast?.slice(0, 10) || [])

        const trailerVideo = videosData.results?.find(
          (v: Video) => v.type === "Trailer" && v.site === "YouTube"
        ) || videosData.results?.[0]
        setTrailer(trailerVideo || null)

        const trendingData = await tvAPI.getTrending()
        const transformedShows = trendingData.results.slice(0, 8).map((s: any) => ({
          id: s.id,
          title: s.name,
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
          year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        }))
        setSimilarShows(transformedShows)

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
      alert("Added to watchlist!")
    } catch (error) {
      alert("Failed to add to watchlist. Please login first.")
    } finally {
      setIsAddingToWatchlist(false)
    }
  }

  const handleRating = async (ratingValue: string) => {
    try {
      await ratingsAPI.create({ tmdb_id: parseInt(tvId), media_type: "tv", rating: ratingValue })
      setShowRatingMenu(false)
      alert(`Rated as ${ratingOptions.find(r => r.value === ratingValue)?.label}!`)
    } catch (error) {
      alert("Failed to rate. Please login first.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || "TV show not found"}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/tv")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Go to TV Shows
          </motion.button>
        </div>
      </div>
    )
  }

  const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder.svg"
  const backdropUrl = show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : "/placeholder.svg"
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null
const avgRuntime = show.episode_run_time?.[0] || 45
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 md:h-125 overflow-hidden"
      >
        <img
          src={backdropUrl}
          alt={show.name}
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="glass-dark rounded-lg overflow-hidden">
              <img
                src={posterUrl}
                alt={show.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-5 space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{show.name}</h1>
              {show.tagline && <p className="text-lg text-muted-foreground italic">{show.tagline}</p>}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(show.vote_average / 2) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">{show.vote_average.toFixed(1)}/10</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-secondary/50 text-sm text-foreground border border-white/10"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">First Air Date</p>
                  <p className="text-foreground font-semibold">
                    {new Date(show.first_air_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seasons</p>
                  <p className="text-foreground font-semibold">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Episodes</p>
                  <p className="text-foreground font-semibold">{show.number_of_episodes} Episodes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Episode Runtime</p>
                  <p className="text-foreground font-semibold">{avgRuntime} min</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToWatchlist}
                disabled={isAddingToWatchlist}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isAddingToWatchlist ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Add to Watchlist
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRatingMenu(!showRatingMenu)}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-colors border border-white/10"
                >
                  Rate
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                {showRatingMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 bg-secondary border border-white/10 rounded-lg overflow-hidden z-20 min-w-full"
                  >
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleRating(option.value)}
                        className="block w-full px-6 py-2 text-foreground hover:bg-secondary/80 transition-colors text-left whitespace-nowrap"
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-foreground mb-3">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">{show.overview}</p>
            </div>
          </motion.div>
        </div>

        {trailerUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Trailer</h3>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden glass-dark">
              <iframe
                width="100%"
                height="100%"
                src={trailerUrl}
                title="TV Show Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          </motion.div>
        )}

        {cast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Cast</h3>
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-2">
              {cast.map((member) => (
                <div key={member.id} className="shrink-0 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden glass-dark mb-3 mx-auto">
                    <img
                      src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{member.name}</h4>
                  <p className="text-xs text-muted-foreground">{member.character}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {similarShows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Similar Shows</h3>
            <div className="relative">
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {similarShows.map((show) => (
                  <motion.div key={show.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shrink-0">
                    <MovieCard movie={show} mediaType="tv" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}