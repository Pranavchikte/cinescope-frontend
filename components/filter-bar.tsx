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

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
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

  const hasActiveFilters = filters.genre || filters.provider || filters.sort_by !== "popularity.desc";

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

  const getSortName = () => {
    const sort = SORT_OPTIONS.find((s) => s.value === filters.sort_by);
    return sort?.label || "Sort";
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-4">
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* Genre Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("genre")}
            className={`h-9 px-4 text-sm font-normal transition-all flex items-center gap-2 border whitespace-nowrap ${
              filters.genre
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-[#808080]/50 hover:border-white"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1 left-0 bg-[#181818]/98 backdrop-blur-md border border-[#333333] shadow-2xl z-50 min-w-[180px] max-w-[240px] max-h-[400px] overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      updateFilter("genre", "");
                      closeAllDropdowns();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    All Genres
                  </button>
                  <div className="h-px bg-[#333333]" />
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        updateFilter("genre", genre.id.toString());
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        filters.genre === genre.id.toString()
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
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

        {/* Platform Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("provider")}
            className={`h-9 px-4 text-sm font-normal transition-all flex items-center gap-2 border whitespace-nowrap ${
              filters.provider
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-[#808080]/50 hover:border-white"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1 left-0 bg-[#181818]/98 backdrop-blur-md border border-[#333333] shadow-2xl z-50 min-w-[200px] max-w-[280px] max-h-[400px] overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      updateFilter("provider", "");
                      closeAllDropdowns();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    All Platforms
                  </button>
                  <div className="h-px bg-[#333333]" />
                  {providers.map((provider) => (
                    <button
                      key={provider.provider_id}
                      onClick={() => {
                        updateFilter("provider", provider.provider_id.toString());
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3 ${
                        filters.provider === provider.provider_id.toString()
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
                      }`}
                    >
                      {provider.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt=""
                          className="w-6 h-6 rounded object-cover flex-shrink-0"
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

        {/* Sort Dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => toggleDropdown("sort")}
            className="h-9 px-4 text-sm font-normal transition-all flex items-center gap-2 border bg-transparent text-white border-[#808080]/50 hover:border-white whitespace-nowrap"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1 right-0 bg-[#181818]/98 backdrop-blur-md border border-[#333333] shadow-2xl z-50 min-w-[160px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter("sort_by", option.value);
                        closeAllDropdowns();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        filters.sort_by === option.value
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
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

        {/* Reset Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={resetFilters}
            className="h-9 px-4 text-sm font-normal bg-transparent text-[#808080] hover:text-white border border-[#808080]/50 hover:border-white transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Custom Scrollbar Styles for Dropdowns */}
      <style jsx global>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #606060;
        }
      `}</style>
    </div>
  );
}