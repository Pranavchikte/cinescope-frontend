"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Star, Film, Tv, ChevronDown } from "lucide-react";
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
    color: "text-[#46d369]",
  },
  go_for_it: {
    label: "Go For It",
    color: "text-white",
  },
  timepass: {
    label: "Timepass",
    color: "text-white",
  },
  skip: {
    label: "Skip",
    color: "text-[#808080]",
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
        const data = await creatorsAPI.getRatings(username, ratingFilter, mediaFilter);
        setRatings(data);

        // Fetch movie/TV details for each rating
        const details: { [key: number]: MovieData } = {};
        for (const rating of data.slice(0, 50)) {
          try {
            let itemData;
            if (rating.media_type === "movie") {
              itemData = await moviesAPI.getDetails(rating.tmdb_id);
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.title,
                rating: itemData.vote_average,
                poster: itemData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}`
                  : "",
                year: itemData.release_date
                  ? new Date(itemData.release_date).getFullYear()
                  : 2024,
              };
            } else {
              itemData = await tvAPI.getDetails(rating.tmdb_id);
              details[rating.tmdb_id] = {
                id: itemData.id,
                title: itemData.name,
                rating: itemData.vote_average,
                poster: itemData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${itemData.poster_path}`
                  : "",
                year: itemData.first_air_date
                  ? new Date(itemData.first_air_date).getFullYear()
                  : 2024,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch details for ${rating.tmdb_id}`);
          }
        }
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
    return RATING_CONFIG[selectedRating as keyof typeof RATING_CONFIG]?.label || "All Ratings";
  };

  const getMediaLabel = () => {
    if (selectedMediaType === "all") return "All Types";
    return selectedMediaType === "movie" ? "Movies" : "TV Shows";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-sm text-[#808080]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20">
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/creator-picks")}
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* Creator Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#E50914] rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {username}
              </h1>
              <p className="text-sm text-[#808080]">
                {totalRatings} {totalRatings === 1 ? "rating" : "ratings"} • {movieCount}{" "}
                {movieCount === 1 ? "movie" : "movies"} • {tvCount}{" "}
                {tvCount === 1 ? "show" : "shows"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {/* Rating Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRatingDropdown(!showRatingDropdown);
                setShowMediaDropdown(false);
              }}
              className="h-9 px-4 text-sm font-normal transition-all flex items-center gap-2 border bg-transparent text-white border-[#808080]/50 hover:border-white whitespace-nowrap"
            >
              {getRatingLabel()}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showRatingDropdown ? "rotate-180" : ""}`}
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
                    className="absolute top-full mt-1 left-0 bg-[#181818]/98 backdrop-blur-md border border-[#333333] shadow-2xl z-50 min-w-[180px]"
                  >
                    <button
                      onClick={() => {
                        setSelectedRating("all");
                        setShowRatingDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedRating === "all"
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                      }`}
                    >
                      All Ratings
                    </button>
                    <div className="h-px bg-[#333333]" />
                    {Object.entries(RATING_CONFIG).map(([key, config]) => {
                      const count = groupedRatings[key as keyof typeof groupedRatings].length;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedRating(key);
                            setShowRatingDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                            selectedRating === key
                              ? "bg-[#2a2a2a] text-white"
                              : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                          }`}
                        >
                          <span className={config.color}>{config.label}</span>
                          <span className="text-xs text-[#808080]">{count}</span>
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
              className="h-9 px-4 text-sm font-normal transition-all flex items-center gap-2 border bg-transparent text-white border-[#808080]/50 hover:border-white whitespace-nowrap"
            >
              {getMediaLabel()}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showMediaDropdown ? "rotate-180" : ""}`}
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
                    className="absolute top-full mt-1 left-0 bg-[#181818]/98 backdrop-blur-md border border-[#333333] shadow-2xl z-50 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        setSelectedMediaType("all");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedMediaType === "all"
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                      }`}
                    >
                      All Types
                    </button>
                    <div className="h-px bg-[#333333]" />
                    <button
                      onClick={() => {
                        setSelectedMediaType("movie");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedMediaType === "movie"
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                      }`}
                    >
                      <span>Movies</span>
                      <span className="text-xs text-[#808080]">{movieCount}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMediaType("tv");
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedMediaType === "tv"
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                      }`}
                    >
                      <span>TV Shows</span>
                      <span className="text-xs text-[#808080]">{tvCount}</span>
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
              <h3 className="text-2xl font-medium text-white mb-3">No titles found</h3>
              <p className="text-base text-[#808080]">
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
                const config = RATING_CONFIG[ratingType as keyof typeof RATING_CONFIG];
                return (
                  <div key={ratingType}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className={`text-xl md:text-2xl font-medium ${config.color}`}>
                        {config.label}
                      </h2>
                      <span className="text-sm text-[#808080]">({items.length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2">
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