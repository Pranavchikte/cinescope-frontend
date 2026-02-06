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
} from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { moviesAPI, watchlistAPI, ratingsAPI } from "@/lib/api";
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

interface Movie {
  id: number;
  title: string;
  tagline: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  release_date: string;
  runtime: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export function MovieDetailPage({ movieId }: { movieId: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [images, setImages] = useState<{ backdrops: any[]; posters: any[] }>({
    backdrops: [],
    posters: [],
  });
  const [activeMediaTab, setActiveMediaTab] = useState<
    "videos" | "backdrops" | "posters"
  >("videos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingSheet, setShowRatingSheet] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [movieData, creditsData, videosData, providersData, imagesData] =
          await Promise.all([
            moviesAPI.getDetails(parseInt(movieId)),
            moviesAPI.getCredits(parseInt(movieId)),
            moviesAPI.getVideos(parseInt(movieId)),
            moviesAPI.getMovieProviders(parseInt(movieId)),
            moviesAPI.getImages(parseInt(movieId)),
          ]);

        setMovie(movieData);
        setCast(creditsData.cast?.slice(0, 15) || []);

        const trailerVideo =
          videosData.results?.find(
            (v: Video) => v.type === "Trailer" && v.site === "YouTube",
          ) || videosData.results?.[0];
        setTrailer(trailerVideo || null);

        const inProviders = providersData.results?.IN?.flatrate || [];
        setProviders(inProviders);

        setImages({
          backdrops: imagesData.backdrops?.slice(0, 12) || [],
          posters: imagesData.posters?.slice(0, 12) || [],
        });

        const [recommendationsData, similarData] = await Promise.all([
          moviesAPI.getRecommendations(parseInt(movieId)),
          moviesAPI.getSimilar(parseInt(movieId)),
        ]);

        const transformMovie = (m: any) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        });

        setRecommendations(
          recommendationsData.results?.slice(0, 12).map(transformMovie) || [],
        );
        setSimilarMovies(
          similarData.results?.slice(0, 12).map(transformMovie) || [],
        );
      } catch (err) {
        console.error("Failed to fetch movie data:", err);
        setError("Failed to load movie details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  const handleAddToWatchlist = async () => {
    setIsAddingToWatchlist(true);
    try {
      await watchlistAPI.add({
        tmdb_id: parseInt(movieId),
        media_type: "movie",
      });
      showNotification("Added to watchlist!", "success");
    } catch (error: any) {
      const errorText = error.message || "";
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Failed. Please login first.", "error");
      }
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const handleRating = async (ratingValue: string) => {
    try {
      await ratingsAPI.create({
        tmdb_id: parseInt(movieId),
        media_type: "movie",
        rating: ratingValue,
      });
      setShowRatingSheet(false);
      showNotification(
        `Rated as ${ratingOptions.find((r) => r.value === ratingValue)?.label}!`,
        "success",
      );
    } catch (error: any) {
      const errorText = error.message || "";
      if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Failed to rate. Please login first.", "error");
      }
    }
  };

  const scrollCast = (direction: "left" | "right") => {
    if (castScrollRef.current) {
      const scrollAmount = 400;
      castScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative h-[50vh] bg-zinc-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-white mb-3">
            Oops! Something went wrong
          </h2>
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
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg";
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "/placeholder.svg";
  const trailerUrl = trailer
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`
    : null;
  const rating = Math.round((movie.vote_average / 10) * 100);

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-50 w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-black/80 hover:border-white/20 transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </motion.button>

      {/* Hero Section - Responsive Height */}
      <div className="relative min-h-[600px] md:min-h-[650px] lg:min-h-[700px] overflow-hidden">
        {/* Backdrop Image with Blur */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-end">
            {/* Left: Title + Info */}
            <div className="lg:col-span-2 space-y-4 md:space-y-5">
              {/* Mobile Poster */}
              <div className="lg:hidden mb-6">
                <div className="relative w-48 mx-auto">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 relative">
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                            fill="none"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#10b981"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - rating / 100)}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />
              {/* Rest of the content - title, genres, overview, buttons - stays the same */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-2xl">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-sm md:text-base lg:text-lg text-zinc-300 italic mb-3 md:mb-4">
                    {movie.tagline}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-zinc-300 mb-3 md:mb-4">
                  <span className="font-medium">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span>•</span>
                  <span>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4 md:mb-5">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs md:text-sm text-white border border-white/20"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <p className="text-zinc-200 leading-relaxed text-sm md:text-base max-w-2xl line-clamp-3 md:line-clamp-4 mb-4 md:mb-6">
                  {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Button
                    onClick={handleAddToWatchlist}
                    disabled={isAddingToWatchlist}
                    className="h-10 md:h-12 px-4 md:px-6 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all shadow-lg text-sm md:text-base"
                  >
                    {isAddingToWatchlist ? (
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowRatingSheet(true)}
                    className="h-10 md:h-12 px-4 md:px-6 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-semibold rounded-xl transition-all text-sm md:text-base"
                  >
                    <Star className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Rate
                  </Button>

                  <Button
                    onClick={() => {
                      navigator
                        .share?.({
                          title: movie.title,
                          url: window.location.href,
                        })
                        .catch(() => {
                          navigator.clipboard.writeText(window.location.href);
                          showNotification("Link copied!", "success");
                        });
                    }}
                    className="h-10 md:h-12 w-10 md:w-12 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-xl transition-all"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right: Floating Poster - Desktop Only */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex justify-end"
            >
              <div className="relative w-full max-w-[280px]">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 relative">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Rating Badge on Poster */}
                  <div className="absolute bottom-4 right-4">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="#10b981"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - rating / 100)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-base">
                          {rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Play Trailer FAB */}
        {trailerUrl && (
          <motion.a
            href="#trailer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 hover:scale-110 transition-all group shadow-2xl"
          >
            <Play
              className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5"
              fill="white"
            />
          </motion.a>
        )}
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 md:space-y-16">
        {/* Watch Providers */}
        {providers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
              Available On
            </h2>
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

        {/* Trailer */}
        {trailerUrl && (
          <motion.section
            id="trailer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
              Trailer
            </h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
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

        {/* Media Section */}
        {(trailer ||
          images.backdrops.length > 0 ||
          images.posters.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
              Media
            </h2>

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

        {/* Top Billed Cast */}
        {cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Top Billed Cast
              </h2>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollCast("left")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => scrollCast("right")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div
              ref={castScrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            >
              {cast.map((member) => (
                <Link
                  key={member.id}
                  href={`/people/${member.id}`}
                  className="shrink-0 w-28 md:w-36 snap-start group cursor-pointer"
                >
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-zinc-900 mb-3 md:mb-4 border-2 border-white/10 group-hover:border-white/30 transition-all shadow-lg">
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
                  <h4 className="text-xs md:text-sm font-semibold text-white text-center mb-1 line-clamp-1">
                    {member.name}
                  </h4>
                  <p className="text-xs text-zinc-400 text-center line-clamp-2">
                    {member.character}
                  </p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
              Recommendations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {recommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} mediaType="movie" />
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
              More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {similarMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} mediaType="movie" />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
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
                  Rate: {movie.title}
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

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
              showToast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <p className="text-sm font-medium">{showToast.message}</p>
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
