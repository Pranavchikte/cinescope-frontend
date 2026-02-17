"use client";

import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authAPI, getAccessToken, moviesAPI, tvAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Film,
  Loader2,
  Crown,
  Shield,
  Star,
  List,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface SearchResult {
  id: number;
  title: string;
  poster: string;
  year: number;
  mediaType: "movie" | "tv";
  rating: number;
}

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Ripple state
  const [ripples, setRipples] = useState<{
    [key: string]: { x: number; y: number; id: number }[];
  }>({});

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

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth state
  const checkAuth = useCallback(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);

    if (token) {
      authAPI
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);

    try {
      const [moviesData, tvData] = await Promise.all([
        moviesAPI.search(query),
        tvAPI.search(query),
      ]);

      const movies = moviesData.results.slice(0, 4).map((m: any) => ({
        id: m.id,
        title: m.title,
        poster: m.poster_path
          ? `https://image.tmdb.org/t/p/w92${m.poster_path}`
          : "",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        mediaType: "movie" as const,
        rating: m.vote_average,
      }));

      const tvShows = tvData.results.slice(0, 4).map((s: any) => ({
        id: s.id,
        title: s.name,
        poster: s.poster_path
          ? `https://image.tmdb.org/t/p/w92${s.poster_path}`
          : "",
        year: s.first_air_date
          ? new Date(s.first_air_date).getFullYear()
          : 2024,
        mediaType: "tv" as const,
        rating: s.vote_average,
      }));

      const combined = [...movies, ...tvShows]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      setSearchResults(combined);
      setShowResults(true);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Search failed:", error);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsSearchExpanded(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowResults(false);
      setIsMobileSearchOpen(false);
      setIsSearchExpanded(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.mediaType}/${result.id}`);
    setSearchQuery("");
    setShowResults(false);
    setIsMobileSearchOpen(false);
    setIsSearchExpanded(false);
  };

  const handleSearchIconClick = () => {
    if (!isSearchExpanded && !searchQuery) {
      setIsSearchExpanded(true);
      setTimeout(() => {
        desktopSearchInputRef.current?.focus();
      }, 100);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav
        className={`fixed top-4 left-4 right-4 z-50 rounded-xl mx-auto md:left-6 md:right-6 lg:left-8 lg:right-8 ${
          isScrolled
            ? `bg-[#1A1A1A]/90 ${!isMobile ? "backdrop-blur-xl" : ""} border border-[#2A2A2A] shadow-2xl`
            : `bg-[#1A1A1A]/80 border border-[#2A2A2A] shadow-xl`
        } ${!isMobile ? "transition-all duration-500" : ""}`}
      >
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={(e) => {
              handleRipple(e, "logo");
              router.push("/");
            }}
            className="shrink-0 group flex items-center relative overflow-hidden rounded-lg px-2 py-1 transition-transform duration-200 active:scale-95"
          >
            {!isMobile &&
              ripples["logo"]?.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                  style={{ left: ripple.x, top: ripple.y }}
                  initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                  animate={{ width: 100, height: 100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            <span className="text-[#14B8A6] text-2xl md:text-3xl font-semibold tracking-tight relative z-10">
              CINESCOPE
            </span>
          </button>

          {/* Mobile TV Shows Button */}
          <button
            onClick={() => router.push("/tv")}
            className={`lg:hidden px-3 py-1.5 text-sm font-medium rounded-lg ${
              isActive("/tv")
                ? "text-[#14B8A6] bg-[#14B8A6]/10"
                : "text-[#A0A0A0]"
            }`}
          >
            TV Shows
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 ml-8">
            <button
              onClick={(e) => {
                handleRipple(e, "nav-home");
                router.push("/");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95 ${
                isActive("/")
                  ? "text-[#14B8A6] bg-[#14B8A6]/10"
                  : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
              }`}
            >
              {!isMobile &&
                ripples["nav-home"]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              <span className="relative z-10">Home</span>
            </button>

            <button
              onClick={(e) => {
                handleRipple(e, "nav-tv");
                router.push("/tv");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95 ${
                isActive("/tv")
                  ? "text-[#14B8A6] bg-[#14B8A6]/10"
                  : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
              }`}
            >
              {!isMobile &&
                ripples["nav-tv"]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              <span className="relative z-10">TV Shows</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={(e) => {
                  handleRipple(e, "nav-watchlist");
                  router.push("/watchlist");
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95 ${
                  isActive("/watchlist")
                    ? "text-[#14B8A6] bg-[#14B8A6]/10"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
                }`}
              >
                {!isMobile &&
                  ripples["nav-watchlist"]?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                      animate={{ width: 100, height: 100, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                <span className="relative z-10">My List</span>
              </button>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            {/* Desktop Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isSearchExpanded || searchQuery ? 260 : 34,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <button
                      type={
                        isSearchExpanded || searchQuery ? "submit" : "button"
                      }
                      onClick={handleSearchIconClick}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[34px] h-[34px] flex items-center justify-center hover:text-[#14B8A6] transition-colors duration-200 z-10"
                    >
                      <Search className="w-5 h-5 text-[#A0A0A0]" />
                    </button>
                    {(isSearchExpanded || searchQuery) && (
                      <input
                        ref={desktopSearchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                        placeholder="Titles, people, genres"
                        className="w-full h-[34px] pl-10 pr-3 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#14B8A6]/50 rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#A0A0A0] focus:outline-none transition-all duration-200"
                        autoComplete="off"
                      />
                    )}
                    {isSearching && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14B8A6] animate-spin" />
                    )}
                  </motion.div>
                </div>
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full mt-2 right-0 w-[300px] bg-[#1A1A1A]/90 ${!isMobile ? "md:backdrop-blur-xl" : ""} border border-[#2A2A2A] shadow-2xl rounded-lg max-h-[500px] overflow-y-auto`}
                  >
                    {searchResults.map((result) => (
                      <button
                        key={`${result.mediaType}-${result.id}`}
                        onClick={(e) => {
                          handleRipple(
                            e,
                            `search-result-${result.mediaType}-${result.id}`,
                          );
                          handleResultClick(result);
                        }}
                        className="w-full flex items-start gap-3 p-3 hover:bg-[#14B8A6]/10 transition-all duration-200 border-b border-[#2A2A2A] last:border-0 relative overflow-hidden group"
                      >
                        {!isMobile &&
                          ripples[
                            `search-result-${result.mediaType}-${result.id}`
                          ]?.map((ripple) => (
                            <motion.span
                              key={ripple.id}
                              className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                              style={{ left: ripple.x, top: ripple.y }}
                              initial={{
                                width: 0,
                                height: 0,
                                x: "-50%",
                                y: "-50%",
                              }}
                              animate={{ width: 150, height: 150, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                            />
                          ))}
                        <div className="w-16 h-24 bg-[#2A2A2A] shrink-0 overflow-hidden rounded-lg">
                          {result.poster ? (
                            <img
                              src={result.poster || "/placeholder.svg"}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-[#808080]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left pt-1 relative z-10">
                          <p className="text-sm font-medium text-[#F5F5F5] line-clamp-2 leading-tight">
                            {result.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#A0A0A0]">
                            <span>{result.year}</span>
                            <span className="text-[#2A2A2A]">•</span>
                            <span className="capitalize">
                              {result.mediaType === "tv" ? "Series" : "Movie"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden w-[34px] h-[34px] flex items-center justify-center text-[#A0A0A0] hover:text-[#14B8A6] transition-colors duration-200 transition-transform duration-200 active:scale-90"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div
                className="relative flex items-center gap-2"
                ref={userMenuRef}
              >
                {/* Desktop Menu Strip */}
                <div className="hidden lg:flex items-center gap-1 px-2">
                  <button
                    onClick={(e) => {
                      handleRipple(e, "menu-profile");
                      router.push("/profile");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                    title="Profile Settings"
                  >
                    {!isMobile &&
                      ripples["menu-profile"]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <User className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Profile</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleRipple(e, "menu-list");
                      router.push("/watchlist");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                    title="My List"
                  >
                    {!isMobile &&
                      ripples["menu-list"]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <List className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">My List</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleRipple(e, "menu-ratings");
                      router.push("/ratings");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                    title="Ratings"
                  >
                    {!isMobile &&
                      ripples["menu-ratings"]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <Star className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Ratings</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleRipple(e, "menu-creator");
                      router.push("/creator-picks");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                    title="Creator Picks"
                  >
                    {!isMobile &&
                      ripples["menu-creator"]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <Crown className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Creator Picks</span>
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={(e) => {
                        handleRipple(e, "menu-admin");
                        router.push("/admin");
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                      title="Admin Panel"
                    >
                      {!isMobile &&
                        ripples["menu-admin"]?.map((ripple) => (
                          <motion.span
                            key={ripple.id}
                            className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                            initial={{
                              width: 0,
                              height: 0,
                              x: "-50%",
                              y: "-50%",
                            }}
                            animate={{ width: 100, height: 100, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                        ))}
                      <Shield className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Admin</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      handleRipple(e, "menu-logout");
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 relative overflow-hidden transition-transform duration-200 active:scale-95"
                    title="Logout"
                  >
                    {!isMobile &&
                      ripples["menu-logout"]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-red-400/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 100, height: 100, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <LogOut className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>

                {/* Avatar Button */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 group transition-transform duration-200 active:scale-95"
                >
                  <Avatar className="w-8 h-8 border border-[#2A2A2A] hover:border-[#14B8A6]/50 transition-all duration-200 bg-[#14B8A6]">
                    <AvatarFallback className="bg-[#14B8A6] text-[#0F0F0F] text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={`hidden lg:block w-4 h-4 text-[#A0A0A0] transition-all duration-200 ${
                      showUserMenu ? "rotate-180 text-[#14B8A6]" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu - Mobile */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}
className="absolute top-full right-0 mt-2 w-[200px] bg-[#1A1A1A]/90 border border-[#2A2A2A] shadow-2xl overflow-hidden rounded-lg lg:hidden"
>
<div className="py-1">
<button
onClick={(e) => {
handleRipple(e, "dropdown-profile");
setShowUserMenu(false);
router.push("/profile");
}}
className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 relative overflow-hidden"
>
{!isMobile &&
ripples["dropdown-profile"]?.map((ripple) => (
<motion.span
key={ripple.id}
className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
style={{ left: ripple.x, top: ripple.y }}
initial={{
width: 0,
height: 0,
x: "-50%",
y: "-50%",
}}
animate={{
width: 150,
height: 150,
opacity: 0,
}}
transition={{ duration: 0.6 }}
/>
))}
<User className="w-4 h-4 relative z-10" />
<span className="relative z-10">
Profile Settings
</span>
</button>
<button
onClick={(e) => {
handleRipple(e, "dropdown-watchlist");
setShowUserMenu(false);
router.push("/watchlist");
}}
className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 relative overflow-hidden"
>
{!isMobile &&
ripples["dropdown-watchlist"]?.map((ripple) => (
<motion.span
key={ripple.id}
className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
style={{ left: ripple.x, top: ripple.y }}
initial={{
width: 0,
height: 0,
x: "-50%",
y: "-50%",
}}
animate={{
width: 150,
height: 150,
opacity: 0,
}}
transition={{ duration: 0.6 }}
/>
))}
<List className="w-4 h-4 relative z-10" />
<span className="relative z-10">My List</span>
</button>
<button
                      onClick={(e) => {
                        handleRipple(e, "dropdown-ratings");
                        setShowUserMenu(false);
                        router.push("/ratings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 relative overflow-hidden"
                    >
                      {!isMobile &&
                        ripples["dropdown-ratings"]?.map((ripple) => (
                          <motion.span
                            key={ripple.id}
                            className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                            initial={{
                              width: 0,
                              height: 0,
                              x: "-50%",
                              y: "-50%",
                            }}
                            animate={{
                              width: 150,
                              height: 150,
                              opacity: 0,
                            }}
                            transition={{ duration: 0.6 }}
                          />
                        ))}
                      <Star className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Ratings</span>
                    </button>

                    <button
                      onClick={(e) => {
                        handleRipple(e, "dropdown-creator");
                        setShowUserMenu(false);
                        router.push("/creator-picks");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 relative overflow-hidden"
                    >
                      {!isMobile &&
                        ripples["dropdown-creator"]?.map((ripple) => (
                          <motion.span
                            key={ripple.id}
                            className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                            initial={{
                              width: 0,
                              height: 0,
                              x: "-50%",
                              y: "-50%",
                            }}
                            animate={{
                              width: 150,
                              height: 150,
                              opacity: 0,
                            }}
                            transition={{ duration: 0.6 }}
                          />
                        ))}
                      <Crown className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Creator Picks</span>
                    </button>

                    {user?.role === "admin" && (
                      <>
                        <div className="h-px bg-[#2A2A2A] my-1" />
                        <button
                          onClick={(e) => {
                            handleRipple(e, "dropdown-admin");
                            setShowUserMenu(false);
                            router.push("/admin");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] transition-all duration-200 relative overflow-hidden"
                        >
                          {!isMobile &&
                            ripples["dropdown-admin"]?.map((ripple) => (
                              <motion.span
                                key={ripple.id}
                                className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                                style={{ left: ripple.x, top: ripple.y }}
                                initial={{
                                  width: 0,
                                  height: 0,
                                  x: "-50%",
                                  y: "-50%",
                                }}
                                animate={{
                                  width: 150,
                                  height: 150,
                                  opacity: 0,
                                }}
                                transition={{ duration: 0.6 }}
                              />
                            ))}
                          <Shield className="w-4 h-4 relative z-10" />
                          <span className="relative z-10">Admin Panel</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#2A2A2A] py-1">
                    <div className="px-4 py-3">
                      <p className="text-xs text-[#A0A0A0] text-center truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        handleRipple(e, "dropdown-logout");
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-[#F5F5F5] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 relative overflow-hidden"
                    >
                      {!isMobile &&
                        ripples["dropdown-logout"]?.map((ripple) => (
                          <motion.span
                            key={ripple.id}
                            className="absolute bg-red-400/30 rounded-full pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                            initial={{
                              width: 0,
                              height: 0,
                              x: "-50%",
                              y: "-50%",
                            }}
                            animate={{
                              width: 150,
                              height: 150,
                              opacity: 0,
                            }}
                            transition={{ duration: 0.6 }}
                          />
                        ))}
                      <LogOut className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/login">
            <button
              onClick={(e) => handleRipple(e, "signin")}
              className="h-8 px-5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] text-sm font-semibold rounded-lg transition-all duration-200 relative overflow-hidden group transition-transform duration-200 active:scale-95"
            >
              {!isMobile &&
                ripples["signin"]?.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y }}
                    initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                style={{
                  background:
                    "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                }}
              />
              <span className="relative z-10">Sign In</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  </nav>

  {/* Mobile Search Overlay */}
  <AnimatePresence>
    {isMobileSearchOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0F0F0F]"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Search</h2>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="w-10 h-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#14B8A6] transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  autoFocus
                  className="w-full h-12 pl-12 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#14B8A6]/50 text-base text-[#F5F5F5] placeholder:text-[#A0A0A0] focus:outline-none transition-all duration-200 rounded-lg"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14B8A6] animate-spin" />
                )}
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div>
                {searchResults.map((result) => (
                  <button
                    key={`${result.mediaType}-${result.id}`}
                    onClick={(e) => {
                      handleRipple(
                        e,
                        `mobile-result-${result.mediaType}-${result.id}`,
                      );
                      handleResultClick(result);
                    }}
                    className="w-full flex items-start gap-4 p-4 hover:bg-[#14B8A6]/5 transition-all duration-200 border-b border-[#2A2A2A] relative overflow-hidden"
                  >
                    {!isMobile &&
                      ripples[
                        `mobile-result-${result.mediaType}-${result.id}`
                      ]?.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          className="absolute bg-[#14B8A6]/30 rounded-full pointer-events-none"
                          style={{ left: ripple.x, top: ripple.y }}
                          initial={{
                            width: 0,
                            height: 0,
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{ width: 200, height: 200, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    <div className="w-16 h-24 bg-[#2A2A2A] shrink-0 overflow-hidden rounded-lg">
                      {result.poster ? (
                        <img
                          src={result.poster || "/placeholder.svg"}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-[#808080]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left pt-1 relative z-10">
                      <p className="text-base font-medium text-[#F5F5F5] line-clamp-2">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-[#A0A0A0]">
                        <span>{result.year}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {result.mediaType === "tv" ? "Series" : "Movie"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-20">
                <p className="text-base text-[#A0A0A0]">
                  No results found for "{searchQuery}"
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  <style jsx global>{`
    .overflow-y-auto::-webkit-scrollbar {
      width: 10px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #0f0f0f;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #2a2a2a;
      border-radius: 5px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #14b8a6;
    }
  `}</style>
</>
);
}