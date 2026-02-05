"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { peopleAPI } from "@/lib/api";
import { MovieCard } from "@/components/movie-card";

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  media_type: "movie" | "tv";
}

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "tv">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [personData, movieCredits, tvCredits] = await Promise.all([
          peopleAPI.getDetails(parseInt(resolvedParams.id)),
          peopleAPI.getMovieCredits(parseInt(resolvedParams.id)),
          peopleAPI.getTVCredits(parseInt(resolvedParams.id)),
        ]);

        setPerson(personData);

        const allMovies = (movieCredits.cast || []).map((c: any) => ({
          ...c,
          media_type: "movie" as const,
        }));
        const allTV = (tvCredits.cast || []).map((c: any) => ({
          ...c,
          media_type: "tv" as const,
        }));

        const combined = [...allMovies, ...allTV].sort((a, b) => {
          const dateA = a.release_date || a.first_air_date || "0";
          const dateB = b.release_date || b.first_air_date || "0";
          return dateB.localeCompare(dateA);
        });

        setCredits(combined);
      } catch (err) {
        console.error("Failed to fetch person data:", err);
        setError("Failed to load person details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-sm text-[#808080]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-white mb-3">Person not found</h2>
          <p className="text-base text-[#808080] mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="h-10 px-6 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : "/placeholder.svg";

  const filteredCredits =
    activeTab === "all"
      ? credits
      : credits.filter((c) => c.media_type === (activeTab === "movies" ? "movie" : "tv"));

  const transformCredit = (credit: Credit) => ({
    id: credit.id,
    title: credit.title || credit.name || "Unknown",
    rating: credit.vote_average || 0,
    poster: credit.poster_path ? `https://image.tmdb.org/t/p/w500${credit.poster_path}` : "",
    year: credit.release_date
      ? new Date(credit.release_date).getFullYear()
      : credit.first_air_date
        ? new Date(credit.first_air_date).getFullYear()
        : 2024,
  });

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-20 left-4 sm:left-6 lg:left-12 z-50 w-10 h-10 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#404040] hover:bg-[#333333] transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <div className="pt-20 pb-20">
        <div className="px-4 sm:px-6 lg:px-12 py-8">
          {/* Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 mb-12">
            {/* Profile Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-[300px]">
                <div className="aspect-[2/3] bg-[#2a2a2a] overflow-hidden rounded-sm">
                  <img
                    src={profileUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Name & Department */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {person.name}
                </h1>
                <p className="text-base md:text-lg text-[#b3b3b3]">
                  {person.known_for_department}
                </p>
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                {person.birthday && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#808080]" />
                    <span className="text-sm text-white">
                      {new Date(person.birthday).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#808080]" />
                    <span className="text-sm text-white">{person.place_of_birth}</span>
                  </div>
                )}
              </div>

              {/* Biography */}
              {person.biography && (
                <div className="pt-4 border-t border-[#333333]">
                  <h3 className="text-lg font-medium text-white mb-3">Biography</h3>
                  <div className="text-sm text-[#b3b3b3] leading-relaxed space-y-3">
                    {person.biography.split("\n\n").map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Credits Section */}
          <div>
            {/* Section Header with Tabs */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl md:text-2xl font-medium text-white">Known For</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`h-9 px-4 text-sm font-normal transition-all border ${
                    activeTab === "all"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-[#808080]/50 hover:border-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("movies")}
                  className={`h-9 px-4 text-sm font-normal transition-all border ${
                    activeTab === "movies"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-[#808080]/50 hover:border-white"
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setActiveTab("tv")}
                  className={`h-9 px-4 text-sm font-normal transition-all border ${
                    activeTab === "tv"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-[#808080]/50 hover:border-white"
                  }`}
                >
                  TV Shows
                </button>
              </div>
            </div>

            {/* Credits Grid */}
            {filteredCredits.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-1 md:gap-2">
                {filteredCredits.slice(0, 24).map((credit, index) => (
                  <div key={`${credit.media_type}-${credit.id}-${index}`}>
                    <MovieCard movie={transformCredit(credit)} mediaType={credit.media_type} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-base text-[#808080]">No {activeTab === "all" ? "credits" : activeTab} found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}