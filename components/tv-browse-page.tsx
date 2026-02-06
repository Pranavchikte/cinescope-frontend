"use client";

import { tvAPI, getAccessToken } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { FilterBar, FilterState } from "@/components/filter-bar";

interface TMDBShow {
  id: number;
  name: string;
  vote_average: number;
  poster_path: string;
  first_air_date: string;
}

function ScrollContainer({
  title,
  shows,
  isLoading = false,
}: {
  title: string;
  shows: any[];
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
      {/* Section Header - Minimalist Style */}
      <h2 className="text-xl md:text-2xl font-semibold text-[#F5F5F5] px-6 sm:px-8 lg:px-16">
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

        {/* Gradient Fade Edges - Mobile */}
        <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}

export function TVBrowsePage() {
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

  // Load critical data first
  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setIsLoading(true);

        // Only fetch trending first
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
        setIsLoading(false);

        // Lazy load secondary data
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

        // Load personalized if authenticated
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

  // Handle filter changes
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
      <div className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#2A2A2A]/50">
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
              />
            )}

            <ScrollContainer
              title="Trending Now"
              shows={trendingShows}
              isLoading={isLoading}
            />

            <ScrollContainer
              title="Popular on Netflix"
              shows={popularShows}
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
