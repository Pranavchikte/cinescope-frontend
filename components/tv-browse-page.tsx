"use client";

import { tvAPI, getAccessToken } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Play, Info } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { FilterBar, FilterState } from "@/components/filter-bar";

interface TMDBShow {
  id: number;
  name: string;
  vote_average: number;
  poster_path: string;
  first_air_date: string;
  backdrop_path?: string;
  overview?: string;
}

interface FeaturedShow {
  id: number;
  title: string;
  overview: string;
  backdrop: string;
  rating: number;
  year: number;
  genres?: string[];
}

function HeroBanner({
  show,
  ripples,
  handleRipple,
  isMobile,
}: {
  show: FeaturedShow | null;
  ripples: { [key: string]: { x: number; y: number; id: number }[] };
  handleRipple: (e: React.MouseEvent, key: string) => void;
  isMobile: boolean;
}) {
  if (!show) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] bg-[#1A1A1A] animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={show.backdrop || "/placeholder.svg"}
          alt={show.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Mobile: 2 gradients, Desktop: Full gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/40 to-transparent md:block" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0F0F0F] to-transparent md:hidden" />
      </div>

      <div className="relative h-full flex items-end pb-12 sm:pb-16 lg:pb-24 px-6 sm:px-8 lg:px-16">
        <div className="max-w-2xl space-y-4 sm:space-y-5">
          <motion.h1
            key={show.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5F5F5] leading-tight text-balance"
          >
            {show.title}
          </motion.h1>

          <motion.div
            key={`${show.id}-meta`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 text-sm sm:text-base flex-wrap"
          >
            <span className="text-[#14B8A6] font-medium text-lg">
              {Math.round(show.rating * 10)}%
            </span>
            <span className="text-[#A0A0A0] text-sm">{show.year}</span>
            {show.genres && show.genres.length > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-[#2A2A2A]" />
                <span className="text-[#A0A0A0] text-sm">
                  {show.genres.slice(0, 2).join(" · ")}
                </span>
              </>
            )}
          </motion.div>

          <motion.p
            key={`${show.id}-overview`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base lg:text-base text-[#A0A0A0] line-clamp-2 sm:line-clamp-3 max-w-lg leading-relaxed"
          >
            {show.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 pt-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleRipple(e, "watch-now")}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 relative overflow-hidden group"
            >
              {/* Ripple - desktop only */}
              {!isMobile && ripples["watch-now"]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-white/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Blur - desktop only */}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleRipple(e, "details")}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1A1A1A]/50 border border-[#2A2A2A] hover:border-[#14B8A6]/50 hover:text-[#14B8A6] text-[#F5F5F5] rounded-lg text-sm sm:text-base font-medium transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden hover:bg-[#14B8A6]/5"
            >
              {/* Ripple - desktop only */}
              {!isMobile && ripples["details"]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
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
  shows,
  isLoading = false,
  ripples,
  handleRipple,
  isMobile,
}: {
  title: string;
  shows: any[];
  isLoading?: boolean;
  ripples: { [key: string]: { x: number; y: number; id: number }[] };
  handleRipple: (e: React.MouseEvent, key: string) => void;
  isMobile: boolean;
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
        element.scrollLeft < element.scrollWidth - element.clientWidth - 10
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
  }, [shows]);

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
      <h2 className="text-xl md:text-2xl font-semibold text-[#F5F5F5] px-6 sm:px-8 lg:px-16">
        {title}
      </h2>

      <div className="relative">
        {/* Desktop only: AnimatePresence */}
        {!isMobile ? (
          <>
            <AnimatePresence>
              {isHovered && canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    handleRipple(e, `scroll-left-${title}`);
                    scroll("left");
                  }}
                  className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent items-center justify-start pl-3 hover:from-[#0F0F0F] transition-all"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 hover:border-[#14B8A6]/50 border border-[#2A2A2A] rounded-full flex items-center justify-center transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden group/btn"
                  >
                    {ripples[`scroll-left-${title}`]?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                        animate={{ width: 50, height: 50, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    <ChevronLeft className="w-5 h-5 text-[#F5F5F5] group-hover/btn:text-[#14B8A6] transition-colors relative z-10" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isHovered && canScrollRight && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    handleRipple(e, `scroll-right-${title}`);
                    scroll("right");
                  }}
                  className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent items-center justify-end pr-3 hover:from-[#0F0F0F] transition-all"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 bg-[#1A1A1A]/80 hover:bg-[#14B8A6]/20 hover:border-[#14B8A6]/50 border border-[#2A2A2A] rounded-full flex items-center justify-center transition-all duration-200 md:backdrop-blur-xl relative overflow-hidden group/btn"
                  >
                    {ripples[`scroll-right-${title}`]?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                        animate={{ width: 50, height: 50, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    <ChevronRight className="w-5 h-5 text-[#F5F5F5] group-hover/btn:text-[#14B8A6] transition-colors relative z-10" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </>
        ) : null}

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
                  <div className="aspect-[2/3] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg animate-pulse" />
                </div>
              ))
            : shows.map((show) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
                >
                  <MovieCard movie={show} mediaType="tv" />
                </motion.div>
              ))}
        </div>

        <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0F0F0F] to-transparent" />
        <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0F0F0F] to-transparent" />
      </div>
    </div>
  );
}

export function TVBrowsePage() {
  const [featuredShow, setFeaturedShow] = useState<FeaturedShow | null>(null);
  const [featuredShows, setFeaturedShows] = useState<FeaturedShow[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [trendingShows, setTrendingShows] = useState<any[]>([]);
  const [popularShows, setPopularShows] = useState<any[]>([]);
  const [filteredShows, setFilteredShows] = useState<any[]>([]);
  const [personalizedShows, setPersonalizedShows] = useState<any[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [providers, setProviders] = useState<
    { provider_id: number; provider_name: string; logo_path: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Ripple state
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

  const handleRipple = (e: React.MouseEvent, key: string) => {
    if (isMobile) return; // Skip on mobile

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

  const transformShow = (s: TMDBShow) => ({
    id: s.id,
    title: s.name,
    rating: s.vote_average,
    poster: s.poster_path
      ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
      : "",
    year: s.first_air_date
      ? new Date(s.first_air_date).getFullYear()
      : 2024,
  });

  // Auto-rotate hero banner every 8 seconds
  useEffect(() => {
    if (featuredShows.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % featuredShows.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredShows.length]);

  // Update featured show when index changes
  useEffect(() => {
    if (featuredShows.length > 0) {
      setFeaturedShow(featuredShows[currentHeroIndex]);
    }
  }, [currentHeroIndex, featuredShows]);

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setIsLoading(true);

        const trending = await tvAPI.getTrending().catch((err) => {
          console.error("Trending TV fetch error:", err);
          return { results: [] };
        });

        if (!trending || !trending.results) {
          console.error("Invalid trending response:", trending);
          setIsLoading(false);
          return;
        }

        setTrendingShows(trending.results.map(transformShow));

        // Create featured shows array from top 5 trending
        if (trending.results.length > 0) {
          const topFeatured = trending.results
            .slice(0, 5)
            .map((featured: TMDBShow) => ({
              id: featured.id,
              title: featured.name,
              overview: featured.overview || "",
              backdrop: featured.backdrop_path
                ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
                : "",
              rating: featured.vote_average,
              year: featured.first_air_date
                ? new Date(featured.first_air_date).getFullYear()
                : 2024,
            }));
          setFeaturedShows(topFeatured);
          setFeaturedShow(topFeatured[0]);
        }

        setIsLoading(false);

        setTimeout(async () => {
          try {
            const [genresData, popular, providersData] = await Promise.all([
              tvAPI.getGenres().catch(() => ({ genres: [] })),
              tvAPI.getPopular().catch(() => ({ results: [] })),
              tvAPI.getProviders("IN").catch(() => ({ results: [] })),
            ]);

            setGenres(genresData.genres || []);

            if (popular.results) {
              const popularTransformed = popular.results.map(transformShow);
              setPopularShows(popularTransformed);
              setFilteredShows(popularTransformed);
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
              const data = await tvAPI.getPersonalized(1, 500, 6.5);
              if (data?.results) {
                setPersonalizedShows(data.results.map(transformShow));
              }
            } catch (error) {
              console.error("Failed to load personalized:", error);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Critical TV fetch error:", error);
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

        const data = await tvAPI.discover(params);

        if (data?.results) {
          setFilteredShows(data.results.map(transformShow));
        }
      } catch (error) {
        console.error("Failed to fetch filtered TV shows:", error);
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
    currentFilters.vote_average_max !== null;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {!hasActiveFilters && (
        <HeroBanner
          show={featuredShow}
          ripples={ripples}
          handleRipple={handleRipple}
          isMobile={isMobile}
        />
      )}

      <div className="sticky top-0 z-40 bg-[#0F0F0F]/98 border-b border-[#2A2A2A]">
        <FilterBar
          onFilterChange={handleFilterChange}
          mediaType="tv"
          genres={genres}
          providers={providers}
        />
      </div>

      <div className="pt-8 pb-24">
        {!hasActiveFilters && (
          <div className="space-y-16">
            {isAuthenticated && personalizedShows.length > 0 && (
              <ScrollContainer
                title="Recommended For You"
                shows={personalizedShows}
                isLoading={false}
                ripples={ripples}
                handleRipple={handleRipple}
                isMobile={isMobile}
              />
            )}

            <ScrollContainer
              title="Trending Now"
              shows={trendingShows}
              isLoading={isLoading}
              ripples={ripples}
              handleRipple={handleRipple}
              isMobile={isMobile}
            />

            <ScrollContainer
              title="Popular"
              shows={popularShows}
              isLoading={false}
              ripples={ripples}
              handleRipple={handleRipple}
              isMobile={isMobile}
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

            {!isFiltering && filteredShows.length === 0 ? (
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
                movies={filteredShows}
                isLoading={isFiltering}
                mediaType="tv"
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