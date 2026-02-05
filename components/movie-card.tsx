"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { watchlistAPI, ratingsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    { value: "skip", label: "Skip", color: "text-[#808080]" },
    { value: "timepass", label: "Timepass", color: "text-white" },
    { value: "go_for_it", label: "Go for it", color: "text-white" },
    { value: "perfection", label: "Perfection", color: "text-[#46d369]" },
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
        "success"
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

  return (
    <>
      <Link href={`/${mediaType}/${movie.id}`}>
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative group cursor-pointer"
        >
          {/* Poster Container */}
          <div className="relative aspect-[2/3] bg-[#2a2a2a] overflow-hidden rounded-sm">
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />

            {/* Hover Overlay - Bottom Actions */}
            <AnimatePresence>
              {(isHovered || isMobile) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-3"
                >
                  {/* Title on Hover */}
                  <h3 className="text-sm md:text-base font-medium text-white mb-3 line-clamp-2 leading-tight">
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
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#2a2a2a]/90 hover:bg-[#3a3a3a] border border-[#808080]/30 hover:border-white/50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </motion.button>

                    {/* Rate This Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openRatingMenu}
                      disabled={isLoading}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#2a2a2a]/90 hover:bg-[#3a3a3a] border border-[#808080]/30 hover:border-white/50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title Below Card - Always Visible on Mobile/Small Cards */}
          <div className="mt-2 md:hidden">
            <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">
              {movie.title}
            </h3>
          </div>

          {/* Hover Shadow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-2 bg-black/40 rounded-sm -z-10 blur-xl pointer-events-none"
          />
        </motion.div>
      </Link>

      {/* Desktop Rating Menu - Dropdown */}
      {!isMobile && (
        <DropdownMenu open={showRatingMenu && !isMobile} onOpenChange={setShowRatingMenu}>
          <DropdownMenuTrigger asChild>
            <div className="hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-40 bg-[#181818]/98 backdrop-blur-xl border-[#333333] rounded p-1"
          >
            {ratingOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => handleRating(option.value, e as any)}
                disabled={isLoading}
                className={`cursor-pointer rounded px-3 py-2.5 text-sm font-normal ${option.color} hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Mobile Rating Menu - Bottom Sheet */}
      <Sheet open={showRatingMenu && isMobile} onOpenChange={setShowRatingMenu}>
        <SheetContent
          side="bottom"
          className="bg-[#181818]/98 backdrop-blur-xl border-[#333333] rounded-t-xl"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-base font-medium">
              Rate: {movie.title}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-6">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value)}
                disabled={isLoading}
                className={`w-full px-4 py-4 text-left rounded bg-[#2a2a2a]/50 hover:bg-[#333333] border border-[#404040] hover:border-[#808080]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className={`text-base font-normal ${option.color}`}>
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
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded shadow-2xl backdrop-blur-md border min-w-[200px] max-w-[90vw] md:max-w-md ${
              showToast.type === "success"
                ? "bg-[#46d369]/20 border-[#46d369]/30 text-white"
                : "bg-[#E50914]/20 border-[#E50914]/30 text-white"
            }`}
          >
            <p className="text-sm font-normal text-center">{showToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}