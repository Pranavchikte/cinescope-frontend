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
  const INITIAL_LOAD = 20; // Only load 20 cards initially
  const LOAD_MORE_COUNT = 20; // Load 20 more when clicking "Load More"
  
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

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
      {/* Movie Grid - Only render visible cards */}
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
            onClick={loadMore}
            className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#14B8A6]/20 border border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg text-[#F5F5F5] font-medium transition-all duration-200"
          >
            Load More ({movies.length - visibleCount} remaining)
          </motion.button>
        </div>
      )}
    </div>
  );
}