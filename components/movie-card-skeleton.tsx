"use client";

import { motion } from "framer-motion";
import { Film } from "lucide-react";

export function MovieCardSkeleton() {
  return (
    <div className="relative">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-[#1A1A1A] overflow-hidden rounded-lg border border-[#2A2A2A]">
        {/* Film Icon Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-16 h-16 md:w-20 md:h-20 text-[#2A2A2A]" />
        </div>
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#14B8A6]/10 to-transparent"
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
        <div className="h-3 bg-[#1A1A1A] rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-[#1A1A1A] rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}