"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authAPI, getAccessToken, moviesAPI, tvAPI } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Menu, X, Film, ChevronDown, Loader2, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
  id: number
  title: string
  poster: string
  year: number
  mediaType: "movie" | "tv"
  rating: number
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auth & User state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null) // Stores the full user object (including role)
  const router = useRouter()

  useEffect(() => {
    const token = getAccessToken()
    setIsAuthenticated(!!token)

    if (token) {
      // Fetch user profile to check for admin role
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

  // Optimized search logic
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

      const movies = moviesData.results.slice(0, 2).map((m: any) => ({
        id: m.id,
        title: m.title,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
        mediaType: "movie" as const,
        rating: m.vote_average,
      }))

      const tvShows = tvData.results.slice(0, 2).map((s: any) => ({
        id: s.id,
        title: s.name,
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "",
        year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 2024,
        mediaType: "tv" as const,
        rating: s.vote_average,
      }))

      const combined = [...movies, ...tvShows].sort((a, b) => b.rating - a.rating)
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
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setShowResults(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.mediaType}/${result.id}`)
    setSearchQuery("")
    setShowResults(false)
  }

  const menuVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Film className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold hidden sm:block">CineScope</h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            <button
              onClick={() => router.push("/")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Movies
            </button>
            <button
              onClick={() => router.push("/tv")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              TV Shows
            </button>
            
            {/* Added: Creator Picks Link */}
            <button
              onClick={() => router.push("/creator-picks")}
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4 text-yellow-500" />
              Creator Picks
            </button>

            {/* Added: Admin Only Link */}
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push("/admin")}
                className="text-primary hover:text-primary/80 transition-colors font-bold border-l border-white/20 pl-4 flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
          </div>

          {/* Search (Desktop) */}
          <div className="hidden md:flex flex-1 mx-8 max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  placeholder="Search movies & TV shows..."
                  className="w-full pl-10 pr-10 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 transition-colors"
                  autoComplete="off"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
              </div>
            </form>

            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-secondary/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50"
                >
                  {searchResults.map((result) => (
                    <div
                      key={`${result.mediaType}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-white/5 border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-14 bg-muted rounded overflow-hidden shrink-0">
                        {result.poster ? (
                          <img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{result.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{result.year}</span>
                          <span>•</span>
                          <span className="capitalize">{result.mediaType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSearch} className="w-full p-2.5 text-xs text-primary font-semibold text-center hover:bg-white/5 border-t border-white/10">
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${user?.username || 'user'}`} />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-secondary border-white/10">
                  <DropdownMenuItem onClick={() => router.push("/watchlist")} className="cursor-pointer">My Watchlist</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/ratings")} className="cursor-pointer">My Ratings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 top-16 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] glass-dark border-r border-white/10 z-40 md:hidden p-4 space-y-2"
            >
              <button onClick={() => { setIsOpen(false); router.push("/"); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50">Movies</button>
              <button onClick={() => { setIsOpen(false); router.push("/tv"); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50">TV Shows</button>
              
              {/* Added to Mobile */}
              <button onClick={() => { setIsOpen(false); router.push("/creator-picks"); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" /> Creator Picks
              </button>

              {user?.role === 'admin' && (
                <button onClick={() => { setIsOpen(false); router.push("/admin"); }} className="w-full text-left px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Panel
                </button>
              )}

              <hr className="border-white/10 my-2" />
              
              <button onClick={() => { setIsOpen(false); router.push("/watchlist"); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50">My Watchlist</button>
              <button onClick={() => { setIsOpen(false); router.push("/ratings"); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50">My Ratings</button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg">Logout</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}