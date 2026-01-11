"use client"

export function MovieCardSkeleton() {
  return (
    <div className="w-full h-72 rounded-lg bg-secondary/50 animate-pulse overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-secondary to-secondary/50" />
        <div className="p-3 space-y-2 bg-secondary/30">
          <div className="h-4 bg-secondary rounded w-3/4" />
          <div className="h-3 bg-secondary rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
