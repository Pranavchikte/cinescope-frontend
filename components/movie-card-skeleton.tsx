"use client";

import { Film } from "lucide-react";

export function MovieCardSkeleton() {
  return (
    <div className="relative">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/60 bg-card/80">
        {/* Film Icon Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-14 h-14 text-muted-foreground/40" />
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Title Below Card - Mobile Only */}
      <div className="mt-2 md:hidden space-y-1.5">
        <div className="h-3 rounded bg-card/70 w-3/4 animate-pulse" />
        <div className="h-3 rounded bg-card/70 w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
