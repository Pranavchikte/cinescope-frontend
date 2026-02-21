"use client";

import { motion } from "framer-motion";
import { Film, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

interface MovieSuggestionCardProps {
  movie: {
    id: number;
    title: string;
    poster: string;
    rating: number;
    year: number;
    media_type: 'movie' | 'tv';
  };
  onSelect?: () => void;
}

export function MovieSuggestionCard({ movie, onSelect }: MovieSuggestionCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const hasPoster = movie.poster && !imageError;

  const handleClick = () => {
    const mediaType = movie.media_type || 'movie';
    if (onSelect) onSelect();
    router.push(`/${mediaType}/${movie.id}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-start gap-3 p-3 bg-[#2A2A2A]/50 hover:bg-[#14B8A6]/10 border border-[#2A2A2A] hover:border-[#14B8A6]/50 md:transition-all duration-200 text-left group"
    >
      {/* Poster */}
      <div className="w-16 h-24 bg-[#1A1A1A] shrink-0 overflow-hidden rounded-lg border border-[#2A2A2A]">
        {hasPoster ? (
          <Image
            src={movie.poster}
            alt={movie.title}
            width={64}
            height={96}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-6 h-6 text-[#808080]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-sm font-medium text-[#F5F5F5] line-clamp-2 leading-tight mb-1 group-hover:text-[#14B8A6] transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
          <span>{movie.year}</span>
          {movie.rating > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#14B8A6] text-[#14B8A6]" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}
