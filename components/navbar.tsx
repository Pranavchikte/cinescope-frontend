"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authAPI, getAccessToken, moviesAPI, tvAPI } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Menu, X, Film, ChevronDown, Loader2, Crown, Shield, User, Star, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface SearchResult {
  id: number
  title: string
  poster: string
  year: number
  mediaType: "movie" | "tv"
  rating: number
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Scroll detection for compact header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    setIsAuthenticated(!!token)

    if (token) {
      authAPI.getCurrentUser()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          setIsAuthenticated(false)
          setUser(null)
        })
    }
  }, [])

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      setIsSearching(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsSearching(true)

    try {
      const [moviesData, tvData] = await Promise.all([
        moviesAPI.search(query),
        tvAPI.search(query),
      ])

      const movies = moviesData.results.slice(0, 3).map((m: any) => ({
        id: m.id,
        title: m.title,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        mediaType: "movie" as const,
        rating: m.vote_average,
      }))

      const tvShows = tvData.results.slice(0, 3).map((s: any) => ({
        id: s.id,
        title: s.name,
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "",
        year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        mediaType: "tv" as const,
        rating: s.vote_average,
      }))

      const combined = [...movies, ...tvShows].sort((a, b) => b.rating - a.rating).slice(0, 5)
      setSearchResults(combined)
      setShowResults(true)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Search failed:", error)
      }
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    setIsAuthenticated(false)
    setUser(null)
    setIsMenuOpen(false)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setShowResults(false)
      setIsMobileSearchOpen(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.mediaType}/${result.id}`)
    setSearchQuery("")
    setShowResults(false)
    setIsMobileSearchOpen(false)
  }

  const navHeight = isScrolled ? "h-16" : "h-20"

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navHeight}`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="h-full bg-black/50 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
            
            {/* Logo */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 shrink-0 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Film className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400 relative" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-white/90">
                CineScope
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="h-9 px-4 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                Movies
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/tv")}
                className="h-9 px-4 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                TV Shows
              </Button>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4" ref={searchRef}>
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 transition-colors group-focus-within:text-white/60" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                    placeholder="Search movies & shows..."
                    className="w-full h-10 pl-10 pr-10 bg-white/[0.06] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/20 transition-all"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 animate-spin" />
                  )}
                </div>
              </form>

              {/* Desktop Search Results */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <motion.button
                          key={`${result.mediaType}-${result.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-colors group"
                        >
                          <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10">
                            {result.poster ? (
                              <img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-5 h-5 text-white/20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                              {result.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/50">
                              <span>{result.year}</span>
                              <span>•</span>
                              <span className="capitalize">{result.mediaType}</span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={handleSearch}
                      className="w-full p-3 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      View all results
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden h-9 w-9 text-white/70 hover:text-white hover:bg-white/5 rounded-full"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* User Menu (Desktop & Mobile) */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden md:flex h-9 px-3 gap-2 items-center hover:bg-white/5 rounded-full"
                    >
                      <Avatar className="w-6 h-6 border border-white/20">
                        <AvatarImage src={`https://avatar.vercel.sh/${user?.username || 'user'}`} />
                        <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-semibold">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10 mt-2 rounded-xl p-1.5"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs text-white/50">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => router.push("/watchlist")}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/90 focus:bg-white/10 focus:text-white"
                    >
                      <List className="w-4 h-4 mr-2" />
                      My Watchlist
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/ratings")}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/90 focus:bg-white/10 focus:text-white"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      My Ratings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/creator-picks")}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/90 focus:bg-white/10 focus:text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Creator Picks
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin")}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-violet-300 focus:bg-violet-500/10 focus:text-violet-200"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/50 focus:bg-white/10 focus:text-white"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="hidden md:flex h-9 px-4 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded-full text-sm font-medium"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden h-9 w-9 text-white/70 hover:text-white hover:bg-white/5 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Search Sheet */}
      <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
        <SheetContent side="top" className="bg-black/95 backdrop-blur-xl border-white/10 p-0 h-full">
          <SheetHeader className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white text-base">Search</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(false)}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/5 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies & TV shows..."
                  autoFocus
                  className="w-full h-12 pl-11 pr-11 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 focus:border-white/20"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 animate-spin" />
                )}
              </div>
            </form>

            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.mediaType}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      {result.poster ? (
                        <img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                        <span>{result.year}</span>
                        <span>•</span>
                        <span className="capitalize">{result.mediaType}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-white/10 w-80 p-0">
          <SheetHeader className="p-6 border-b border-white/10">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white/20">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.username || 'user'}`} />
                  <AvatarFallback className="bg-violet-500/20 text-violet-300 font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
              </div>
            ) : (
              <SheetTitle className="text-white text-base">Menu</SheetTitle>
            )}
          </SheetHeader>

          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              onClick={() => { setIsMenuOpen(false); router.push("/"); }}
              className="w-full justify-start h-11 px-4 text-white/90 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Film className="w-4 h-4 mr-3" />
              Movies
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setIsMenuOpen(false); router.push("/tv"); }}
              className="w-full justify-start h-11 px-4 text-white/90 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Film className="w-4 h-4 mr-3" />
              TV Shows
            </Button>

            {isAuthenticated && (
              <>
                <div className="h-px bg-white/10 my-2" />
                <Button
                  variant="ghost"
                  onClick={() => { setIsMenuOpen(false); router.push("/watchlist"); }}
                  className="w-full justify-start h-11 px-4 text-white/90 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <List className="w-4 h-4 mr-3" />
                  My Watchlist
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setIsMenuOpen(false); router.push("/ratings"); }}
                  className="w-full justify-start h-11 px-4 text-white/90 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <Star className="w-4 h-4 mr-3" />
                  My Ratings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setIsMenuOpen(false); router.push("/creator-picks"); }}
                  className="w-full justify-start h-11 px-4 text-white/90 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <Crown className="w-4 h-4 mr-3" />
                  Creator Picks
                </Button>
                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => { setIsMenuOpen(false); router.push("/admin"); }}
                    className="w-full justify-start h-11 px-4 text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 rounded-xl"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Admin Panel
                  </Button>
                )}
                <div className="h-px bg-white/10 my-2" />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start h-11 px-4 text-white/50 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  Logout
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="h-px bg-white/10 my-2" />
                <Button
                  onClick={() => { setIsMenuOpen(false); router.push("/login"); }}
                  className="w-full h-11 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded-xl"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}