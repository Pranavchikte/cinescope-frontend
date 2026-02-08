"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Loader2,
  Sparkles,
  ThumbsUp,
  Clock,
  XCircle,
  Trash2,
  Edit3,
} from "lucide-react";
import { ratingsAPI, moviesAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RatingItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: string;
  rating: "skip" | "timepass" | "go_for_it" | "perfection";
  rated_at: string;
}

interface EnrichedRatingItem {
  id: string;
  tmdb_id: number;
  title: string;
  poster: string;
  rating: "skip" | "timepass" | "go_for_it" | "perfection";
  year: number;
  mediaType: string;
}

const RATING_CONFIG = {
  skip: {
    label: "Skip",
    icon: XCircle,
    color: "#ef4444",
  },
  timepass: {
    label: "Timepass",
    icon: Clock,
    color: "#f59e0b",
  },
  go_for_it: {
    label: "Go For It",
    icon: ThumbsUp,
    color: "#10b981",
  },
  perfection: {
    label: "Perfection",
    icon: Sparkles,
    color: "#8b5cf6",
  },
};

export function RatingsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [ratings, setRatings] = useState<EnrichedRatingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // Ripple state
  const [ripples, setRipples] = useState<{
    [key: string]: { x: number; y: number; id: number }[];
  }>({});

  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }));
    }, 600);
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ratingsData: RatingItem[] = await ratingsAPI.get();

        if (!ratingsData || ratingsData.length === 0) {
          setRatings([]);
          setIsLoading(false);
          return;
        }

        const enrichedItems = await Promise.all(
          ratingsData.map(async (item) => {
            try {
              const tmdbData = await moviesAPI.getDetails(item.tmdb_id);
              return {
                id: item.id,
                tmdb_id: item.tmdb_id,
                title: tmdbData.title || tmdbData.name,
                poster: tmdbData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                  : "",
                rating: item.rating,
                year: tmdbData.release_date
                  ? new Date(tmdbData.release_date).getFullYear()
                  : 2024,
                mediaType: item.media_type,
              };
            } catch (err) {
              console.error(
                `Failed to fetch details for tmdb_id ${item.tmdb_id}:`,
                err
              );
              return null;
            }
          })
        );

        const validItems = enrichedItems.filter(
          (item): item is EnrichedRatingItem => item !== null
        );
        setRatings(validItems);
      } catch (err) {
        console.error("Failed to fetch ratings:", err);
        setError("Failed to load ratings. Please login or try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const stats = {
    skip: ratings.filter((r) => r.rating === "skip").length,
    timepass: ratings.filter((r) => r.rating === "timepass").length,
    go_for_it: ratings.filter((r) => r.rating === "go_for_it").length,
    perfection: ratings.filter((r) => r.rating === "perfection").length,
  };

  const filteredRatings =
    filter === "all" ? ratings : ratings.filter((r) => r.rating === filter);

  const updateRating = async (ratingId: string, newRating: string) => {
    try {
      await ratingsAPI.update(ratingId, newRating);
      setRatings(
        ratings.map((r) =>
          r.id === ratingId
            ? {
                ...r,
                rating: newRating as
                  | "skip"
                  | "timepass"
                  | "go_for_it"
                  | "perfection",
              }
            : r
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update rating:", err);
    }
  };

  const removeRating = async (ratingId: string) => {
    try {
      await ratingsAPI.delete(ratingId);
      setRatings(ratings.filter((r) => r.id !== ratingId));
    } catch (err) {
      console.error("Failed to delete rating:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-24">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="h-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-full">
            <XCircle className="w-8 h-8 text-[#A0A0A0]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] mb-3">
            Something went wrong
          </h2>
          <p className="text-[#A0A0A0] mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              handleRipple(e, "error-home");
              router.push("/");
            }}
            className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all duration-200 relative overflow-hidden group"
          >
            {ripples["error-home"]?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                animate={{ width: 150, height: 150, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            {/* Gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
              style={{
                background:
                  "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
              }}
            />
            <span className="relative z-10">Go Home</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#F5F5F5] mb-2">
            My Ratings
          </h1>
          <p className="text-base text-[#A0A0A0]">
            {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 mb-8 border-b border-[#2A2A2A] overflow-x-auto hide-scrollbar"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              handleRipple(e, "filter-all");
              setFilter("all");
            }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap relative overflow-hidden ${
              filter === "all"
                ? "border-[#14B8A6] text-[#14B8A6]"
                : "border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]"
            }`}
          >
            {ripples["filter-all"]?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            <span className="relative z-10">All ({ratings.length})</span>
          </motion.button>

          {Object.entries(RATING_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = stats[key as keyof typeof stats];
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  handleRipple(e, `filter-${key}`);
                  setFilter(key);
                }}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex items-center gap-2 relative overflow-hidden ${
                  filter === key
                    ? "border-[#14B8A6] text-[#14B8A6]"
                    : "border-transparent text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                {ripples[`filter-${key}`]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                <Icon
                  className="w-4 h-4 relative z-10"
                  style={{ color: filter === key ? "#14B8A6" : undefined }}
                />
                <span className="relative z-10">
                  {config.label} ({count})
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Content Grid */}
        {filteredRatings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-full">
              <Star className="w-8 h-8 text-[#A0A0A0]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
              {filter === "all"
                ? "No ratings yet"
                : `No ${
                    RATING_CONFIG[filter as keyof typeof RATING_CONFIG].label
                  } ratings`}
            </h2>
            <p className="text-[#A0A0A0] text-center max-w-md mb-8">
              {filter === "all"
                ? "Start rating titles to see them here"
                : "Try selecting a different rating filter"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                handleRipple(e, "browse-titles");
                router.push("/");
              }}
              className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg font-semibold transition-all duration-200 relative overflow-hidden group"
            >
              {ripples["browse-titles"]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-white/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 150, height: 150, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              {/* Gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                style={{
                  background:
                    "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                }}
              />
              <span className="relative z-10">Browse Titles</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredRatings.map((movie, index) => (
                <RatedMovieCard
                  key={movie.id}
                  movie={movie}
                  onRemove={() => removeRating(movie.id)}
                  onUpdate={(newRating) => updateRating(movie.id, newRating)}
                  isEditing={editingId === movie.id}
                  onEditToggle={() =>
                    setEditingId(editingId === movie.id ? null : movie.id)
                  }
                  delay={index * 0.03}
                  ripples={ripples}
                  handleRipple={handleRipple}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function RatedMovieCard({
  movie,
  onRemove,
  onUpdate,
  isEditing,
  onEditToggle,
  delay,
  ripples,
  handleRipple,
}: {
  movie: EnrichedRatingItem;
  onRemove: () => void;
  onUpdate: (newRating: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
  delay: number;
  ripples: { [key: string]: { x: number; y: number; id: number }[] };
  handleRipple: (e: React.MouseEvent, key: string) => void;
}) {
  const ratingOptions = [
    "skip",
    "timepass",
    "go_for_it",
    "perfection",
  ] as const;
  const [isHovered, setIsHovered] = useState(false);
  const config = RATING_CONFIG[movie.rating];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay, duration: 0.3 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <Link href={`/${movie.mediaType}/${movie.tmdb_id}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-all duration-200 cursor-pointer"
        >
          {movie.poster ? (
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Star className="w-12 h-12 text-[#404040]" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Rating Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-[#0F0F0F]/80 backdrop-blur-sm rounded-lg border border-[#2A2A2A]">
            <Icon className="w-3 h-3" style={{ color: "#14B8A6" }} />
            <span className="text-xs font-medium text-[#F5F5F5]">
              {config.label}
            </span>
          </div>

          {/* Title Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <h3 className="text-sm font-medium text-[#F5F5F5] line-clamp-2 mb-1">
              {movie.title}
            </h3>
            <p className="text-xs text-[#A0A0A0]">{movie.year}</p>
          </div>
        </motion.div>
      </Link>

      {/* Desktop: Action Buttons on Hover */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="hidden md:flex absolute -bottom-12 left-0 right-0 justify-center gap-2 z-20"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                handleRipple(e, `edit-${movie.id}`);
                onEditToggle();
              }}
              className="px-3 py-2 bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/10 text-[#F5F5F5] hover:text-[#14B8A6] border border-[#2A2A2A] hover:border-[#14B8A6]/50 backdrop-blur-xl rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden"
            >
              {ripples[`edit-${movie.id}`]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              <Edit3 className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Edit</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                handleRipple(e, `remove-${movie.id}`);
                if (
                  window.confirm(
                    `Remove "${movie.title}" from your ratings?`
                  )
                ) {
                  onRemove();
                }
              }}
              className="px-3 py-2 bg-[#1A1A1A]/80 hover:bg-red-500/10 text-[#F5F5F5] hover:text-red-400 border border-[#2A2A2A] hover:border-red-500/50 backdrop-blur-xl rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden"
            >
              {ripples[`remove-${movie.id}`]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-red-400/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              <Trash2 className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Remove</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Edit Dropdown */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="hidden md:block absolute top-0 left-0 right-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] rounded-lg overflow-hidden z-30 shadow-2xl"
          >
            {ratingOptions.map((option) => {
              const optionConfig = RATING_CONFIG[option];
              const OptionIcon = optionConfig.icon;

              return (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRipple(e, `rating-option-${movie.id}-${option}`);
                    onUpdate(option);
                  }}
                  className="w-full px-3 py-2.5 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 text-left flex items-center gap-2 relative overflow-hidden"
                >
                  {ripples[`rating-option-${movie.id}-${option}`]?.map(
                    (ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                        animate={{ width: 150, height: 150, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )
                  )}
                  <OptionIcon
                    className="w-4 h-4 relative z-10"
                    style={{ color: "#14B8A6" }}
                  />
                  <span className="relative z-10">{optionConfig.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Edit Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          const newRating = prompt(
            `Current rating: ${config.label}\n\nSelect new rating:\n1 - Skip\n2 - Timepass\n3 - Go For It\n4 - Perfection\n\nOr press Cancel to delete`
          );
          if (newRating === null) {
            if (
              window.confirm(`Remove "${movie.title}" from your ratings?`)
            ) {
              onRemove();
            }
          } else if (newRating === "1") {
            onUpdate("skip");
          } else if (newRating === "2") {
            onUpdate("timepass");
          } else if (newRating === "3") {
            onUpdate("go_for_it");
          } else if (newRating === "4") {
            onUpdate("perfection");
          }
        }}
        className="md:hidden absolute top-2 right-2 z-10 w-8 h-8 bg-[#0F0F0F]/80 hover:bg-[#14B8A6]/20 text-[#F5F5F5] hover:text-[#14B8A6] border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <Edit3 className="w-3.5 h-3.5" />
</motion.button>
</motion.div>
);
}