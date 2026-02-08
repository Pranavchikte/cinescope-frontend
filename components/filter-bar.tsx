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
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})

  // Ripple effect handler
  const handleRipple = (e: React.MouseEvent, key: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()

    setRipples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { x, y, id: rippleId }],
    }))

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((r) => r.id !== rippleId),
      }))
    }, 600)
  }

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
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'genre-btn')
              toggleDropdown("genre")
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`h-9 px-4 text-sm font-medium transition-all flex items-center gap-2 border rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group ${
              filters.genre
                ? "bg-[#14B8A6] text-[#0F0F0F] border-[#14B8A6]"
                : "bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50"
            }`}
          >
            {/* Ripple effect */}
            {ripples['genre-btn']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            
            {/* Gradient glow */}
            {!filters.genre && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
            {filters.genre && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)' }} />
              </>
            )}
            
            <span className="relative z-10">{getGenreName()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform relative z-10 ${activeDropdown === "genre" ? "rotate-180" : ""}`}
            />
          </motion.button>

          <AnimatePresence>
            {activeDropdown === "genre" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute top-full mt-2 left-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] shadow-2xl rounded-lg z-50 min-w-[180px] max-w-[240px] max-h-[400px] overflow-y-auto"
                >
                  <motion.button
                    onClick={(e) => {
                      handleRipple(e, 'genre-all')
                      updateFilter("genre", "")
                      closeAllDropdowns()
                    }}
                    whileHover={{ x: 4 }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#F5F5F5] hover:bg-[#2A2A2A] transition-all relative overflow-hidden group"
                  >
                    {/* Ripple effect */}
                    {ripples['genre-all']?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <span className="relative z-10">All Genres</span>
                  </motion.button>
                  <div className="h-px bg-[#2A2A2A]" />
                  {genres.map((genre) => (
                    <motion.button
                      key={genre.id}
                      onClick={(e) => {
                        handleRipple(e, `genre-${genre.id}`)
                        updateFilter("genre", genre.id.toString())
                        closeAllDropdowns()
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all relative overflow-hidden group ${
                        filters.genre === genre.id.toString()
                          ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                          : "text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]"
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples[`genre-${genre.id}`]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative z-10">{genre.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Platform Dropdown */}
        <div className="relative">
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'provider-btn')
              toggleDropdown("provider")
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`h-9 px-4 text-sm font-medium transition-all flex items-center gap-2 border rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group ${
              filters.provider
                ? "bg-[#14B8A6] text-[#0F0F0F] border-[#14B8A6]"
                : "bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50"
            }`}
          >
            {/* Ripple effect */}
            {ripples['provider-btn']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            
            {/* Gradient glow */}
            {!filters.provider && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
            {filters.provider && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)' }} />
              </>
            )}
            
            <span className="relative z-10">{getProviderName()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform relative z-10 ${activeDropdown === "provider" ? "rotate-180" : ""}`}
            />
          </motion.button>

          <AnimatePresence>
            {activeDropdown === "provider" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute top-full mt-2 left-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] shadow-2xl rounded-lg z-50 min-w-[200px] max-w-[280px] max-h-[400px] overflow-y-auto"
                >
                  <motion.button
                    onClick={(e) => {
                      handleRipple(e, 'provider-all')
                      updateFilter("provider", "")
                      closeAllDropdowns()
                    }}
                    whileHover={{ x: 4 }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#F5F5F5] hover:bg-[#2A2A2A] transition-all relative overflow-hidden group"
                  >
                    {/* Ripple effect */}
                    {ripples['provider-all']?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <span className="relative z-10">All Platforms</span>
                  </motion.button>
                  <div className="h-px bg-[#2A2A2A]" />
                  {providers.map((provider) => (
                    <motion.button
                      key={provider.provider_id}
                      onClick={(e) => {
                        handleRipple(e, `provider-${provider.provider_id}`)
                        updateFilter("provider", provider.provider_id.toString())
                        closeAllDropdowns()
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center gap-3 relative overflow-hidden group ${
                        filters.provider === provider.provider_id.toString()
                          ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                          : "text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]"
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples[`provider-${provider.provider_id}`]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {provider.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt=""
                          className="w-6 h-6 rounded object-cover flex-shrink-0 relative z-10"
                        />
                      )}
                      <span className="truncate relative z-10">{provider.provider_name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Dropdown */}
        <div className="relative ml-auto">
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'sort-btn')
              toggleDropdown("sort")
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-9 px-4 text-sm font-medium transition-all flex items-center gap-2 border bg-[#1A1A1A]/50 text-[#F5F5F5] border-[#2A2A2A] hover:border-[#14B8A6]/50 rounded-lg whitespace-nowrap backdrop-blur-xl relative overflow-hidden group"
          >
            {/* Ripple effect */}
            {ripples['sort-btn']?.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                animate={{ width: 100, height: 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <span className="relative z-10">{getSortName()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform relative z-10 ${activeDropdown === "sort" ? "rotate-180" : ""}`}
            />
          </motion.button>

          <AnimatePresence>
            {activeDropdown === "sort" && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute top-full mt-2 right-0 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] shadow-2xl rounded-lg z-50 min-w-[160px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={(e) => {
                        handleRipple(e, `sort-${option.value}`)
                        updateFilter("sort_by", option.value)
                        closeAllDropdowns()
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all relative overflow-hidden group ${
                        filters.sort_by === option.value
                          ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                          : "text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]"
                      }`}
                    >
                      {/* Ripple effect */}
                      {ripples[`sort-${option.value}`]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative z-10">{option.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => {
                handleRipple(e, 'reset-btn')
                resetFilters()
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 px-4 text-sm font-medium bg-[#1A1A1A]/50 text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-all flex items-center gap-2 rounded-lg backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Ripple effect */}
              {ripples['reset-btn']?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <X className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Clear</span>
            </motion.button>
          )}
        </AnimatePresence>
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
          background: #14B8A6;
        }
      `}</style>
    </div>
  );
}