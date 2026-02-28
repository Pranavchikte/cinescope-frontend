"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authAPI, getAccessToken, moviesAPI, tvAPI } from "@/lib/api";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  X,
  Home,
  Tv,
  Bookmark,
  User,
  ChevronDown,
  LogOut,
  Crown,
  Shield,
  Star,
  Film,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SearchResult {
  id: number;
  title: string;
  poster: string;
  year: number;
  mediaType: "movie" | "tv";
  rating: number;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkAuth = useCallback(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);

    if (token) {
      authAPI
        .getCurrentUser()
        .then((userData) => setUser(userData))
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

  useEffect(() => {
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          ? `https://image.tmdb.org/t/p/w154${m.poster_path}`
          : "",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        mediaType: "movie" as const,
        rating: m.vote_average,
      }));

      const tvShows = tvData.results.slice(0, 4).map((s: any) => ({
        id: s.id,
        title: s.name,
        poster: s.poster_path
          ? `https://image.tmdb.org/t/p/w154${s.poster_path}`
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowResults(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.mediaType}/${result.id}`);
    setSearchQuery("");
    setShowResults(false);
    setIsMobileSearchOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Discover", href: "/search" },
    { label: "TV", href: "/tv" },
    ...(isAuthenticated
      ? [
          { label: "History", href: "/history" },
          { label: "Watchlist", href: "/watchlist" },
        ]
      : []),
  ];

  const mobileItems = [
    { label: "Home", href: "/", icon: Home },
    {
      label: "Search",
      href: "/search",
      icon: Search,
      action: () => setIsMobileSearchOpen(true),
    },
    { label: "TV", href: "/tv", icon: Tv },
    {
      label: isAuthenticated ? "Watchlist" : "Sign In",
      href: isAuthenticated ? "/watchlist" : "/login",
      icon: isAuthenticated ? Bookmark : User,
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-4 left-4 right-4 z-50 mx-auto transition-all duration-300 ${
          isScrolled
            ? "glass-strong shadow-2xl"
            : "glass shadow-xl"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-sm font-semibold text-primary">
                CS
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-semibold text-foreground">CineScope</span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Stream smart
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 pl-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive(link.href)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:block relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setShowResults(true)}
                      placeholder="Search movies, shows, people"
                      className="h-10 w-[280px] rounded-xl border border-border/70 bg-card/70 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                      autoComplete="off"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
                    )}
                  </div>
                </form>

                <AnimatePresence>
                  {showResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-[360px] rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl"
                    >
                      {searchResults.map((result) => (
                        <button
                          key={`${result.mediaType}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-card/80"
                        >
                          <div className="h-12 w-10 overflow-hidden rounded-lg bg-secondary">
                            {result.poster ? (
                              <img
                                src={result.poster}
                                alt={result.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Film className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground line-clamp-1">
                              {result.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.year} • {result.mediaType === "tv" ? "TV" : "Movie"}
                            </div>
                          </div>
                          <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold text-primary">
                            {Math.round(result.rating * 10)}%
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-2 py-1 transition"
                  >
                    <Avatar className="h-8 w-8 border border-border/70">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`hidden lg:block h-4 w-4 text-muted-foreground transition ${
                        showUserMenu ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl"
                      >
                        <div className="px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Signed in as
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="border-t border-border/60" />
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push("/profile");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card/80"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push("/watchlist");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card/80"
                          >
                            <Bookmark className="h-4 w-4" />
                            Watchlist
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push("/ratings");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card/80"
                          >
                            <Star className="h-4 w-4" />
                            Ratings
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push("/creator-picks");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card/80"
                          >
                            <Crown className="h-4 w-4" />
                            Creator Picks
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                router.push("/admin");
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card/80"
                            >
                              <Shield className="h-4 w-4" />
                              Admin Panel
                            </button>
                          )}
                        </div>
                        <div className="border-t border-border/60" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login">
                  <span className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110">
                    Sign In
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="mx-auto max-w-3xl glass-strong rounded-2xl px-4 py-2">
          <div className="grid grid-cols-4 gap-2">
            {mobileItems.map((item) => {
              const Icon = item.icon;
              const active = item.href ? isActive(item.href) : false;
              return (
                <button
                  key={item.label}
                  onClick={() => (item.action ? item.action() : router.push(item.href))}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
                <h2 className="text-lg font-semibold text-foreground">Search</h2>
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-4 py-4">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies, shows, people"
                      autoFocus
                      className="h-12 w-full rounded-2xl border border-border/70 bg-card/70 pl-12 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
                    )}
                  </div>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.mediaType}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card/80 p-3 text-left"
                      >
                        <div className="h-16 w-12 overflow-hidden rounded-lg bg-secondary">
                          {result.poster ? (
                            <img
                              src={result.poster}
                              alt={result.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Film className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {result.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.year} • {result.mediaType === "tv" ? "TV" : "Movie"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          {Math.round(result.rating * 10)}%
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    Start typing to search CineScope
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
