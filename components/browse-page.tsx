"use client";

import { moviesAPI, getAccessToken, authAPI, tvAPI } from "@/lib/api";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Info, Sparkles } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { MovieCardSkeleton } from "@/components/movie-card-skeleton";
import { FilterBar, FilterState } from "@/components/filter-bar";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleDetailsClick = () => {
    if (movie) {
      router.push(`/movie/${movie.id}`);
    }
  };

  if (!movie) {
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
          src={movie.backdrop || "/placeholder.svg"}
          alt={movie.title}
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
              Featured
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight text-balance"
            >
              {movie.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="text-primary font-semibold">
                {Math.round(movie.rating * 10)}%
              </span>
              <span>{movie.year}</span>
              {movie.genres && movie.genres.length > 0 && (
                <span>{movie.genres.slice(0, 2).join(" · ")}</span>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-muted-foreground max-w-xl line-clamp-3"
            >
              {movie.overview}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <button
                onClick={handleDetailsClick}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110"
              >
                <Info className="h-4 w-4" />
                View Details
              </button>
            </motion.div>
          </div>
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
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie) => (
                <div key={movie.id} className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px]">
                  <MovieCard movie={movie} mediaType="movie" />
                </div>
              ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
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
  const [continueItem, setContinueItem] = useState<any | null>(null);
  const [tvGenres, setTvGenres] = useState<{ id: number; name: string }[]>([]);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [tasteMovieGenres, setTasteMovieGenres] = useState<number[]>([]);
  const [tasteTvGenres, setTasteTvGenres] = useState<number[]>([]);
  const [tasteLanguages, setTasteLanguages] = useState<string[]>([]);
  const [isSavingTaste, setIsSavingTaste] = useState(false);
  const [tasteError, setTasteError] = useState<string | null>(null);
  const [tasteHint, setTasteHint] = useState<string | null>(null);
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
              moviesAPI.getProviders("US").catch(() => ({ results: [] })),
            ]);

            setGenres(genresData.genres || []);
            const tvGenresData = await tvAPI.getGenres().catch(() => ({ genres: [] }));
            setTvGenres(tvGenresData.genres || []);

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

          setTimeout(async () => {
            try {
              const user = await authAPI.getCurrentUser();
              if (user?.last_viewed_tmdb_id && user?.last_viewed_media_type) {
                const details =
                  user.last_viewed_media_type === "tv"
                    ? await tvAPI.getDetails(user.last_viewed_tmdb_id)
                    : await moviesAPI.getDetails(user.last_viewed_tmdb_id);
                setContinueItem({
                  id: details.id,
                  title: details.title || details.name,
                  poster: details.poster_path
                    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                    : "",
                  year: details.release_date || details.first_air_date
                    ? new Date(details.release_date || details.first_air_date).getFullYear()
                    : 2024,
                  mediaType: user.last_viewed_media_type,
                });
              }

              if (user?.preferred_movie_genres?.length) {
                setTasteMovieGenres(user.preferred_movie_genres);
              }
              if (user?.preferred_tv_genres?.length) {
                setTasteTvGenres(user.preferred_tv_genres);
              }
              if (user?.preferred_languages?.length) {
                setTasteLanguages(user.preferred_languages);
              }

              if (!user?.taste_onboarded) {
                setShowTasteModal(true);
              }
            } catch (error) {
              console.error("Failed to load continue item:", error);
            }
          }, 650);
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

  const toggleTasteSelection = (
    list: number[],
    setList: Dispatch<SetStateAction<number[]>>,
    id: number,
    limit: number
  ) => {
    setList((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= limit) {
        setTasteHint(`You can pick up to ${limit}.`);
        setTimeout(() => setTasteHint(null), 2000);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleLanguage = (code: string) => {
    setTasteLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveTaste = async () => {
    setIsSavingTaste(true);
    setTasteError(null);
    try {
      await authAPI.updateTasteProfile({
        preferred_movie_genres: tasteMovieGenres,
        preferred_tv_genres: tasteTvGenres,
        preferred_languages: tasteLanguages,
      });
      setShowTasteModal(false);
    } catch (error) {
      console.error("Failed to save taste profile:", error);
      setTasteError("Couldn't save your preferences. Please try again.");
    } finally {
      setIsSavingTaste(false);
    }
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
      <AnimatePresence>
        {showTasteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-2xl bg-card/90 border border-border/70 rounded-2xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Build Your Taste Profile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pick a few genres and languages so recommendations feel personal.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Movies (up to 3)</p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => {
                      const active = tasteMovieGenres.includes(g.id);
                      return (
                        <button
                          key={`movie-${g.id}`}
                          onClick={() =>
                            toggleTasteSelection(
                              tasteMovieGenres,
                              setTasteMovieGenres,
                              g.id,
                              3
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            active
                              ? "bg-primary/15 text-primary border-primary/40"
                              : "bg-card/60 text-foreground border-border/70 hover:border-primary/40"
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">TV (up to 3)</p>
                  <div className="flex flex-wrap gap-2">
                    {tvGenres.map((g) => {
                      const active = tasteTvGenres.includes(g.id);
                      return (
                        <button
                          key={`tv-${g.id}`}
                          onClick={() =>
                            toggleTasteSelection(
                              tasteTvGenres,
                              setTasteTvGenres,
                              g.id,
                              3
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            active
                              ? "bg-primary/15 text-primary border-primary/40"
                              : "bg-card/60 text-foreground border-border/70 hover:border-primary/40"
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: "en", label: "English" },
                      { code: "hi", label: "Hindi" },
                      { code: "ta", label: "Tamil" },
                      { code: "te", label: "Telugu" },
                      { code: "ml", label: "Malayalam" },
                      { code: "mr", label: "Marathi" },
                      { code: "pa", label: "Punjabi" },
                      { code: "ko", label: "Korean" },
                    ].map((lang) => {
                      const active = tasteLanguages.includes(lang.code);
                      return (
                        <button
                          key={lang.code}
                          onClick={() => toggleLanguage(lang.code)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            active
                              ? "bg-primary/15 text-primary border-primary/40"
                              : "bg-card/60 text-foreground border-border/70 hover:border-primary/40"
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={async () => {
                    setTasteError(null);
                    try {
                      await authAPI.updateTasteProfile({
                        preferred_movie_genres: tasteMovieGenres,
                        preferred_tv_genres: tasteTvGenres,
                        preferred_languages: tasteLanguages,
                      });
                      setShowTasteModal(false);
                    } catch {
                      setTasteError("Couldn't save your preferences. Please try again.");
                    }
                  }}
                  className="h-10 px-4 rounded-lg text-sm text-foreground bg-card/60 border border-border/70 hover:border-primary/50 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveTaste}
                  disabled={isSavingTaste}
                  className="h-10 px-5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isSavingTaste ? "Saving..." : "Save Taste Profile"}
                </button>
              </div>
              {(tasteHint || tasteError) && (
                <div className="mt-3 text-xs">
                  {tasteHint && <p className="text-muted-foreground">{tasteHint}</p>}
                  {tasteError && <p className="text-red-400">{tasteError}</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasActiveFilters && <HeroBanner movie={featuredMovie} />}

      <div className="sticky top-0 z-40 bg-background/98 border-b border-border/70 md:backdrop-blur-md">
        <FilterBar
          onFilterChange={handleFilterChange}
          mediaType="movie"
          genres={genres}
          providers={providers}
        />
      </div>

      <div className="pt-8 pb-24">
        {continueItem && (
          <div className="px-6 sm:px-8 lg:px-16 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Continue
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
                onClick={() =>
                  window.location.href = `/${continueItem.mediaType}/${continueItem.id}`
                }
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
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {hasActiveFilters ? "Search Results" : "Explore All"}
              </h2>
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  <p className="text-base text-muted-foreground">
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



