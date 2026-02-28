"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { tvAPI } from "@/lib/api";
import { ChevronRight, Play, ArrowLeft } from "lucide-react";

interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count?: number;
  poster_path?: string | null;
  air_date?: string | null;
  overview?: string | null;
}

interface EpisodeSummary {
  episode_number: number;
  name: string;
  still_path?: string | null;
  air_date?: string | null;
  overview?: string | null;
  runtime?: number | null;
}

export default function WatchTVSelectPage() {
  const router = useRouter();
  const params = useParams();
  const tvId = params?.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeasonLoading, setIsSeasonLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading && tvId) {
      router.push(`/login?redirect=${encodeURIComponent(`/watch/tv/${tvId}`)}`);
    }
  }, [isAuthenticated, authLoading, router, tvId]);

  useEffect(() => {
    const fetchSeasons = async () => {
      if (!tvId || !isAuthenticated) return;
      setIsLoading(true);
      try {
        const data = await tvAPI.getFullDetails(Number(tvId));
        const allSeasons: SeasonSummary[] =
          data?.details?.seasons?.filter((s: any) => s.season_number > 0) || [];
        setSeasons(allSeasons);
        if (allSeasons.length > 0) {
          setSelectedSeason(allSeasons[0].season_number);
        }
      } catch {
        setSeasons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, [tvId, isAuthenticated]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!tvId || !selectedSeason) return;
      setIsSeasonLoading(true);
      try {
        const seasonData = await tvAPI.getSeason(Number(tvId), selectedSeason);
        setEpisodes(seasonData?.episodes || []);
      } catch {
        setEpisodes([]);
      } finally {
        setIsSeasonLoading(false);
      }
    };

    fetchEpisodes();
  }, [tvId, selectedSeason]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-10 pb-16">
      <div className="px-4 sm:px-6 lg:px-12">
        <button
          onClick={() => router.push(`/tv/${tvId}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to show
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          <div className="bg-card/80 border border-border rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Choose Season
            </h2>
            <div className="space-y-2">
              {seasons.map((season) => (
                <button
                  key={season.season_number}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedSeason === season.season_number
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card/60 text-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-background border border-border flex-shrink-0">
                    {season.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${season.poster_path}`}
                        alt={season.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">
                      {season.name || `Season ${season.season_number}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {season.episode_count || 0} episodes
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card/80 border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Episodes
              </h2>
              {selectedSeason && (
                <span className="text-xs text-muted-foreground">
                  Season {selectedSeason}
                </span>
              )}
            </div>

            {isSeasonLoading ? (
              <div className="text-sm text-muted-foreground">Loading episodes...</div>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <button
                    key={episode.episode_number}
                    onClick={() =>
                      router.push(
                        `/watch/tv/${tvId}/${selectedSeason}/${episode.episode_number}`
                      )
                    }
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card/60 hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-background border border-border flex-shrink-0 relative">
                      {episode.still_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-black fill-black" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground line-clamp-1">
                        {episode.episode_number}. {episode.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {episode.air_date ? new Date(episode.air_date).getFullYear() : "TBA"}
                        {episode.runtime ? ` · ${episode.runtime}m` : ""}
                      </div>
                      {episode.overview && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {episode.overview}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
