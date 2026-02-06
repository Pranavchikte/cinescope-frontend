"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  Film,
  Tv,
  Sparkles,
} from "lucide-react";
import { creatorsAPI, moviesAPI, tvAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/movie-card";

interface Rating {
  id: string;
  tmdb_id: number;
  media_type: string;
  rating: string;
  rated_at: string;
}

interface MovieData {
  id: number;
  title: string;
  rating: number;
  poster: string;
  year: number;
}

const RATING_CONFIG = {
  perfection: {
    label: "Perfection",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  go_for_it: {
    label: "Go For It",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  timepass: {
    label: "Timepass",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  skip: {
    label: "Skip",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
};

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [username, setUsername] = useState<string>("");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [moviesData, setMoviesData] = useState<{ [key: number]: MovieData }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all");
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setUsername(p.username));
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const ratingFilter = selectedRating !== "all" ? selectedRating : undefined;
        const mediaFilter = selectedMediaType !== "all" ? selectedMediaType : undefined;
        const data = await creatorsAPI.getRatings(
          username,
          ratingFilter,
          mediaFilter
        );
        setRatings(data);

        const movieIds = data
          .filter((r: Rating) => r.media_type === "movie")
          .map((r: Rating) => r.tmdb_id)
          .slice(0, 50);

        const tvIds = data
          .filter((r: Rating) => r.media_type === "tv")
          .map((r: Rating) => r.tmdb_id)
          .slice(0, 50);

        const [movieResults, tvResults] = await Promise.all([
          movieIds.length > 0
            ? moviesAPI.getBatchDetails(movieIds)
            : Promise.resolve([]),
          tvIds.length > 0 ? tvAPI.getBatchDetails(tvIds) : Promise.resolve([]),
        ]);

        const details: { [key: number]: MovieData } = {};

        movieResults.forEach((movie: any) => {
          details[movie.id] = {
            id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            poster: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "",
            year: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 2024,
          };
        });

        tvResults.forEach((show: any) => {
          details[show.id] = {
            id: show.id,
            title: show.name,
            rating: show.vote_average,
            poster: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : "",
            year: show.first_air_date
              ? new Date(show.first_air_date).getFullYear()
              : 2024,
          };
        });

        setMoviesData(details);
      } catch (error) {
        console.error("Failed to fetch ratings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [username, selectedRating, selectedMediaType]);

  const groupedRatings = {
    perfection: ratings.filter((r) => r.rating === "perfection"),
    go_for_it: ratings.filter((r) => r.rating === "go_for_it"),
    timepass: ratings.filter((r) => r.rating === "timepass"),
    skip: ratings.filter((r) => r.rating === "skip"),
  };

  const totalRatings = ratings.length;
  const movieCount = ratings.filter((r) => r.media_type === "movie").length;
  const tvCount = ratings.filter((r) => r.media_type === "tv").length;

  const getRatingLabel = () => {
    if (selectedRating === "all") return "All Ratings";
    return (
      RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG]?.label ||
      "All Ratings"
    );
  };

  const getMediaLabel = () => {
    if (selectedMediaType === "all") return "All Types";
    return selectedMediaType === "movie" ? "Movies" : "TV Shows";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/creator-picks")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Creators</span>
        </button>

        {/* Creator Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <span className="text-4xl sm:text-5xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {username}
              </h1>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-slate-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>
                    {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>
                    {movieCount} {movieCount === 1 ? "movie" : "movies"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <span>
                    {tvCount} {tvCount === 1 ? "show" : "shows"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {/* Rating Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRatingDropdown(!showRatingDropdown);
                setShowMediaDropdown(false);
              }}
              className="h-10 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-slate-800/50 text-white border-slate-700 hover:border-slate-600 rounded-lg whitespace-nowrap"
            >
              {getRatingLabel()}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showRatingDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showRatingDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRatingDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 bg-slate-900 backdrop-blur-md border border-slate-700 shadow-2xl z-50 min-w-[200px] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setSelectedRating("all");
                        setShowRatingDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedRating === "all"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      All Ratings
                    </button>
                    <div className="h-px bg-slate-800" />
                    {Object.entries(RATING_CONFIG).map(([key, config]) => {
                      const count =
                        groupedRatings[key as keyof typeof groupedRatings].length;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedRating(key);
                            setShowRatingDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                            selectedRating === key
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                          }`}
                        >
                          <span className={config.color}>{config.label}</span>
                          <span className="text-xs text-slate-500">{count}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Media Type Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMediaDropdown(!showMediaDropdown);
                setShowRatingDropdown(false);
              }}
              className="h-10 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-slate-800/50 text-white border-slate-700 hover:border-slate-600 rounded-lg whitespace-nowrap"
            >
              {getMediaLabel()}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showMediaDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showMediaDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMediaDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 bg-slate-900 backdrop-blur-md border border-slate-700 shadow-2xl z-50 min-w-[180px] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setSelectedMediaType("all");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedMediaType === "all"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      All Types
                    </button>
                    <div className="h-px bg-slate-800" />
                    <button
                      onClick={() => {
                        setSelectedMediaType("movie");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedMediaType === "movie"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      <span>Movies</span>
                      <span className="text-xs text-slate-500">{movieCount}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMediaType("tv");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedMediaType === "tv"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      <span>TV Shows</span>
                      <span className="text-xs text-slate-500">{tvCount}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {ratings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <h3 className="text-2xl font-semibold text-white mb-2">
                No titles found
              </h3>
              <p className="text-slate-400">
                {selectedRating !== "all" || selectedMediaType !== "all"
                  ? "Try adjusting your filters"
                  : "This creator hasn't rated anything yet"}
              </p>
            </div>
          ) : selectedRating === "all" ? (
            /* Grouped by Rating */
            <div className="space-y-12">
              {Object.entries(groupedRatings).map(([ratingType, items]) => {
                if (items.length === 0) return null;
                const config =
                  RATING_CONFIG[ratingType as keyof typeof RATING_CONFIG];
                return (
                  <div key={ratingType}>
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`${config.bg} ${config.border} border px-4 py-2 rounded-lg`}
                      >
                        <h2 className={`text-lg font-semibold ${config.color}`}>
                          {config.label}
                        </h2>
                      </div>
                      <span className="text-sm text-slate-500">
                        {items.length} {items.length === 1 ? "title" : "titles"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                      {items.map((rating) => {
                        const movieData = moviesData[rating.tmdb_id];
                        if (!movieData) return null;
                        return (
                          <div key={rating.id}>
                            <MovieCard
                              movie={movieData}
                              mediaType={rating.media_type as "movie" | "tv"}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Filtered View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {ratings.map((rating) => {
                const movieData = moviesData[rating.tmdb_id];
                if (!movieData) return null;
                return (
                  <div key={rating.id}>
                    <MovieCard
                      movie={movieData}
                      mediaType={rating.media_type as "movie" | "tv"}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  );
}
