"use client";

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

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2"
      role="list"
      aria-label={`${mediaType === "movie" ? "Movies" : "TV Shows"} grid`}
    >
      {movies.map((movie) => (
        <div key={movie.id} role="listitem">
          <MovieCard movie={movie} mediaType={mediaType} />
        </div>
      ))}
    </div>
  );
}
