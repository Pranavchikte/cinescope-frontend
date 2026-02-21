"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  Loader2,
  ArrowLeft,
  Share2,
  Play,
  ChevronLeft,
  ChevronRight,
  Tv,
} from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { tvAPI, watchlistAPI, ratingsAPI, getCachedRatingIds, getCachedWatchlistIds } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface TVShow {
  id: number;
  name: string;
  tagline: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  first_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  status: string;
}

export function TVDetailPage({ tvId }: { tvId: string }) {
  const [show, setShow] = useState<TVShow | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [similarShows, setSimilarShows] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [images, setImages] = useState<{ backdrops: any[]; posters: any[] }>({
    backdrops: [],
    posters: [],
  });
  const [activeMediaTab, setActiveMediaTab] = useState<
    "videos" | "backdrops" | "posters"
  >("posters");
  const [seasons, setSeasons] = useState<any[]>([]);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<{ [key: number]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingSheet, setShowRatingSheet] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showAllCast, setShowAllCast] = useState(false);
  const castScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const ratingOptions = [
    { value: "skip", label: "Skip", icon: "⏭️", color: "text-zinc-400" },
    { value: "timepass", label: "Timepass", icon: "⏱️", color: "text-white" },
    { value: "go_for_it", label: "Go for it", icon: "👍", color: "text-white" },
    {
      value: "perfection",
      label: "Perfection",
      icon: "✨",
      color: "text-yellow-400",
    },
  ];

  const showNotification = (message: string, type: "success" | "error") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 🔥 NEW: Single API call gets everything
        const fullData = await tvAPI.getFullDetails(parseInt(tvId));

        setShow(fullData.details);
        setCast(fullData.credits.cast?.slice(0, 15) || []);

        const trailerVideo =
          fullData.videos.results?.find(
            (v: Video) => v.type === "Trailer" && v.site === "YouTube",
          ) || fullData.videos.results?.[0];
        setTrailer(trailerVideo || null);

        const inProviders = fullData.providers.results?.IN?.flatrate || [];
        setProviders(inProviders);

        setImages({
          backdrops: fullData.images.backdrops?.slice(0, 12) || [],
          posters: fullData.images.posters?.slice(0, 12) || [],
        });

        // Create seasons array
        const seasonsArr = Array.from(
          { length: fullData.details.number_of_seasons },
          (_, i) => ({
            season_number: i + 1,
            name: `Season ${i + 1}`,
          }),
        );
        setSeasons(seasonsArr);

        setIsLoading(false);

        // 🔥 LAZY LOAD: Recommendations after main content loads
        setTimeout(() => {
          const transformShow = (s: any) => ({
            id: s.id,
            title: s.name,
            rating: s.vote_average,
            poster: s.poster_path
              ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
              : "",
            year: s.first_air_date
              ? new Date(s.first_air_date).getFullYear()
              : 2024,
          });

          setRecommendations(
            fullData.recommendations.results?.slice(0, 12).map(transformShow) ||
              [],
          );
          setSimilarShows(
            fullData.similar.results?.slice(0, 12).map(transformShow) || [],
          );
        }, 100);
      } catch (err) {
        console.error("Failed to fetch TV show data:", err);
        setError("Failed to load TV show details. Please try again.");
        setIsLoading(false);
      }
    };

    fetchShowData();
  }, [tvId]);

  useEffect(() => {
    let isCancelled = false;
    const syncUserLists = async () => {
      try {
        const [watchlistIds, ratingIds] = await Promise.all([
          getCachedWatchlistIds(),
          getCachedRatingIds(),
        ]);
        if (isCancelled) return;
        const id = parseInt(tvId);
        setIsInWatchlist(watchlistIds.tv.has(id));
        setIsRated(ratingIds.tv.has(id));
      } catch {
        // Ignore if user is logged out or request fails
      }
    };

    syncUserLists();
    return () => {
      isCancelled = true;
    };
  }, [tvId]);

  const handleAddToWatchlist = async () => {
    if (isInWatchlist) {
      showNotification("Already in watchlist", "error");
      return;
    }

    setIsAddingToWatchlist(true);
    try {
      await watchlistAPI.add({ tmdb_id: parseInt(tvId), media_type: "tv" });
      setIsInWatchlist(true);
      showNotification("Added to watchlist!", "success");
    } catch (error: any) {
      const errorText = (error.message || "").toLowerCase();
      if (errorText.includes("already in watchlist")) {
        setIsInWatchlist(true);
        showNotification("Already in watchlist", "error");
      } else if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Failed. Please login first.", "error");
      }
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const handleRating = async (ratingValue: string) => {
    if (isRated) {
      setShowRatingSheet(false);
      showNotification("Already rated. Update it from Ratings page.", "error");
      return;
    }

    try {
      await ratingsAPI.create({
        tmdb_id: parseInt(tvId),
        media_type: "tv",
        rating: ratingValue,
      });
      setShowRatingSheet(false);
      setIsRated(true);
      showNotification(
        `Rated as ${ratingOptions.find((r) => r.value === ratingValue)?.label}!`,
        "success",
      );
    } catch (error: any) {
      const errorText = (error.message || "").toLowerCase();
      if (errorText.includes("already rated")) {
        setShowRatingSheet(false);
        setIsRated(true);
        showNotification("Already rated. Update it from Ratings page.", "error");
      } else if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Failed to rate. Please login first.", "error");
      }
    }
  };

  const scrollCast = (direction: "left" | "right") => {
    if (castScrollRef.current) {
      const scrollAmount = 300;
      castScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSeasonToggle = async (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    // Fetch season data if not already loaded
    if (!seasonData[seasonNumber]) {
      try {
        const data = await tvAPI.getSeason(parseInt(tvId), seasonNumber);
        setSeasonData((prev) => ({ ...prev, [seasonNumber]: data }));
      } catch (err) {
        console.error("Failed to fetch season data:", err);
      }
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] bg-[#1A1A1A] animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="aspect-[2/3] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg animate-pulse" />
            <div className="md:col-span-2 space-y-6">
              <div className="h-12 bg-[#1A1A1A] rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-[#1A1A1A] rounded-lg w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-[#1A1A1A] rounded animate-pulse" />
                <div className="h-4 bg-[#1A1A1A] rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !show) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <div className="text-4xl">😕</div>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-[#A0A0A0] mb-8">{error || "TV show not found"}</p>
          <Button
            onClick={() => router.push("/tv")}
            className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to TV Shows
          </Button>
        </motion.div>
      </div>
    );
  }

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder.svg";
  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : "/placeholder.svg";
  const trailerUrl = trailer
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`
    : null;
  const avgRuntime = show.episode_run_time?.[0] || 45;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-50 w-10 h-10 bg-[#1A1A1A]/80 md:backdrop-blur-md rounded-full flex items-center justify-center border border-[#2A2A2A] hover:bg-[#14B8A6]/10 hover:border-[#14B8A6]/50 transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5 text-[#F5F5F5]" />
      </motion.button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
      >
        <img
          src={backdropUrl || "/placeholder.svg"}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/90 via-transparent to-transparent" />

        {trailerUrl && (
          <motion.button
            onClick={() => {
              const trailerElement = document.getElementById("trailer");
              if (trailerElement) {
                trailerElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-8 right-8 w-16 h-16 bg-[#14B8A6]/20 md:backdrop-blur-md rounded-full flex items-center justify-center border border-[#14B8A6]/50 hover:bg-[#14B8A6]/30 transition-all duration-200 group"
          >
            <Play className="w-6 h-6 text-[#14B8A6] ml-1 group-hover:scale-110 transition-transform" />
          </motion.button>
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
                  src={posterUrl || "/placeholder.svg"}
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center border border-[#14B8A6]/30">
                  <Tv className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <span className="text-sm font-semibold text-[#14B8A6] uppercase tracking-wide">
                  TV Series
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-2 leading-tight">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-base md:text-lg text-[#A0A0A0] italic">
                  {show.tagline}
                </p>
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
                        ? "fill-[#14B8A6] text-[#14B8A6]"
                        : "text-[#2A2A2A]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-[#F5F5F5]">
                {show.vote_average.toFixed(1)}
                <span className="text-[#A0A0A0]">/10</span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {show.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 rounded-full bg-[#1A1A1A] md:backdrop-blur-sm text-sm text-[#F5F5F5] border border-[#2A2A2A]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Details Grid - TV Specific */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">First Air Date</p>
                <p className="text-base font-medium text-[#F5F5F5]">
                  {new Date(show.first_air_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Status</p>
                <p className="text-base font-medium text-[#F5F5F5] capitalize">
                  {show.status || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Seasons</p>
                <p className="text-base font-medium text-[#F5F5F5]">
                  {show.number_of_seasons} Season
                  {show.number_of_seasons !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Episodes</p>
                <p className="text-base font-medium text-[#F5F5F5]">
                  {show.number_of_episodes} Episodes
                </p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Episode Runtime</p>
                <p className="text-base font-medium text-[#F5F5F5]">
                  {avgRuntime} min
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={handleAddToWatchlist}
                disabled={isAddingToWatchlist}
                className="flex-1 sm:flex-none h-12 px-6 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] font-semibold rounded-lg transition-all disabled:opacity-50"
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
                className="flex-1 sm:flex-none h-12 px-6 bg-[#1A1A1A] hover:bg-[#14B8A6]/10 text-[#F5F5F5] hover:text-[#14B8A6] border border-[#2A2A2A] hover:border-[#14B8A6]/50 font-semibold rounded-lg transition-all duration-200"
              >
                <Star className="w-5 h-5 mr-2" />
                Rate
              </Button>

              <Button
                onClick={() => {
                  navigator
                    .share?.({
                      title: show.name,
                      text: show.tagline || show.overview,
                      url: window.location.href,
                    })
                    .catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      showNotification("Link copied!", "success");
                    });
                }}
                className="h-12 w-12 sm:w-auto sm:px-4 bg-[#1A1A1A] hover:bg-[#14B8A6]/10 text-[#F5F5F5] hover:text-[#14B8A6] border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Overview */}
            <div className="pt-8 border-t border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">
                Overview
              </h3>
              <p className="text-[#A0A0A0] leading-relaxed text-sm md:text-base">
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
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">
              Available On
            </h2>
            <div className="flex flex-wrap gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:border-[#14B8A6]/50 hover:bg-[#14B8A6]/5 transition-all duration-200"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-10 h-10 rounded-lg"
                  />
                  <span className="text-[#F5F5F5] font-medium text-sm">
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
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Trailer</h2>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1A1A1A]">
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

        {(trailer ||
          images.backdrops.length > 0 ||
          images.posters.length > 0) && (
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
                  onClick={() => setActiveMediaTab("videos")}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === "videos"
                      ? "text-white border-b-2 border-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Videos
                </button>
              )}
              {images.backdrops.length > 0 && (
                <button
                  onClick={() => setActiveMediaTab("backdrops")}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === "backdrops"
                      ? "text-white border-b-2 border-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Backdrops {images.backdrops.length}
                </button>
              )}
              {images.posters.length > 0 && (
                <button
                  onClick={() => setActiveMediaTab("posters")}
                  className={`px-4 py-2 font-medium transition-all ${
                    activeMediaTab === "posters"
                      ? "text-white border-b-2 border-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Posters {images.posters.length}
                </button>
              )}
            </div>

            {activeMediaTab === "videos" && trailer && (
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

            {activeMediaTab === "backdrops" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.backdrops.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                      alt="Backdrop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeMediaTab === "posters" && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.posters.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10"
                  >
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
                  onClick={() => scrollCast("left")}
                  className="w-9 h-9 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => scrollCast("right")}
                  className="w-9 h-9 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div
              ref={castScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
                <div
                  key={season.season_number}
                  className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() => handleSeasonToggle(season.season_number)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <span className="text-white font-semibold">
                      {season.name}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-white transition-transform ${
                        expandedSeason === season.season_number
                          ? "rotate-90"
                          : ""
                      }`}
                    />
                  </button>

                  {expandedSeason === season.season_number &&
                    seasonData[season.season_number] && (
                      <div className="border-t border-white/10 p-4 space-y-4">
                        {seasonData[season.season_number].episodes?.map(
                          (episode: any) => (
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
                                      <span className="text-sm text-zinc-400">
                                        {episode.vote_average.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {episode.air_date && (
                                  <p className="text-sm text-zinc-500 mb-2">
                                    {new Date(
                                      episode.air_date,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                )}

                                {episode.overview && (
                                  <p className="text-sm text-zinc-300 line-clamp-2">
                                    {episode.overview}
                                  </p>
                                )}
                              </div>
                            </div>
                          ),
                        )}
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
            <h2 className="text-2xl font-bold text-white mb-6">
              Recommended for You
            </h2>
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
            <h2 className="text-2xl font-bold text-white mb-6">
              More Like This
            </h2>
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

      {/* Netflix-Style Rating Modal */}
      <AnimatePresence>
        {showRatingSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingSheet(false)}
              className="fixed inset-0 bg-black/80 md:backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md bg-[#181818] rounded p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowRatingSheet(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title */}
                <h3 className="text-xl font-medium text-white mb-6 pr-8">
                  Rate: {show.name}
                </h3>

                {/* Rating Options */}
                <div className="space-y-3">
                  {ratingOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRating(option.value)}
                      className={`w-full px-5 py-4 text-left rounded bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-[#808080] transition-all ${
                        option.value === "perfection"
                          ? "border-[#46d369]/30 hover:border-[#46d369]/50"
                          : ""
                      }`}
                    >
                      <span className={`text-base font-normal ${option.color}`}>
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl md:backdrop-blur-md border min-w-[200px] max-w-[90vw] md:max-w-md ${
              showToast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            }`}
          >
            <p className="text-sm font-medium text-center">
              {showToast.message}
            </p>
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
  );
}
