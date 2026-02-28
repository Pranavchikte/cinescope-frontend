"use client";

import { moviesAPI, tvAPI } from "@/lib/api";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Film, Tv, AlertCircle, SlidersHorizontal } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieCardSkeleton } from "@/components/movie-card-skeleton";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [discoverMovies, setDiscoverMovies] = useState<any[]>([]);
  const [discoverTV, setDiscoverTV] = useState<any[]>([]);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setFilteredResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [moviesData, tvData] = await Promise.all([
          moviesAPI.search(query),
          tvAPI.search(query),
        ]);

        const transformMovie = (m: any) => {
          const popularity = m.popularity || 0;
          const vote_count = Math.max(m.vote_count || 0, 1);
          const vote_average = m.vote_average || 5.0;

          const searchScore =
            popularity * (1 + Math.log10(vote_count)) * (vote_average / 10);

          return {
            id: m.id,
            title: m.title,
            rating: m.vote_average,
            poster: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "",
            year: m.release_date
              ? new Date(m.release_date).getFullYear()
              : 2024,
            mediaType: "movie" as const,
            searchScore,
          };
        };

        const transformTV = (s: any) => {
          const popularity = s.popularity || 0;
          const vote_count = Math.max(s.vote_count || 0, 1);
          const vote_average = s.vote_average || 5.0;

          const searchScore =
            popularity * (1 + Math.log10(vote_count)) * (vote_average / 10);

          return {
            id: s.id,
            title: s.name,
            rating: s.vote_average,
            poster: s.poster_path
              ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
              : "",
            year: s.first_air_date
              ? new Date(s.first_air_date).getFullYear()
              : 2024,
            mediaType: "tv" as const,
            searchScore,
          };
        };

        const allResults = [
          ...moviesData.results.map(transformMovie),
          ...tvData.results.map(transformTV),
        ].sort((a, b) => b.searchScore - a.searchScore);

        setResults(allResults);
        setFilteredResults(allResults);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to search. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  useEffect(() => {
    const fetchDiscover = async () => {
      if (query.trim()) return;
      setIsDiscoverLoading(true);
      setDiscoverError(null);
      try {
        const [moviesData, tvData] = await Promise.all([
          moviesAPI.getTrending(),
          tvAPI.getTrending(),
        ]);
        setDiscoverMovies(
          (moviesData?.results || []).slice(0, 12).map((m: any) => ({
            id: m.id,
            title: m.title,
            rating: m.vote_average,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
            mediaType: "movie" as const,
          }))
        );
        setDiscoverTV(
          (tvData?.results || []).slice(0, 12).map((s: any) => ({
            id: s.id,
            title: s.name,
            rating: s.vote_average,
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
            year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
            mediaType: "tv" as const,
          }))
        );
      } catch (err) {
        console.error("Discover fetch failed:", err);
        setDiscoverError("Failed to load suggestions.");
      } finally {
        setIsDiscoverLoading(false);
      }
    };

    fetchDiscover();
  }, [query]);

  useEffect(() => {
    let filtered = [...results];

    if (mediaFilter !== "all") {
      filtered = filtered.filter((item) => item.mediaType === mediaFilter);
    }

    setFilteredResults(filtered);
  }, [results, mediaFilter]);

  const movieCount = results.filter((r) => r.mediaType === "movie").length;
  const tvCount = results.filter((r) => r.mediaType === "tv").length;

  const filterTabs = [
    { key: "all", label: "All", count: results.length, icon: null },
    { key: "movie", label: "Movies", count: movieCount, icon: Film },
    { key: "tv", label: "TV", count: tvCount, icon: Tv },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-card/70 rounded-lg w-64 mb-3 animate-pulse" />
          <div className="h-5 bg-card/70 rounded w-96 mb-12 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-card/70 border border-border/70 rounded-2xl"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold"
          >
            Go Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isEmpty = filteredResults.length === 0;
  const isDiscoverMode = !query.trim();

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
            {query ? `Results for "${query}"` : "Find Something to Watch"}
          </h1>
          {!isDiscoverMode && !isEmpty && (
            <p className="text-sm text-muted-foreground">
              {filteredResults.length} {filteredResults.length === 1 ? "title" : "titles"} ready to stream
            </p>
          )}
        </div>

        <div className="lg:hidden mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Filter results</p>
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Filter</p>
              {filterTabs.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setMediaFilter(filter.key as "all" | "movie" | "tv")}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                    mediaFilter === filter.key
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {filter.icon ? <filter.icon className="h-4 w-4" /> : null}
                    {filter.label}
                  </span>
                  <span className="text-xs">{filter.count}</span>
                </button>
              ))}
            </div>
          </aside>

          <div>
            <AnimatePresence mode="wait">
              {isDiscoverMode ? (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10"
                >
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                      Start Watching
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Search by title, actor, or genre — or pick something trending below.
                    </p>
                  </div>

                  {discoverError && (
                    <div className="text-muted-foreground text-sm">{discoverError}</div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Trending Movies
                    </h3>
                    {isDiscoverLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <MovieCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {discoverMovies.map((movie) => (
                          <MovieCard key={`d-m-${movie.id}`} movie={movie} mediaType="movie" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Trending TV</h3>
                    {isDiscoverLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <MovieCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {discoverTV.map((show) => (
                          <MovieCard key={`d-t-${show.id}`} movie={show} mediaType="tv" />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : isEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <div className="w-16 h-16 mb-6 flex items-center justify-center bg-card/70 border border-border/70 rounded-2xl">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    No results found
                  </h2>
                  <p className="text-muted-foreground text-center max-w-md mb-8">
                    {query
                      ? `We couldn't find any titles matching "${query}". Try different keywords.`
                      : "Try searching for movies or TV shows"}
                  </p>
                  <motion.button
                    onClick={() => router.push("/")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold"
                  >
                    Start Watching
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
                >
                  {filteredResults.map((movie, index) => (
                    <motion.div
                      key={`${movie.mediaType}-${movie.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      <MovieCard movie={movie} mediaType={movie.mediaType} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-card/95 border border-border/70 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Filter results</h3>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {filterTabs.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setMediaFilter(filter.key as "all" | "movie" | "tv");
                      setIsFilterSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                      mediaFilter === filter.key
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {filter.icon ? <filter.icon className="h-4 w-4" /> : null}
                      {filter.label}
                    </span>
                    <span className="text-xs">{filter.count}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl opacity-50 animate-pulse" />
              <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>
          </motion.div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
