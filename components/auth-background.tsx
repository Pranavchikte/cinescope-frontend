'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMobile } from '@/hooks/use-mobile'

const MOVIE_POSTERS = [
  '/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', '/r7DuyYJ0N3cD8bRKsR5Ygq2P7oa.jpg',
  '/74xTEgt7R36Fpooo50r9T25onhq.jpg', '/t6HIqrRAclMPA5NTYrkcPIsGV82.jpg',
  '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', '/aWeKITRFbbwY8txG5uCj4rMCfSP.jpg',
  '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', '/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
  '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', '/xBHYBT1RPLJfx3zxXdJJKPDN3gW.jpg',
  '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
  '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  '/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg', '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  '/rSPw7tgCH9c6NqICZef0kZjFOQ5.jpg', '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
]

const COLUMN_COUNT = 5

// Shuffle array helper
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function AuthBackground() {
  const [columns, setColumns] = useState<Array<{
    posters: string[]
    speed: number
    direction: 'up' | 'down'
    blur: number
    offset: number
  }>>([])
  const isMobile = useMobile()

  useEffect(() => {
    // Generate random columns with varied properties
    const generatedColumns = Array.from({ length: COLUMN_COUNT }, (_, i) => {
      const shuffledPosters = shuffle(MOVIE_POSTERS)
      // Triple the posters for smoother infinite scroll
      const extendedPosters = [...shuffledPosters, ...shuffledPosters, ...shuffledPosters]
      
      return {
        posters: extendedPosters,
        speed: 15 + Math.random() * 15, // 15-30 seconds
        direction: i % 2 === 0 ? 'up' : 'down' as 'up' | 'down',
        blur: i === 2 ? 0 : (Math.abs(i - 2) * 0.5), // Center column sharp, edges blurred
        offset: Math.random() * 50 - 25, // Random -25% to +25% offset
      }
    })
    
    setColumns(generatedColumns)
  }, [])

  if (columns.length === 0) return null

  // MOBILE VERSION - Static grid, zero animations
  if (isMobile) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-[#0F0F0F]" style={{ zIndex: 0 }}>
        {/* Static grid of posters */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 opacity-30">
          {MOVIE_POSTERS.slice(0, 12).map((poster, index) => (
            <div
              key={index}
              className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A]"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${poster}`}
                alt="Movie poster"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* Dark overlay - no blur, solid color */}
        <div className="absolute inset-0 bg-[#0F0F0F]/85 pointer-events-none" />
      </div>
    )
  }

  // DESKTOP VERSION - Unchanged, all animations intact
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0F0F0F]" style={{ zIndex: 0 }}>
      {/* Animated poster columns */}
      <div className="absolute inset-0 flex gap-2 md:gap-3 -mx-8">
        {columns.map((column, colIndex) => (
          <motion.div
            key={colIndex}
            className="flex flex-col gap-2 md:gap-3 flex-1"
            initial={{ y: `${column.offset}%` }}
            animate={{
              y: column.direction === 'up' 
                ? [`${column.offset}%`, `${column.offset - 33.33}%`]
                : [`${column.offset}%`, `${column.offset + 33.33}%`]
            }}
            transition={{
              duration: column.speed,
              repeat: Infinity,
              ease: 'linear',
              repeatType: 'loop',
            }}
            style={{
              filter: column.blur > 0 ? `blur(${column.blur}px)` : 'none',
            }}
          >
            {column.posters.map((poster, posterIndex) => (
              <motion.div
                key={`${colIndex}-${posterIndex}`}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0,
                  zIndex: 10,
                }}
                className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0 shadow-2xl group cursor-pointer"
                style={{
                  transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
                  opacity: colIndex === 2 ? 0.9 : 0.7, // Center brighter
                }}
              >
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14B8A6]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 20px rgba(20, 184, 166, 0.4)' }} />
                
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                
                <img
                  src={`https://image.tmdb.org/t/p/w500${poster}`}
                  alt="Movie poster"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Radial gradient from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,15,15,0.3)_40%,rgba(15,15,15,0.8)_100%)] pointer-events-none" />
      
      {/* Extra overlay for form area */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0F0F]/70 to-transparent pointer-events-none" />

      {/* Animated gradient orbs for depth */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-96 h-96 bg-[#14B8A6] rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#0D9488] rounded-full blur-3xl pointer-events-none"
      />
    </div>
  )
}