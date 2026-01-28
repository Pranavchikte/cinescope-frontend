"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Star } from "lucide-react"
import { creatorsAPI, moviesAPI, tvAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { MovieCard } from "@/components/movie-card"

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

export default function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>("")
  const [ratings, setRatings] = useState<Rating[]>([])
  const [moviesData, setMoviesData] = useState<{ [key: number]: MovieData }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    params.then((p) => setUsername(p.username))
  }, [params])

  useEffect(() => {
    if (!username) return

    const fetchRatings = async () => {
      try {
        setIsLoading(true)
        const ratingFilter = selectedRating !== "all" ? selectedRating : undefined
        const mediaFilter = selectedMediaType !== "all" ? selectedMediaType : undefined
        const data = await creatorsAPI.getRatings(username, ratingFilter, mediaFilter)
        setRatings(data)

        // Fetch movie/TV details for each rating
        const details: { [key: number]: MovieData } = {}
        for (const rating of data.slice(0, 20)) {
          try {
            let itemData
            if (rating.media_type === "movie") {
              itemData = await moviesAPI.getDetails(rating.tmdb_id)
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.title,
                rating: itemData.vote_average,
                poster: itemData.poster_path ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}` : "",
                year: itemData.release_date ? new Date(itemData.release_date).getFullYear() : 2024,
              }
            } else {
              itemData = await tvAPI.getDetails(rating.tmdb_id)
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.name,
                rating: itemData.vote_average,
                poster: itemData.poster_path ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}` : "",
                year: itemData.first_air_date ? new Date(itemData.first_air_date).getFullYear() : 2024,
              }
            }
          } catch (err) {
            console.error(`Failed to fetch details for ${rating.tmdb_id}`)
          }
        }
        setMoviesData(details)
      } catch (error) {
        console.error("Failed to fetch ratings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatings()
  }, [username, selectedRating, selectedMediaType])

  const getRatingLabel = (rating: string) => {
    const labels: { [key: string]: string } = {
      perfection: "Perfection",
      go_for_it: "Go For It",
      timepass: "Timepass",
      skip: "Skip",
    }
    return labels[rating] || rating
  }

  const getRatingColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      perfection: "text-green-500",
      go_for_it: "text-blue-500",
      timepass: "text-yellow-500",
      skip: "text-red-500",
    }
    return colors[rating] || "text-foreground"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  const groupedRatings = {
    perfection: ratings.filter((r) => r.rating === "perfection"),
    go_for_it: ratings.filter((r) => r.rating === "go_for_it"),
    timepass: ratings.filter((r) => r.rating === "timepass"),
    skip: ratings.filter((r) => r.rating === "skip"),
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/creator-picks")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Creators
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">@{username}'s Picks</h1>
          <p className="text-muted-foreground">Movie and TV show recommendations</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-4 py-2 bg-secondary rounded-lg text-foreground border border-white/10"
          >
            <option value="all">All Ratings</option>
            <option value="perfection">Perfection</option>
            <option value="go_for_it">Go For It</option>
            <option value="timepass">Timepass</option>
            <option value="skip">Skip</option>
          </select>

          <select
            value={selectedMediaType}
            onChange={(e) => setSelectedMediaType(e.target.value)}
            className="px-4 py-2 bg-secondary rounded-lg text-foreground border border-white/10"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
        </div>

        {/* Ratings by Category */}
        {selectedRating === "all" ? (
          <>
            {Object.entries(groupedRatings).map(([ratingType, items]) => {
              if (items.length === 0) return null
              return (
                <div key={ratingType} className="mb-12">
                  <h2 className={`text-2xl font-bold mb-4 ${getRatingColor(ratingType)}`}>
                    {getRatingLabel(ratingType)} ({items.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {items.map((rating) => {
                      const movieData = moviesData[rating.tmdb_id]
                      if (!movieData) return null
                      return (
                        <motion.div
                          key={rating.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <MovieCard movie={movieData} mediaType={rating.media_type as "movie" | "tv"} />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {ratings.map((rating) => {
              const movieData = moviesData[rating.tmdb_id]
              if (!movieData) return null
              return (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MovieCard movie={movieData} mediaType={rating.media_type as "movie" | "tv"} />
                </motion.div>
              )
            })}
          </div>
        )}

        {ratings.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Ratings Yet</h2>
            <p className="text-muted-foreground">This creator hasn't rated any content yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}