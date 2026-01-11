"use client"

import { useEffect, useState as useReactState } from "react"
import { useRouter } from "next/navigation"

import { authAPI, getAccessToken } from "@/lib/api"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Menu, X, Film, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 🔐 Auth state
  const [isAuthenticated, setIsAuthenticated] = useReactState(false)
  const router = useRouter()

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken())
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    setIsAuthenticated(false)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const menuVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
  }

  return (
    <>
      {/* Navbar */}
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

          {/* Search (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies & TV shows..."
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary/50"
              />
            </div>
          </form>

          {/* Desktop Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://avatar.vercel.sh/user" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="bg-secondary border-white/10">
                  <DropdownMenuItem
                    onClick={() => router.push("/watchlist")}
                    className="cursor-pointer"
                  >
                    My Watchlist
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/ratings")}
                    className="cursor-pointer"
                  >
                    My Ratings
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies & TV shows..."
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary/50"
            />
          </form>
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
              className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] glass-dark border-r border-white/10 z-40 md:hidden"
            >
              <div className="p-4 space-y-4">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/watchlist")
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50"
                >
                  My Watchlist
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/ratings")
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50"
                >
                  My Ratings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}