'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { peopleAPI } from '@/lib/api'
import { MovieCard } from '@/components/movie-card'

interface PersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
}

interface Credit {
  id: number
  title?: string
  name?: string
  character?: string
  job?: string
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  vote_average: number
  media_type: 'movie' | 'tv'
}

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [person, setPerson] = useState<PersonDetails | null>(null)
  const [credits, setCredits] = useState<Credit[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{ [key: string]: { x: number; y: number; id: number }[] }>({})
  const router = useRouter()

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

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [personData, movieCredits, tvCredits] = await Promise.all([
          peopleAPI.getDetails(parseInt(resolvedParams.id)),
          peopleAPI.getMovieCredits(parseInt(resolvedParams.id)),
          peopleAPI.getTVCredits(parseInt(resolvedParams.id)),
        ])

        setPerson(personData)

        const allMovies = (movieCredits.cast || []).map((c: any) => ({
          ...c,
          media_type: 'movie' as const,
        }))
        const allTV = (tvCredits.cast || []).map((c: any) => ({
          ...c,
          media_type: 'tv' as const,
        }))

        const combined = [...allMovies, ...allTV].sort((a, b) => {
          const dateA = a.release_date || a.first_air_date || '0'
          const dateB = b.release_date || b.first_air_date || '0'
          return dateB.localeCompare(dateA)
        })

        setCredits(combined)
      } catch (err) {
        console.error('Failed to fetch person data:', err)
        setError('Failed to load person details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPersonData()
  }, [resolvedParams.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] blur-xl opacity-50 animate-pulse" />
            <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin relative z-10" />
          </div>
          <p className="text-sm text-[#A0A0A0] animate-pulse">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
          >
            <AlertCircle className="w-8 h-8 text-[#EF4444]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">Person not found</h2>
          <p className="text-base text-[#A0A0A0] mb-8">{error}</p>
          <motion.button
            onClick={(e) => {
              handleRipple(e, 'go-back')
              router.back()
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-6 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] text-sm font-semibold rounded-lg transition-all relative overflow-hidden group"
          >
            {/* Ripple effect */}
            {ripples['go-back']?.map((ripple) => (
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }} />
            
            <span className="relative z-10">Go Back</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : '/placeholder.svg'

  const filteredCredits =
    activeTab === 'all'
      ? credits
      : credits.filter((c) => c.media_type === (activeTab === 'movies' ? 'movie' : 'tv'))

  const transformCredit = (credit: Credit) => ({
    id: credit.id,
    title: credit.title || credit.name || 'Unknown',
    rating: credit.vote_average || 0,
    poster: credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : '',
    year: credit.release_date
      ? new Date(credit.release_date).getFullYear()
      : credit.first_air_date
        ? new Date(credit.first_air_date).getFullYear()
        : 2024,
  })

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Back Button */}
      <motion.button
        onClick={(e) => {
          handleRipple(e, 'back-button')
          router.back()
        }}
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-24 left-4 sm:left-6 lg:left-12 z-50 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all relative overflow-hidden group"
      >
        {/* Ripple effect */}
        {ripples['back-button']?.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        
        {/* Gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <ArrowLeft className="w-5 h-5 text-[#F5F5F5] relative z-10 group-hover:scale-110 transition-transform duration-200" />
      </motion.button>

      <div className="pt-32 pb-20">
        <div className="px-4 sm:px-6 lg:px-12 py-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 mb-16"
          >
            {/* Profile Image */}
            <div className="flex justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="w-full max-w-[280px]"
              >
                <div className="aspect-[2/3] bg-[#1A1A1A] overflow-hidden rounded-lg border border-[#2A2A2A] shadow-xl relative group">
                  <img
                    src={profileUrl || "/placeholder.svg"}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            </div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              {/* Name & Department */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F5F5] mb-3">
                  {person.name}
                </h1>
                <motion.div
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-[#14B8A6] rounded-full"
                  />
                  <p className="text-lg text-[#14B8A6] font-medium">
                    {person.known_for_department}
                  </p>
                </motion.div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
                {person.birthday && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 group cursor-default"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-10 h-10 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center border border-[#14B8A6]/30 backdrop-blur-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Calendar className="w-5 h-5 text-[#14B8A6] relative z-10" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors">Born</p>
                      <span className="text-sm text-[#F5F5F5]">
                        {new Date(person.birthday).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </motion.div>
                )}
                {person.place_of_birth && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 group cursor-default"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-10 h-10 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center border border-[#14B8A6]/30 backdrop-blur-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <MapPin className="w-5 h-5 text-[#14B8A6] relative z-10" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors">Place of Birth</p>
                      <span className="text-sm text-[#F5F5F5]">{person.place_of_birth}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Biography */}
              {person.biography && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="pt-4 border-t border-[#2A2A2A]"
                >
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Biography</h3>
                  <div className="text-sm text-[#A0A0A0] leading-relaxed space-y-3">
                    {person.biography.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-balance">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Credits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Section Header with Tabs */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Known For</h2>
                <p className="text-sm text-[#A0A0A0] mt-1">
                  {filteredCredits.length} {filteredCredits.length === 1 ? 'credit' : 'credits'}
                </p>
              </div>
              <div className="flex gap-2">
                {(['all', 'movies', 'tv'] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={(e) => {
                      handleRipple(e, `tab-${tab}`)
                      setActiveTab(tab)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden group ${
                      activeTab === tab
                        ? 'bg-[#14B8A6] text-[#0F0F0F]'
                        : 'bg-[#1A1A1A]/50 text-[#A0A0A0] border border-[#2A2A2A] hover:border-[#14B8A6]/30 hover:text-[#F5F5F5] backdrop-blur-xl'
                    }`}
                  >
                    {/* Ripple effect */}
                    {ripples[`tab-${tab}`]?.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full pointer-events-none"
                        style={{ left: ripple.x, top: ripple.y }}
                        initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    
                    {/* Gradient glow for active tab */}
                    {activeTab === tab && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)' }} />
                      </>
                    )}
                    
                    {/* Gradient glow for inactive tabs */}
                    {activeTab !== tab && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    
                    <span className="relative z-10">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Credits Grid */}
            <AnimatePresence mode="wait">
              {filteredCredits.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4"
                >
                  {filteredCredits.slice(0, 24).map((credit, index) => (
                    <motion.div
                      key={`${credit.media_type}-${credit.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      <MovieCard movie={transformCredit(credit)} mediaType={credit.media_type} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-base text-[#A0A0A0]">
                    No {activeTab === 'all' ? 'credits' : activeTab} found
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}