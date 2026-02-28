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
      className="w-full flex items-start gap-3 p-3 bg-card/60 hover:bg-primary/10 border border-border/70 hover:border-primary/50 md:transition-all duration-200 text-left group"
    >
      {/* Poster */}
      <div className="w-16 h-24 bg-card shrink-0 overflow-hidden rounded-lg border border-border/70">
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
            <Film className="w-6 h-6 text-muted-foreground/70" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{movie.year}</span>
          {movie.rating > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

