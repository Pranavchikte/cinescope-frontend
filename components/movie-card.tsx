"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { watchlistAPI, ratingsAPI } from "@/lib/api";
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

export function MovieCard({ movie, mediaType = "movie" }: MovieCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const ratingOptions = [
    { value: "skip", label: "Skip", color: "text-[#A0A0A0]" },
    { value: "timepass", label: "Timepass", color: "text-[#F5F5F5]" },
    { value: "go_for_it", label: "Go for it", color: "text-[#F5F5F5]" },
    { value: "perfection", label: "Perfection", color: "text-[#14B8A6]" },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        setIsInWatchlist(false);
        showNotification("Removed from watchlist", "success");
      } else {
        await watchlistAPI.add({ tmdb_id: movie.id, media_type: mediaType });
        setIsInWatchlist(true);
        showNotification("Added to watchlist", "success");
      }
    } catch (error: any) {
      const errorText = error.message || "";
      if (errorText.includes("verify your email")) {
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

    setIsLoading(true);
    try {
      await ratingsAPI.create({
        tmdb_id: movie.id,
        media_type: mediaType,
        rating: ratingValue,
      });
      setShowRatingMenu(false);
      showNotification(
        `Rated as ${ratingOptions.find((r) => r.value === ratingValue)?.label}`,
        "success",
      );
    } catch (error: any) {
      const errorText = error.message || "";
      if (errorText.includes("verify your email")) {
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

  // 🔥 HOVER PREFETCH - Preloads detail page on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    router.prefetch(`/${mediaType}/${movie.id}`);
  };

  return (
    <>
      <Link href={`/${mediaType}/${movie.id}`}>
        <motion.div
          onHoverStart={handleMouseEnter}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative group cursor-pointer"
        >
          {/* Poster Container */}
          <div className="relative aspect-[2/3] bg-[#1A1A1A] overflow-hidden rounded-lg border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-colors duration-300">
            {/* OPTIMIZED IMAGE - Lazy loading + optimization */}
            <Image
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
              className="object-cover"
              loading="lazy"
              quality={75}
            />

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
                  <h3 className="text-sm md:text-base font-medium text-[#F5F5F5] mb-3 line-clamp-2 leading-tight">
                    {movie.title}
                  </h3>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Watchlist Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleWatchlistToggle}
                      disabled={isLoading}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#14B8A6] animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="w-4 h-4 text-[#14B8A6]" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#F5F5F5]" />
                      )}
                    </motion.button>

                    {/* Rate This Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openRatingMenu}
                      disabled={isLoading}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star className="w-4 h-4 text-[#F5F5F5]" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title Below Card - Always Visible on Mobile/Small Cards */}
          <div className="mt-2 md:hidden">
            <h3 className="text-xs font-medium text-[#F5F5F5] line-clamp-2 leading-tight">
              {movie.title}
            </h3>
          </div>

          {/* Hover Shadow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-2 bg-[#14B8A6]/20 rounded-lg -z-10 blur-xl pointer-events-none"
          />
        </motion.div>
      </Link>

      {/* Netflix-Style Rating Modal */}
      <AnimatePresence>
        {showRatingMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingMenu(false)}
              className="fixed inset-0 bg-[#0F0F0F]/80 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowRatingMenu(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-[#14B8A6]/10 rounded-full transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-[#F5F5F5]"
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
                <h3 className="text-xl font-semibold text-[#F5F5F5] mb-6 pr-8">
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
                      disabled={isLoading}
                      className={`w-full px-5 py-4 text-left rounded-lg bg-[#2A2A2A] hover:bg-[#14B8A6]/10 border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        option.value === "perfection"
                          ? "border-[#14B8A6]/30 hover:border-[#14B8A6]/50"
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
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-lg shadow-lg backdrop-blur-md border min-w-[200px] max-w-[90vw] md:max-w-md ${
              showToast.type === "success"
                ? "bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#14B8A6]"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <p className="text-sm font-normal text-center">
              {showToast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}