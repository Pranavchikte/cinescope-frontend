"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MovieCard } from "./movie-card";
import { MovieCardSkeleton } from "./movie-card-skeleton";

interface Movie {
  id: number;
  title: string;
  rating: number;
  poster: string;
  year: number;
}

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  mediaType?: "movie" | "tv";
  skeletonCount?: number;
  emptyMessage?: string;
}

export function MovieGrid({
  movies,
  isLoading = false,
  mediaType = "movie",
  skeletonCount = 12,
  emptyMessage = "No titles found",
}: MovieGridProps) {
  const INITIAL_LOAD = 20;
  const LOAD_MORE_COUNT = 20;
  
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({});

  // Ripple effect handler
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

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <h3 className="text-2xl font-semibold text-[#F5F5F5] mb-3">
          {emptyMessage}
        </h3>
        <p className="text-base text-[#A0A0A0] text-center max-w-md">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  const visibleMovies = movies.slice(0, visibleCount);
  const hasMore = visibleCount < movies.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, movies.length));
  };

  return (
    <div className="space-y-8">
      {/* Movie Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2"
        role="list"
        aria-label={`${mediaType === "movie" ? "Movies" : "TV Shows"} grid`}
      >
        {visibleMovies.map((movie) => (
          <div key={movie.id} role="listitem">
            <MovieCard movie={movie} mediaType={mediaType} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              handleRipple(e, "load-more");
              loadMore();
            }}
            className="px-8 py-3 bg-[#1A1A1A]/50 text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 backdrop-blur-xl rounded-lg font-medium transition-all duration-200 relative overflow-hidden group"
          >
            {/* Ripple effects */}
            {ripples["load-more"]?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}

            {/* Gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
              style={{
                background: "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
              }}
            />

            <span className="relative z-10">
              Load More ({movies.length - visibleCount} remaining)
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );
}