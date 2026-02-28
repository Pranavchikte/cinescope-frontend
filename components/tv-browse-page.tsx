"use client";

import { tvAPI, getAccessToken, authAPI, moviesAPI } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Play, Info } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { FilterBar, FilterState } from "@/components/filter-bar";
import { useRouter } from "next/navigation";

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
  isAuthenticated,
}: {
  show: FeaturedShow | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  if (!show) {
    return (
      <div className="relative h-[55vh] md:h-[70vh] bg-card/70 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-[55vh] md:h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={show.backdrop || "/placeholder.svg"}
          alt={show.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
      </div>

      <div className="relative h-full flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="max-w-2xl space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground"
            >
              Featured Series
            </motion.div>

            <motion.h1
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight text-balance"
            >
              {show.title}
            </motion.h1>

            <motion.div
              key={`${show.id}-meta`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 text-sm sm:text-base flex-wrap text-muted-foreground"
            >
              <span className="text-primary font-semibold text-lg">
                {Math.round(show.rating * 10)}%
              </span>
              <span>{show.year}</span>
              {show.genres && show.genres.length > 0 && (
                <span>{show.genres.slice(0, 2).join(" · ")}</span>
              )}
            </motion.div>

            <motion.p
              key={`${show.id}-overview`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm sm:text-base text-muted-foreground line-clamp-3 max-w-lg leading-relaxed"
            >
              {show.overview}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 pt-3"
            >
              <button
                onClick={() => {
                  if (!show) return;
                  if (!isAuthenticated) {
                    router.push(`/login?redirect=${encodeURIComponent(`/watch/tv/${show.id}`)}`);
                    return;
                  }
                  router.push(`/watch/tv/${show.id}`);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Watch Now
              </button>
              <button
                onClick={() => router.push(`/tv/${show.id}`)}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground"
              >
                <Info className="w-4 h-4" />
                Details
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueHero({
  item,
  isAuthenticated,
}: {
  item: any | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  if (!item) return null;

  const watchLink =
    item.mediaType === "movie"
      ? `/watch/movie/${item.id}`
      : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`;

  const heroBackdrop = item.backdrop || item.poster || "/placeholder.svg";

  return (
    <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBackdrop}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
      </div>

      <div className="relative h-full flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              Continue Watching
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-foreground text-balance">
              {item.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {item.mediaType === "tv"
                ? `Season ${item.season || 1} • Episode ${item.episode || 1}`
                : "Movie"}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(`/login?redirect=${encodeURIComponent(watchLink)}`);
                    return;
                  }
                  router.push(watchLink);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Resume
              </button>
              <button
                onClick={() => router.push(`/${item.mediaType}/${item.id}`)}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    <section className="space-y-4">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-9 w-9 rounded-full border border-border/70 bg-card/70 text-foreground transition disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 mx-auto" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-9 w-9 rounded-full border border-border/70 bg-card/70 text-foreground transition disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px]">
                  <div className="aspect-[2/3] rounded-2xl bg-card/70 border border-border/70 animate-pulse" />
                </div>
              ))
            : shows.map((show) => (
                <div key={show.id} className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px]">
                  <MovieCard movie={show} mediaType="tv" />
                </div>
              ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
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
  const [continueItem, setContinueItem] = useState<any | null>(null);
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
              tvAPI.getProviders("US").catch(() => ({ results: [] })),
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

          setTimeout(async () => {
            try {
              const user = await authAPI.getCurrentUser();
              if (user?.last_viewed_tmdb_id && user?.last_viewed_media_type) {
                const details =
                  user.last_viewed_media_type === "movie"
                    ? await moviesAPI.getDetails(user.last_viewed_tmdb_id)
                    : await tvAPI.getDetails(user.last_viewed_tmdb_id);
                setContinueItem({
                  id: details.id,
                  title: details.title || details.name,
                  poster: details.poster_path
                    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                    : "",
                  backdrop: details.backdrop_path
                    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
                    : "",
                  year: details.release_date || details.first_air_date
                    ? new Date(details.release_date || details.first_air_date).getFullYear()
                    : 2024,
                  mediaType: user.last_viewed_media_type,
                });
              }
            } catch (error) {
              console.error("Failed to load continue item:", error);
            }
          }, 650);
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

  const heroContinueItem = isAuthenticated ? continueItem : null;

  return (
    <div className="min-h-screen bg-background">
      {!hasActiveFilters && heroContinueItem && (
        <ContinueHero item={heroContinueItem} isAuthenticated={isAuthenticated} />
      )}
      {!hasActiveFilters && !heroContinueItem && (
        <HeroBanner
          show={featuredShow}
          isAuthenticated={isAuthenticated}
        />
      )}

      <div className="pt-8 pb-24">
        {!isAuthenticated && (
          <div className="px-6 sm:px-8 lg:px-16 mb-10">
            <div className="rounded-2xl border border-border/70 bg-card/70 md:backdrop-blur-md p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Pick a Show and Start Watching
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Sign in to resume episodes and unlock personalized picks.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => (window.location.href = "/login")}
                    className="h-10 px-5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => (window.location.href = "/search")}
                    className="h-10 px-5 rounded-lg text-sm font-medium text-foreground border border-border/70 hover:border-primary/50 transition-colors"
                  >
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {continueItem && (
          <div className="px-6 sm:px-8 lg:px-16 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Resume
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Last viewed
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 bg-card/70 border border-border/70 rounded-xl p-3 md:p-4"
            >
              <div className="w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden bg-background border border-border/70 flex-shrink-0">
                {continueItem.poster ? (
                  <img
                    src={continueItem.poster}
                    alt={continueItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium line-clamp-1">
                  {continueItem.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {continueItem.mediaType === "tv" ? "TV Show" : "Movie"} · {continueItem.year}
                </p>
              </div>
              <motion.button
                onClick={() => {
                  const watchLink =
                    continueItem.mediaType === "movie"
                      ? `/watch/movie/${continueItem.id}`
                      : `/watch/tv/${continueItem.id}/${continueItem.season || 1}/${continueItem.episode || 1}`;
                  window.location.href = watchLink;
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm"
              >
                Resume
              </motion.button>
            </motion.div>
          </div>
        )}

        {!hasActiveFilters && (
          <div className="space-y-16">
            {isAuthenticated && personalizedShows.length > 0 && (
              <ScrollContainer
                title="Up Next For You"
                shows={personalizedShows}
                isLoading={false}
              />
            )}

            <ScrollContainer
              title="Watching Now"
              shows={trendingShows}
              isLoading={isLoading}
            />

            <ScrollContainer
              title="Popular to Stream"
              shows={popularShows}
              isLoading={false}
            />
          </div>
        )}

        <div className="px-6 sm:px-8 lg:px-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {hasActiveFilters ? "Search Results" : "Discover"}
              </h2>
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <div className="relative z-30 rounded-2xl border border-border/70 bg-card/80 md:backdrop-blur-md">
              <FilterBar
                onFilterChange={handleFilterChange}
                mediaType="tv"
                genres={genres}
                providers={providers}
              />
            </div>

            {!isFiltering && filteredShows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    No titles found
                  </h3>
                  <p className="text-base text-muted-foreground">
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


