"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  Check,
  Loader2,
  Film,
  X,
  CheckCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  watchlistAPI,
  ratingsAPI,
  getCachedRatingIds,
  getCachedWatchlistIds,
  getCachedWatchlistItemId,
  removeFromWatchlistCache,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { useMobile } from "@/hooks/use-mobile";

interface Movie {
  id: number;
  title: string;
  rating: number;
  poster: string;
  year: number;
}

interface MovieCardProps {
  movie: Movie;
  mediaType?: "movie" | "tv";
}

export const MovieCard = React.memo(function MovieCard({
  movie,
  mediaType = "movie",
}: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMobile = useMobile();
  const router = useRouter();

  const ratingOptions = useMemo(
    () => [
      { value: "skip", label: "Skip", color: "text-muted-foreground" },
      { value: "timepass", label: "Timepass", color: "text-foreground" },
      { value: "go_for_it", label: "Go for it", color: "text-foreground" },
      { value: "perfection", label: "Perfection", color: "text-primary" },
    ],
    [],
  );

  useEffect(() => {
    let isCancelled = false;
    const syncUserLists = async () => {
      try {
        const [watchlistIds, ratingIds] = await Promise.all([
          getCachedWatchlistIds(),
          getCachedRatingIds(),
        ]);
        if (isCancelled) return;
        setIsInWatchlist(watchlistIds[mediaType].has(movie.id));
        setIsRated(ratingIds[mediaType].has(movie.id));
      } catch {
        // Ignore if user is logged out or request fails
      }
    };

    syncUserLists();
    return () => {
      isCancelled = true;
    };
  }, [movie.id, mediaType]);

  const showNotification = (message: string, type: "success" | "error") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        const watchlistItemId = await getCachedWatchlistItemId(
          movie.id,
          mediaType,
        );
        if (!watchlistItemId) {
          showNotification("Couldn't find watchlist item", "error");
          return;
        }
        await watchlistAPI.remove(watchlistItemId);
        removeFromWatchlistCache(movie.id, mediaType);
        setIsInWatchlist(false);
        showNotification("Removed from watchlist", "success");
      } else {
        await watchlistAPI.add({ tmdb_id: movie.id, media_type: mediaType });
        setIsInWatchlist(true);
        showNotification("Added to watchlist", "success");
      }
    } catch (error: any) {
      const errorText = (error.message || "").toLowerCase();
      if (errorText.includes("already in watchlist")) {
        setIsInWatchlist(true);
        showNotification("Already in watchlist", "error");
      } else if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Please login first", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (ratingValue: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isRated) {
      setShowRatingMenu(false);
      showNotification("Already rated. Update it from Ratings page.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await ratingsAPI.create({
        tmdb_id: movie.id,
        media_type: mediaType,
        rating: ratingValue,
      });
      setShowRatingMenu(false);
      setIsRated(true);
      showNotification(
        `Rated as ${ratingOptions.find((r) => r.value === ratingValue)?.label}`,
        "success",
      );
    } catch (error: any) {
      const errorText = (error.message || "").toLowerCase();
      if (errorText.includes("already rated")) {
        setShowRatingMenu(false);
        setIsRated(true);
        showNotification("Already rated. Update it from Ratings page.", "error");
      } else if (errorText.includes("verify your email")) {
        showNotification("Please verify your email first", "error");
      } else {
        showNotification("Please login first", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openRatingMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRatingMenu(true);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      router.prefetch(`/${mediaType}/${movie.id}`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const watchLink =
      mediaType === "movie"
        ? `/watch/movie/${movie.id}`
        : `/watch/tv/${movie.id}`;
    router.push(watchLink);
  };

  const hasPoster = movie.poster && !imageError;
  const showOverlay = isHovered || isMobile;
  const score = typeof movie.rating === "number" ? Math.round(movie.rating * 10) : null;

  return (
    <>
      <Link href={`/${mediaType}/${movie.id}`}>
        <motion.div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          className="group relative"
          whileHover={!isMobile ? { y: -6 } : undefined}
          transition={{ duration: 0.25 }}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-xl">
            {hasPoster ? (
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 220px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                quality={80}
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-card to-background">
                <Film className="h-14 w-14 text-muted-foreground/40" />
                <p className="mt-4 text-center text-xs text-muted-foreground line-clamp-3 px-4">
                  {movie.title}
                </p>
              </div>
            )}

            {score !== null && (
              <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {score}%
              </div>
            )}

            <AnimatePresence>
              {showOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/60 to-transparent p-3"
                >
                  {hasPoster && (
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                      {movie.title}
                    </h3>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handlePlay}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                    </button>
                    <button
                      onClick={handleWatchlistToggle}
                      disabled={isLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-foreground transition hover:border-primary/50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={openRatingMenu}
                      disabled={isLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-foreground transition hover:border-primary/50"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hasPoster && (
            <div className="mt-2 md:hidden">
              <h3 className="text-xs font-medium text-foreground line-clamp-2">
                {movie.title}
              </h3>
              <p className="text-[11px] text-muted-foreground">{movie.year}</p>
            </div>
          )}
        </motion.div>
      </Link>

      <AnimatePresence>
        {showRatingMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingMenu(false)}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md rounded-2xl border border-border/70 bg-card/95 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowRatingMenu(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>

                <h3 className="text-lg font-semibold text-foreground mb-4 pr-8">
                  Rate: {movie.title}
                </h3>

                <div className="space-y-3">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => handleRating(option.value, e)}
                      disabled={isLoading}
                      className="w-full rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-left text-sm text-foreground transition hover:border-primary/50"
                    >
                      <span className={`font-medium ${option.color}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed top-20 right-4 z-[100] flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              showToast.type === "success"
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {showToast.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="text-sm font-medium">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
