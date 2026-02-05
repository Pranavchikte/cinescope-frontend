"use client";

import { motion } from "framer-motion";

export function MovieCardSkeleton() {
  return (
    <div className="relative">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-[#2a2a2a] overflow-hidden rounded-sm">
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3a3a3a]/60 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Title Below Card - Mobile Only */}
      <div className="mt-2 md:hidden space-y-1.5">
        <div className="h-3 bg-[#2a2a2a] rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-[#2a2a2a] rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}