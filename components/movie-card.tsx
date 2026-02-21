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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { watchlistAPI, ratingsAPI, getCachedRatingIds, getCachedWatchlistIds, getCachedWatchlistItemId, removeFromWatchlistCache } from "@/lib/api";
import { useRouter } from "next/navigation";

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

export const MovieCard = React.memo(function MovieCard({ movie, mediaType = "movie" }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const ratingOptions = useMemo(
    () => [
      {
        value: "skip",
        label: "Skip",
        color: "text-[#A0A0A0]",
        gradient: "from-[#A0A0A0]",
      },
      {
        value: "timepass",
        label: "Timepass",
        color: "text-[#F5F5F5]",
        gradient: "from-[#F5F5F5]",
      },
      {
        value: "go_for_it",
        label: "Go for it",
        color: "text-[#F5F5F5]",
        gradient: "from-[#14B8A6]",
      },
      {
        value: "perfection",
        label: "Perfection",
        color: "text-[#14B8A6]",
        gradient: "from-[#14B8A6]",
      },
    ],
    [],
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        const watchlistItemId = await getCachedWatchlistItemId(movie.id, mediaType);
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

  const hasPoster = movie.poster && !imageError;

  // Mobile: no animations, Desktop: scale animation
  const cardMotionProps = isMobile
    ? {}
    : {
        whileHover: { scale: 1.08 },
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      };

  return (
    <>
      <Link href={`/${mediaType}/${movie.id}`}>
        <motion.div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          className="relative group cursor-pointer"
          {...(isMobile
            ? {}
            : {
                whileHover: { scale: 1.08 },
                transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
              })}
        >
          {/* Poster Container */}
          <div className="relative aspect-[2/3] bg-[#1A1A1A] overflow-hidden rounded-lg border border-[#2A2A2A] hover:border-[#14B8A6]/50 md:transition-colors md:duration-300">
            {hasPoster ? (
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                className="object-cover"
                loading="lazy"
                quality={75}
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]">
                <Film className="w-16 h-16 md:w-20 md:h-20 text-[#2A2A2A] mb-4" />
                <p className="text-xs md:text-sm text-[#A0A0A0] text-center line-clamp-3 leading-tight px-2">
                  {movie.title}
                </p>
                {movie.year && (
                  <p className="text-xs text-[#808080] mt-2">{movie.year}</p>
                )}
              </div>
            )}

            {/* Hover Overlay - Bottom Actions */}
            <AnimatePresence>
              {(isHovered || isMobile) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/70 to-transparent flex flex-col justify-end p-3"
                >
                  {/* Title on Hover */}
                  {hasPoster && (
                    <h3 className="text-sm md:text-base font-medium text-[#F5F5F5] mb-3 line-clamp-2 leading-tight">
                      {movie.title}
                    </h3>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Watchlist Button - NO animations on mobile */}
                    <motion.button
                      {...(!isMobile && {
                        whileHover: { scale: 1.1 },
                        whileTap: { scale: 0.95 },
                      })}
                      onClick={handleWatchlistToggle}
                      disabled={isLoading}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed md:backdrop-blur-xl"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#14B8A6] animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="w-4 h-4 text-[#14B8A6]" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#F5F5F5]" />
                      )}
                    </motion.button>

                    {/* Rate Button - NO animations on mobile */}
                    <motion.button
                      {...(!isMobile && {
                        whileHover: { scale: 1.1 },
                        whileTap: { scale: 0.95 },
                      })}
                      onClick={openRatingMenu}
                      disabled={isLoading}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed md:backdrop-blur-xl"
                    >
                      <Star className="w-4 h-4 text-[#F5F5F5]" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title Below Card - Mobile Only */}
          {hasPoster && (
            <div className="mt-2 md:hidden">
              <h3 className="text-xs font-medium text-[#F5F5F5] line-clamp-2 leading-tight">
                {movie.title}
              </h3>
            </div>
          )}

          {/* Hover Shadow - Desktop Only */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-2 bg-[#14B8A6]/20 rounded-lg -z-10 blur-xl pointer-events-none"
            />
          )}
        </motion.div>
      </Link>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingMenu(false)}
              className="fixed inset-0 bg-[#0F0F0F]/80 md:backdrop-blur-md z-[100]"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md bg-[#1A1A1A]/90 border border-[#2A2A2A] rounded-lg p-8 shadow-2xl md:backdrop-blur-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#0D9488]/5 opacity-50 pointer-events-none" />

                <div className="relative z-10">
                  <motion.button
                    onClick={() => setShowRatingMenu(false)}
                    {...(!isMobile && {
                      whileHover: { scale: 1.1, rotate: 90 },
                      whileTap: { scale: 0.9 },
                    })}
                    className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center hover:bg-[#14B8A6]/20 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-[#F5F5F5]" />
                  </motion.button>

                  <h3 className="text-xl font-semibold text-[#F5F5F5] mb-6 pr-8">
                    Rate: {movie.title}
                  </h3>

                  <div className="space-y-3">
                    {ratingOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        {...(!isMobile && {
                          whileHover: { scale: 1.02 },
                          whileTap: { scale: 0.98 },
                        })}
                        onClick={(e) => handleRating(option.value, e)}
                        disabled={isLoading}
                        className={`w-full px-5 py-4 text-left rounded-lg bg-[#2A2A2A]/50 hover:bg-[#14B8A6]/10 border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          option.value === "perfection"
                            ? "border-[#14B8A6]/30"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-base font-normal ${option.color}`}
                        >
                          {option.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
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
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed top-20 right-4 z-[100] px-4 py-3 rounded-lg shadow-2xl md:backdrop-blur-xl border min-w-[200px] max-w-[90vw] md:max-w-md flex items-center gap-3 ${
              showToast.type === "success"
                ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
                : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
            }`}
          >
            {showToast.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
