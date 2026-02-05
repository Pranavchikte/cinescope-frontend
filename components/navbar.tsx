"use client";

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
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

// import { AuthModal } from "@/components/auth-modal";

interface SearchResult {
  id: number;
  title: string;
  poster: string;
  year: number;
  mediaType: "movie" | "tv";
  rating: number;
}

export function Navbar() {
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  // const handleAuthSuccess = () => {
  //   setIsAuthModalOpen(false);
  //   checkAuth();
  //   router.refresh();
  // };

  const handleSearch = (e: React.FormEvent) => {
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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled ? "bg-[#141414]" : "bg-transparent"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-12 h-[68px] flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="shrink-0 group flex items-center"
          >
            <span className="text-[#E50914] text-2xl md:text-3xl font-black tracking-tighter">
              CINESCOPE
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5 ml-8">
            <button
              onClick={() => router.push("/")}
              className={`text-sm font-normal transition-colors ${
                isActive("/")
                  ? "text-white font-medium"
                  : "text-[#e5e5e5] hover:text-[#b3b3b3]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => router.push("/tv")}
              className={`text-sm font-normal transition-colors ${
                isActive("/tv")
                  ? "text-white font-medium"
                  : "text-[#e5e5e5] hover:text-[#b3b3b3]"
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => router.push("/movies")}
              className={`text-sm font-normal transition-colors ${
                isActive("/movies")
                  ? "text-white font-medium"
                  : "text-[#e5e5e5] hover:text-[#b3b3b3]"
              }`}
            >
              Movies
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => router.push("/watchlist")}
                  className={`text-sm font-normal transition-colors ${
                    isActive("/watchlist")
                      ? "text-white font-medium"
                      : "text-[#e5e5e5] hover:text-[#b3b3b3]"
                  }`}
                >
                  My List
                </button>
              </>
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
                      width: showResults || searchQuery ? 260 : 34,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <button
                      type="submit"
                      onClick={() => {
                        if (!searchQuery && !showResults) {
                          const input =
                            desktopSearchInputRef.current?.focus();

                        }
                      }}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[34px] h-[34px] flex items-center justify-center transition-colors ${
                        showResults || searchQuery
                          ? "pointer-events-none"
                          : "hover:text-white"
                      }`}
                    >
                      <Search className="w-5 h-5 text-white" />
                    </button>
                    {(showResults || searchQuery) && (
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                        onBlur={(e) => {
                          if (!e.relatedTarget) {
                            setTimeout(() => setShowResults(false), 200);
                          }
                        }}
                        placeholder="Titles, people, genres"
                        className="w-full h-[34px] pl-10 pr-10 bg-[#000000] border border-white text-sm text-white placeholder:text-[#808080] focus:outline-none"
                        autoComplete="off"
                        autoFocus
                      />
                    )}
                    {isSearching && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white animate-spin" />
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
                    className="absolute top-full mt-2 right-0 w-[300px] bg-[#141414]/98 border border-[#333333] shadow-2xl max-h-[500px] overflow-y-auto"
                  >
                    {searchResults.map((result) => (
                      <button
                        key={`${result.mediaType}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-start gap-3 p-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a] last:border-0"
                      >
                        <div className="w-16 h-24 bg-[#2a2a2a] shrink-0 overflow-hidden">
                          {result.poster ? (
                            <img
                              src={result.poster}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-[#808080]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left pt-1">
                          <p className="text-sm font-normal text-white line-clamp-2 leading-tight">
                            {result.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#808080]">
                            <span>{result.year}</span>
                            <span>•</span>
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
              className="md:hidden w-[34px] h-[34px] flex items-center justify-center text-white"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications - Authenticated Only */}
            {isAuthenticated && (
              <button className="hidden md:flex w-[34px] h-[34px] items-center justify-center text-white hover:text-[#b3b3b3] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 group"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${user?.username || "user"}`}
                    />
                    <AvatarFallback className="bg-[#E50914] text-white text-xs font-semibold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={`hidden md:block w-4 h-4 text-white transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-[220px] bg-[#141414]/98 border border-[#333333] shadow-2xl overflow-hidden"
                    >
                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push("/watchlist");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:underline transition-all"
                        >
                          <List className="w-4 h-4" />
                          <span>My List</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push("/ratings");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:underline transition-all"
                        >
                          <Star className="w-4 h-4" />
                          <span>Ratings</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push("/creator-picks");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:underline transition-all"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Creator Picks</span>
                        </button>
                        {user?.role === "admin" && (
                          <>
                            <div className="h-px bg-[#333333] my-1" />
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                router.push("/admin");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:underline transition-all"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin Panel</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Account Section */}
                      <div className="border-t border-[#333333] py-1">
                        <div className="px-4 py-3">
                          <p className="text-xs text-[#808080] text-center">
                            {user?.email}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-sm text-white hover:underline text-center transition-all"
                        >
                          Sign out of CineScope
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <button className="h-8 px-4 bg-[#E50914] text-white text-sm font-medium hover:bg-[#C11119] transition-colors">
                  Sign In
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
            className="fixed inset-0 z-50 bg-[#141414]"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-medium text-white">Search</h2>
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-10 h-10 flex items-center justify-center text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808080]" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Titles, people, genres"
                      autoFocus
                      className="w-full h-12 pl-12 pr-12 bg-[#2a2a2a] text-base text-white placeholder:text-[#808080] focus:outline-none focus:bg-[#333333]"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white animate-spin" />
                    )}
                  </div>
                </form>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((result) => (
                      <button
                        key={`${result.mediaType}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-start gap-4 p-4 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
                      >
                        <div className="w-16 h-24 bg-[#2a2a2a] shrink-0 overflow-hidden">
                          {result.poster ? (
                            <img
                              src={result.poster}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-[#808080]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left pt-1">
                          <p className="text-base font-normal text-white line-clamp-2">
                            {result.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-sm text-[#808080]">
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
                    <p className="text-base text-[#808080]">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      

      {/* Custom Scrollbar */}
      <style jsx global>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #141414;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #404040;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #606060;
        }
      `}</style>
    </>
  );
}
