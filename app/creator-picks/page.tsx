"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { creatorsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Creator {
  id: string;
  username: string;
  is_public_profile: boolean;
}

function CreatorCardSkeleton() {
  return (
    <div className="bg-[#2a2a2a] rounded-sm p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-[#404040] rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-[#404040] rounded w-32 mb-2" />
          <div className="h-3 bg-[#404040] rounded w-20" />
        </div>
      </div>
      <div className="h-9 bg-[#404040] rounded w-full" />
    </div>
  );
}

export default function CreatorPicksPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const data = await creatorsAPI.getAll();
        setCreators(data);
      } catch (error) {
        console.error("Failed to fetch creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20">
        <div className="px-4 sm:px-6 lg:px-12 py-8">
          <div className="mb-10">
            <div className="h-10 bg-[#2a2a2a] rounded w-64 mb-3 animate-pulse" />
            <div className="h-5 bg-[#2a2a2a] rounded w-80 max-w-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20">
      <div className="px-4 sm:px-6 lg:px-12 py-8 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Creator Picks
          </h1>
          <p className="text-base text-[#b3b3b3] max-w-2xl">
            Discover curated recommendations from movie enthusiasts and critics
          </p>
        </div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <h3 className="text-2xl font-medium text-white mb-3">No creators yet</h3>
            <p className="text-base text-[#808080]">Check back soon for curated picks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creators.map((creator) => (
              <button
                key={creator.id}
                onClick={() => router.push(`/creator-picks/${creator.username}`)}
                className="group bg-[#2a2a2a] hover:bg-[#333333] rounded-sm p-6 transition-colors text-left"
              >
                {/* Creator Info */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-[#E50914] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-white">
                      {creator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-white mb-0.5 truncate">
                      {creator.username}
                    </h3>
                    <p className="text-sm text-[#808080]">Curator</p>
                  </div>
                </div>

                {/* View Button */}
                <div className="flex items-center justify-between h-9 px-4 bg-[#181818] group-hover:bg-[#404040] rounded transition-colors">
                  <span className="text-sm text-white">View Picks</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}