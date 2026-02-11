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
  const [ripples, setRipples] = useState<{
    [key: string]: { x: number; y: number; id: number }[];
  }>({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ripple effect handler - disabled on mobile
  const handleRipple = (e: React.MouseEvent, key: string) => {
    if (isMobile) return; // Skip ripples on mobile

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

  if (!movie) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] bg-[#1A1A1A] animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
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
        {/* Mobile: 2 gradients only, Desktop: Full gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/40 to-transparent md:block" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0F0F0F] to-transparent md:hidden" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 sm:pb-16 lg:pb-24 px-6 sm:px-8 lg:px-16">
        <div className="max-w-2xl space-y-4 sm:space-y-5">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5F5F5] leading-tight text-balance"
          >
            {movie.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 text-sm sm:text-base flex-wrap"
          >
            <span className="text-[#14B8A6] font-medium text-lg">
              {Math.round(movie.rating * 10)}%
            </span>
            <span className="text-[#A0A0A0] text-sm">{movie.year}</span>
            {movie.genres && movie.genres.length > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-[#2A2A2A]" />
                <span className="text-[#A0A0A0] text-sm">
                  {movie.genres.slice(0, 2).join(" · ")}
                </span>
              </>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base lg:text-base text-[#A0A0A0] line-clamp-2 sm:line-clamp-3 max-w-lg leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 pt-3"
          >
            <motion.button
              onClick={(e) => handleRipple(e, "watch-now")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 relative overflow-hidden group"
            >
              {/* Ripple effect - desktop only */}
              {!isMobile &&
                ripples["watch-now"]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}

              {/* Gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Blur glow - desktop only */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:blur-lg"
                style={{
                  background:
                    "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                }}
              />

              <Play className="w-5 h-5 sm:w-5 sm:h-5 fill-current relative z-10" />
              <span className="relative z-10">Watch Now</span>
            </motion.button>

            <motion.button
              onClick={(e) => handleRipple(e, "details")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent border border-[#2A2A2A] hover:border-[#14B8A6] hover:text-[#14B8A6] text-[#A0A0A0] rounded-lg text-sm sm:text-base font-medium transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Ripple effect - desktop only */}
              {!isMobile &&
                ripples["details"]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}

              <div className="absolute inset-0 bg-[#14B8A6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <Info className="w-5 h-5 sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10">Details</span>
            </motion.button>
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
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState<{
    [key: string]: { x: number; y: number; id: number }[];
  }>({});

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ripple effect handler - disabled on mobile
  const handleRipple = (e: React.MouseEvent, key: string) => {
    if (isMobile) return;

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
      {/* Section Header */}
      <h2 className="text-xl md:text-2xl font-semibold text-[#F5F5F5] px-6 sm:px-8 lg:px-16">
        {title}
      </h2>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button - Desktop: AnimatePresence, Mobile: Simple */}
        {!isMobile ? (
          <AnimatePresence>
            {isHovered && canScrollLeft && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  handleRipple(e, "scroll-left");
                  scroll("left");
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent items-center justify-start pl-3 hover:from-[#0F0F0F] transition-all"
              >
                <div className="w-9 h-9 bg-[#1A1A1A]/50 hover:bg-[#14B8A6] hover:text-[#0F0F0F] rounded-full flex items-center justify-center transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden group/btn">
                  {ripples["scroll-left"]?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-white/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                      animate={{ width: 60, height: 60, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
                  <ChevronLeft className="w-5 h-5 text-[#F5F5F5] relative z-10" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        ) : null}

        {/* Right Scroll Button - Desktop: AnimatePresence, Mobile: Simple */}
        {!isMobile ? (
          <AnimatePresence>
            {isHovered && canScrollRight && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  handleRipple(e, "scroll-right");
                  scroll("right");
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent items-center justify-end pr-3 hover:from-[#0F0F0F] transition-all"
              >
                <div className="w-9 h-9 bg-[#1A1A1A]/50 hover:bg-[#14B8A6] hover:text-[#0F0F0F] rounded-full flex items-center justify-center transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden group/btn">
                  {ripples["scroll-right"]?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-white/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                      animate={{ width: 60, height: 60, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}

                  <div className="absolute inset-0 bg-gradient-to-l from-[#14B8A6]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
                  <ChevronRight className="w-5 h-5 text-[#F5F5F5] relative z-10" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        ) : null}

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
        <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0F0F0F] to-transparent" />
        <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0F0F0F] to-transparent" />
      </div>
    </div>
  );
}

export function BrowsePage() {
  const [featuredMovie, setFeaturedMovie] = useState<FeaturedMovie | null>(
    null,
  );
  const [featuredMovies, setFeaturedMovies] = useState<FeaturedMovie[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [personalizedMovies, setPersonalizedMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [providers, setProviders] = useState<
    {
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }[]
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

  const transformMovie = (m: TMDBMovie) => ({
    id: m.id,
    title: m.title,
    rating: m.vote_average,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "",
    year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
  });

  // Auto-rotate hero banner every 8 seconds
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredMovies.length]);

  // Update featured movie when index changes
  useEffect(() => {
    if (featuredMovies.length > 0) {
      setFeaturedMovie(featuredMovies[currentHeroIndex]);
    }
  }, [currentHeroIndex, featuredMovies]);

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setIsLoading(true);

        const trending = await moviesAPI.getTrending().catch((err) => {
          console.error("Trending fetch error:", err);
          return { results: [] };
        });

        if (!trending || !trending.results) {
          console.error("Invalid trending response:", trending);
          setIsLoading(false);
          return;
        }

        const trendingTransformed = trending.results.map(transformMovie);
        setTrendingMovies(trendingTransformed);

        // Create featured movies array from top 5 trending
        if (trending.results.length > 0) {
          const topFeatured = trending.results
            .slice(0, 5)
            .map((featured: TMDBMovie) => ({
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
            }));
          setFeaturedMovies(topFeatured);
          setFeaturedMovie(topFeatured[0]);
        }

        setIsLoading(false);

        setTimeout(async () => {
          try {
            const [genresData, popular, providersData] = await Promise.all([
              moviesAPI.getGenres().catch(() => ({ genres: [] })),
              moviesAPI.getPopular().catch(() => ({ results: [] })),
              moviesAPI.getProviders("IN").catch(() => ({ results: [] })),
            ]);

            setGenres(genresData.genres || []);

            if (popular.results) {
              const popularTransformed = popular.results.map(transformMovie);
              setPopularMovies(popularTransformed);
              setFilteredMovies(popularTransformed);
            }

            setProviders(providersData.results || []);
          } catch (error) {
            console.error("Failed to load secondary data:", error);
          }
        }, 200);

        const token = getAccessToken();
        if (token) {
          setIsAuthenticated(true);
          setTimeout(async () => {
            try {
              const data = await moviesAPI.getPersonalized(1, 500, 6.5);
              if (data?.results) {
                setPersonalizedMovies(data.results.map(transformMovie));
              }
            } catch (error) {
              console.error("Failed to load personalized:", error);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Critical fetch error:", error);
        setIsLoading(false);
      }
    };

    fetchCriticalData();
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
    <div className="min-h-screen bg-[#0F0F0F]">
      {!hasActiveFilters && <HeroBanner movie={featuredMovie} />}

      <div className="sticky top-0 z-40 bg-[#0F0F0F]/98 backdrop-blur-md border-b border-[#2A2A2A]">
        <FilterBar
          onFilterChange={handleFilterChange}
          mediaType="movie"
          genres={genres}
          providers={providers}
        />
      </div>

      <div className="pt-8 pb-24">
        {!hasActiveFilters && (
          <div className="space-y-16">
            {isAuthenticated && personalizedMovies.length > 0 && (
              <ScrollContainer
                title="Recommended For You"
                movies={personalizedMovies}
                isLoading={false}
              />
            )}

            <ScrollContainer
              title="Trending Now"
              movies={trendingMovies}
              isLoading={isLoading}
            />

            <ScrollContainer
              title="Popular"
              movies={popularMovies}
              isLoading={false}
            />
          </div>
        )}

        <div className="px-6 sm:px-8 lg:px-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#F5F5F5]">
                {hasActiveFilters ? "Search Results" : "Explore All"}
              </h2>
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {!isFiltering && filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-[#F5F5F5]">
                    No titles found
                  </h3>
                  <p className="text-base text-[#A0A0A0]">
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
