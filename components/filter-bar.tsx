"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  mediaType: "movie" | "tv";
  genres: { id: number; name: string }[];
  providers: { provider_id: number; provider_name: string; logo_path: string }[];
}

export interface FilterState {
  genre: string;
  year: number | null;
  language: string;
  country: string;
  provider: string;
  sort_by: string;
  vote_count_min: number;
  vote_average_min: number | null;
  vote_average_max: number | null;
  runtime_min: number | null;
  runtime_max: number | null;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "title.asc", label: "Title (A-Z)" },
];

export function FilterBar({ onFilterChange, mediaType, genres, providers }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
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

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setActivePreset(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setActivePreset(null);
    setFilters({
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
  };

  const closeAllDropdowns = () => setActiveDropdown(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const hasActiveFilters =
    filters.genre ||
    filters.year ||
    filters.language ||
    filters.country ||
    filters.provider ||
    filters.sort_by !== "popularity.desc" ||
    filters.vote_count_min !== 100 ||
    filters.vote_average_min !== null ||
    filters.vote_average_max !== null ||
    filters.runtime_min !== null ||
    filters.runtime_max !== null;

  const getGenreName = () => {
    if (!filters.genre) return "Genres";
    const genre = genres.find((g) => g.id.toString() === filters.genre);
    return genre?.name || "Genres";
  };

  const getProviderName = () => {
    if (!filters.provider) return "Platforms";
    const provider = providers.find((p) => p.provider_id.toString() === filters.provider);
    return provider?.provider_name || "Platforms";
  };

  const allowedProviders = [
    { key: "netflix", label: "Netflix", match: ["netflix"] },
    { key: "prime", label: "Amazon Prime Video", match: ["amazon prime video", "prime video", "amazon prime"] },
    { key: "apple", label: "Apple TV", match: ["apple tv"] },
  ];

  const filteredProviders = (() => {
    const seen = new Set<string>();
    const result: { provider_id: number; provider_name: string; logo_path: string }[] = [];

    for (const p of providers) {
      const name = p.provider_name.toLowerCase();
      const match = allowedProviders.find((ap) => ap.match.some((m) => name.includes(m)));
      if (!match) continue;
      if (seen.has(match.key)) continue;
      seen.add(match.key);
      result.push(p);
    }

    return result;
  })();

  const getSortName = () => {
    const sort = SORT_OPTIONS.find((s) => s.value === filters.sort_by);
    return sort?.label || "Sort";
  };

  const resolveGenreId = (candidates: string[]) => {
    for (const name of candidates) {
      const match = genres.find((g) => g.name.toLowerCase() === name.toLowerCase());
      if (match) return match.id.toString();
    }
    return "";
  };

  const applyPreset = (presetId: string, patch: Partial<FilterState>) => {
    setActivePreset(presetId);
    setFilters((prev) => ({
      ...prev,
      ...patch,
      year: null,
      language: "",
      country: "",
      provider: "",
      sort_by: patch.sort_by ?? "popularity.desc",
      vote_count_min: patch.vote_count_min ?? 200,
      vote_average_min: patch.vote_average_min ?? null,
      vote_average_max: patch.vote_average_max ?? null,
      runtime_min: patch.runtime_min ?? null,
      runtime_max: patch.runtime_max ?? null,
    }));
  };

  const moodPresets = [
    {
      id: "feel-good",
      label: "Feel Good",
      genreCandidates: mediaType === "tv" ? ["Comedy", "Family"] : ["Comedy", "Family"],
      vote_average_min: 6.5,
    },
    {
      id: "thriller-night",
      label: "Thriller Night",
      genreCandidates: ["Thriller", "Mystery", "Crime"],
      vote_average_min: 6.5,
    },
    {
      id: "action-rush",
      label: "Action Rush",
      genreCandidates: ["Action", "Adventure"],
      vote_average_min: 6.0,
    },
    {
      id: "romance",
      label: "Romance",
      genreCandidates: ["Romance"],
      vote_average_min: 6.0,
    },
    {
      id: "mind-bending",
      label: "Mind-Bending",
      genreCandidates: mediaType === "tv" ? ["Sci-Fi & Fantasy", "Mystery"] : ["Science Fiction", "Mystery"],
      vote_average_min: 6.5,
    },
  ];

  const timePresets = mediaType === "movie" ? [
    {
      id: "quick-30",
      label: "Quick 30",
      runtime_min: 20,
      runtime_max: 45,
      vote_average_min: 6.0,
    },
    {
      id: "movie-night",
      label: "Movie Night",
      runtime_min: 80,
      runtime_max: 120,
      vote_average_min: 6.5,
    },
    {
      id: "epic-2h",
      label: "Epic 2h+",
      runtime_min: 140,
      runtime_max: null,
      vote_average_min: 7.0,
    },
  ] : [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="relative">
          <button
            onClick={() => toggleDropdown("genre")}
            className={`h-10 px-4 text-sm font-medium flex items-center gap-2 border rounded-full whitespace-nowrap transition ${
              filters.genre
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-card/70 text-foreground border-border/70 hover:border-primary/40"
            }`}
          >
            {getGenreName()}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${activeDropdown === "genre" ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === "genre" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", damping: 25, stiffness: 260 }}
                  className="absolute top-full mt-2 left-0 z-50 w-56 max-h-72 overflow-y-auto rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      updateFilter("genre", "");
                      closeAllDropdowns();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card/80"
                  >
                    All Genres
                  </button>
                  <div className="h-px bg-border/60" />
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        updateFilter("genre", genre.id.toString());
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition ${
                        filters.genre === genre.id.toString()
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => toggleDropdown("provider")}
            className={`h-10 px-4 text-sm font-medium flex items-center gap-2 border rounded-full whitespace-nowrap transition ${
              filters.provider
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-card/70 text-foreground border-border/70 hover:border-primary/40"
            }`}
          >
            {getProviderName()}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${activeDropdown === "provider" ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === "provider" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", damping: 25, stiffness: 260 }}
                  className="absolute top-full mt-2 left-0 z-50 w-64 max-h-72 overflow-y-auto rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      updateFilter("provider", "");
                      closeAllDropdowns();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card/80"
                  >
                    All Platforms
                  </button>
                  <div className="h-px bg-border/60" />
                  {filteredProviders.map((provider) => (
                    <button
                      key={provider.provider_id}
                      onClick={() => {
                        updateFilter("provider", provider.provider_id.toString());
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition ${
                        filters.provider === provider.provider_id.toString()
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
                      }`}
                    >
                      {provider.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt=""
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      <span className="truncate">{provider.provider_name}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => toggleDropdown("sort")}
            className="h-10 px-4 text-sm font-medium flex items-center gap-2 border rounded-full whitespace-nowrap transition bg-card/70 text-foreground border-border/70 hover:border-primary/40"
          >
            {getSortName()}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${activeDropdown === "sort" ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === "sort" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", damping: 25, stiffness: 260 }}
                  className="absolute top-full mt-2 right-0 z-50 w-48 rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter("sort_by", option.value);
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition ${
                        filters.sort_by === option.value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={resetFilters}
              className="h-10 px-4 text-sm font-medium rounded-full border border-border/70 bg-card/70 text-muted-foreground hover:text-foreground transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-2">Quick Picks</span>
        {moodPresets.map((preset) => {
          const genreId = resolveGenreId(preset.genreCandidates);
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() =>
                applyPreset(preset.id, {
                  genre: genreId,
                  vote_average_min: preset.vote_average_min,
                  runtime_min: null,
                  runtime_max: null,
                })
              }
              className={`h-8 px-3 rounded-full text-xs font-medium border transition ${
                isActive
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-card/60 text-foreground border-border/70 hover:border-primary/40"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
        {timePresets.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() =>
                applyPreset(preset.id, {
                  genre: "",
                  vote_average_min: preset.vote_average_min,
                  runtime_min: preset.runtime_min,
                  runtime_max: preset.runtime_max,
                })
              }
              className={`h-8 px-3 rounded-full text-xs font-medium border transition ${
                isActive
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-card/60 text-foreground border-border/70 hover:border-primary/40"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
