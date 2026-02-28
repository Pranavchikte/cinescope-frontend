"use client";

import { useState } from "react";
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground">
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
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4"
        role="list"
        aria-label={`${mediaType === "movie" ? "Movies" : "TV"} grid`}
      >
        {visibleMovies.map((movie) => (
          <div key={movie.id} role="listitem">
            <MovieCard movie={movie} mediaType={mediaType} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="rounded-full border border-border/70 bg-card/70 px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/50"
          >
            Load More ({movies.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
