"use client"

import { motion } from "framer-motion"

export function MovieCardSkeleton() {
  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 h-full flex flex-col">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-zinc-800 overflow-hidden">
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Top Actions Bar Skeleton */}
        <div className="absolute top-0 left-0 right-0 p-2 flex items-start justify-between z-10">
          {/* Rating Badge Skeleton */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
            <div className="w-3 h-3 bg-zinc-700 rounded-full animate-pulse" />
            <div className="w-6 h-3 bg-zinc-700 rounded animate-pulse" />
          </div>

          {/* Watchlist Button Skeleton */}
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
            <div className="w-4 h-4 bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Bottom Action Button Skeleton */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
          <div className="w-full h-11 bg-zinc-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Info Section Skeleton */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title Skeleton */}
          <div className="space-y-1.5">
            <div className="h-3.5 bg-zinc-800 rounded w-full animate-pulse" />
            <div className="h-3.5 bg-zinc-800 rounded w-4/5 animate-pulse" />
          </div>
          
          {/* Year Skeleton */}
          <div className="h-3 bg-zinc-800 rounded w-12 animate-pulse" />
        </div>
      </div>

      {/* Overall pulse effect for depth */}
      <div className="absolute inset-0 bg-zinc-900/20 animate-pulse pointer-events-none" />
    </div>
  )
}