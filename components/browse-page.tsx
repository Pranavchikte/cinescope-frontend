"use client";

import { moviesAPI, getAccessToken } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Info, Play } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { MovieCardSkeleton } from "@/components/movie-card-skeleton";
import { FilterBar, FilterState } from "@/components/filter-bar";

interface TMDBMovie {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string;
  release_date: string;
  backdrop_path?: string;
  overview?: string;
}

interface FeaturedMovie {
  id: number;
  title: string;
  overview: string;
  backdrop: string;
  rating: number;
  year: number;
  genres?: string[];
}

function HeroBanner({ movie }: { movie: FeaturedMovie | null }) {
  if (!movie) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] bg-card animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={movie.backdrop || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Elegant Gradient Overlays - Minimalist Style */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 sm:pb-16 lg:pb-24 px-6 sm:px-8 lg:px-16">
        <div className="max-w-2xl space-y-4 sm:space-y-5">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight text-balance"
          >
            {movie.title}
          </motion.h1>

          {/* Meta Info - Refined */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 text-sm sm:text-base flex-wrap"
          >
            <span className="text-primary font-medium text-lg">
              {Math.round(movie.rating * 10)}%
            </span>
            <span className="text-muted text-sm">{movie.year}</span>
            {movie.genres && movie.genres.length > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-muted text-sm">
                  {movie.genres.slice(0, 2).join(" · ")}
                </span>
              </>
            )}
          </motion.div>

          {/* Description - Elegant & Concise */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base lg:text-base text-muted line-clamp-2 sm:line-clamp-3 max-w-lg leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          {/* Buttons - Minimalist Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 pt-3"
          >
            <button className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Play className="w-5 h-5 sm:w-5 sm:h-5 fill-current" />
              <span>Watch Now</span>
            </button>
            <button className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent border border-border hover:border-primary hover:text-primary text-muted rounded-lg text-sm sm:text-base font-medium transition-all duration-200 hover:bg-primary/5">
              <Info className="w-5 h-5 sm:w-5 sm:h-5" />
              <span>Details</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ScrollContainer({
  title,
  movies,
  isLoading = false,
}: {
  title: string;
  movies: any[];
  isLoading?: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    const element = scrollContainerRef.current;
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 10,
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const element = scrollContainerRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      return () => element.removeEventListener("scroll", checkScroll);
    }
  }, [movies]);

  useEffect(() => {
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const element = scrollContainerRef.current;
    if (element) {
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="space-y-4 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Header - Minimalist Style */}
      <h2 className="text-xl md:text-2xl font-semibold text-foreground px-6 sm:px-8 lg:px-16">
        {title}
      </h2>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button - Subtle Hover */}
        <AnimatePresence>
          {isHovered && canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-background via-background/40 to-transparent items-center justify-start pl-3 hover:from-background transition-all"
            >
              <div className="w-9 h-9 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Scroll Button - Subtle Hover */}
        <AnimatePresence>
          {isHovered && canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-background via-background/40 to-transparent items-center justify-end pr-3 hover:from-background transition-all"
            >
              <div className="w-9 h-9 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 sm:px-8 lg:px-16 pb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
                >
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
                >
                  <MovieCard movie={movie} mediaType="movie" />
                </motion.div>
              ))}
        </div>

        {/* Gradient Fade Edges - Mobile */}
        <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}

export function BrowsePage() {
  const [featuredMovie, setFeaturedMovie] = useState<FeaturedMovie | null>(
    null,
  );
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [personalizedMovies, setPersonalizedMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [providers, setProviders] = useState<
    { provider_id: number; provider_name: string; logo_path: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    genre: "",
    year: null,
    language: "",
    country: "",
    provider: "",
    sort_by: "popularity.desc",
    vote_count_min: 100,
    vote_average_min: null,
    vote_average_max: null,
    runtime_min: null,
    runtime_max: null,
  });

  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch only essential data first - trending and genres
      const [trending, genresData] = await Promise.all([
        moviesAPI.getTrending(),
        moviesAPI.getGenres(),
      ]);

      const transformMovie = (m: TMDBMovie) => ({
        id: m.id,
        title: m.title,
        rating: m.vote_average,
        poster: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : "",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
      });

      const trendingTransformed = trending.results.map(transformMovie);
      setTrendingMovies(trendingTransformed);
      setGenres(genresData.genres || []);

      // Set featured movie
      if (trending.results.length > 0) {
        const featured = trending.results[0];
        setFeaturedMovie({
          id: featured.id,
          title: featured.title,
          overview: featured.overview || "",
          backdrop: featured.backdrop_path
            ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
            : "",
          rating: featured.vote_average,
          year: featured.release_date
            ? new Date(featured.release_date).getFullYear()
            : 2024,
        });
      }

      // Fetch non-critical data after initial render (lazy load)
      setTimeout(async () => {
        const [popular, providersData] = await Promise.all([
          moviesAPI.getPopular(),
          moviesAPI.getProviders("IN"),
        ]);
        setPopularMovies(popular.results.map(transformMovie));
        setFilteredMovies(popular.results.map(transformMovie));
        setProviders(providersData.results || []);
      }, 100); // Load after 100ms

    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchInitialData();
}, []);

  useEffect(() => {
  const fetchPersonalized = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        setIsAuthenticated(true);
        
        // Delay personalized fetch - it's not critical for initial render
        setTimeout(async () => {
          const data = await moviesAPI.getPersonalized(1, 500, 6.5);

          if (!data || !data.results) {
            console.error("Invalid response from personalized API:", data);
            return;
          }

          const transformMovie = (m: TMDBMovie) => ({
            id: m.id,
            title: m.title,
            rating: m.vote_average,
            poster: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "",
            year: m.release_date
              ? new Date(m.release_date).getFullYear()
              : 2024,
          });

          setPersonalizedMovies(data.results.map(transformMovie));
        }, 500); // Load after page is visible
      }
    } catch (error) {
      console.error("Failed to fetch personalized movies:", error);
    }
  };

  fetchPersonalized();
}, []);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFiltering(true);

        const params: any = {
          sort_by: currentFilters.sort_by,
          page: 1,
          vote_count_min: currentFilters.vote_count_min,
        };

        if (currentFilters.genre) params.genre = currentFilters.genre;
        if (currentFilters.year) params.year = currentFilters.year;
        if (currentFilters.language) params.language = currentFilters.language;
        if (currentFilters.country) params.country = currentFilters.country;
        if (currentFilters.provider) params.provider = currentFilters.provider;
        if (currentFilters.vote_average_min !== null)
          params.vote_average_min = currentFilters.vote_average_min;
        if (currentFilters.vote_average_max !== null)
          params.vote_average_max = currentFilters.vote_average_max;
        if (currentFilters.runtime_min !== null)
          params.runtime_min = currentFilters.runtime_min;
        if (currentFilters.runtime_max !== null)
          params.runtime_max = currentFilters.runtime_max;

        const data = await moviesAPI.discover(params);

        const transformMovie = (m: TMDBMovie) => ({
          id: m.id,
          title: m.title,
          rating: m.vote_average,
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "",
          year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        });

        setFilteredMovies(data.results.map(transformMovie));
      } catch (error) {
        console.error("Failed to fetch filtered movies:", error);
      } finally {
        setIsFiltering(false);
      }
    };

    fetchFilteredData();
  }, [currentFilters]);

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const hasActiveFilters =
    currentFilters.genre ||
    currentFilters.year ||
    currentFilters.language ||
    currentFilters.country ||
    currentFilters.provider ||
    currentFilters.vote_count_min !== 100 ||
    currentFilters.vote_average_min !== null ||
    currentFilters.vote_average_max !== null ||
    currentFilters.runtime_min !== null ||
    currentFilters.runtime_max !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner - Only show when no filters active */}
      {!hasActiveFilters && <HeroBanner movie={featuredMovie} />}

      {/* Filter Bar - Sticky */}
      <div className="sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border">
        <FilterBar
          onFilterChange={handleFilterChange}
          mediaType="movie"
          genres={genres}
          providers={providers}
        />
      </div>

      {/* Main Content */}
      <div className="pt-8 pb-24">
        {/* Carousel Sections */}
        {!hasActiveFilters && (
          <div className="space-y-16">
            {isAuthenticated && personalizedMovies.length > 0 && (
              <ScrollContainer
                title="Recommended For You"
                movies={personalizedMovies}
                isLoading={isLoading}
              />
            )}

            <ScrollContainer
              title="Trending Now"
              movies={trendingMovies}
              isLoading={isLoading}
            />

            <ScrollContainer
              title="Popular on Netflix"
              movies={popularMovies}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Filtered Results Grid */}
        <div className="px-6 sm:px-8 lg:px-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {hasActiveFilters ? "Search Results" : "Explore All"}
              </h2>
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {!isFiltering && filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    No titles found
                  </h3>
                  <p className="text-base text-muted">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              </div>
            ) : (
              <MovieGrid
                movies={filteredMovies}
                isLoading={isFiltering}
                mediaType="movie"
                skeletonCount={12}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
