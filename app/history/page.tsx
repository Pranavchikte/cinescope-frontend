"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { moviesAPI, tvAPI, watchHistoryAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2, Play, Film, Tv, Clock } from "lucide-react";
import Link from "next/link";

interface WatchHistoryItem {
    id: string;
    movie_id?: number;
    tv_show_id?: number;
    season_number?: number;
    episode_number?: number;
    progress?: number;
    quality?: string;
    timestamp?: string;
    title?: string;
    poster?: string;
    year?: number;
    mediaType?: "movie" | "tv";
    runtime?: number;
}

export default function WatchHistoryPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [history, setHistory] = useState<WatchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated) return;
            
            setIsLoading(true);
            try {
                const data = await watchHistoryAPI.getAll();
                if (data && data.length > 0) {
                    const enrichedItems = await Promise.all(
                        data.slice(0, 50).map(async (item: any) => {
                            try {
                                if (item.movie_id) {
                                    const movie = await moviesAPI.getDetails(item.movie_id);
                                    return {
                                        ...item,
                                        title: movie.title,
                                        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
                                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
                                        mediaType: "movie" as const,
                                        runtime: movie.runtime || 0,
                                    };
                                } else if (item.tv_show_id) {
                                    const tv = await tvAPI.getDetails(item.tv_show_id);
                                    return {
                                        ...item,
                                        title: tv.name,
                                        poster: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : "",
                                        year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 2024,
                                        mediaType: "tv" as const,
                                        runtime: tv.episode_run_time?.[0] || 45,
                                    };
                                }
                            } catch (e) {
                                return null;
                            }
                            return null;
                        })
                    );
                    setHistory(enrichedItems.filter(Boolean));
                }
            } catch (e) {
                console.error("Failed to load watch history:", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const filteredHistory = history.filter(item => {
        if (filter === "all") return true;
        if (filter === "movie") return item.mediaType === "movie";
        if (filter === "tv") return item.mediaType === "tv";
        return true;
    });

    const movieItems = filteredHistory.filter(h => h.mediaType === "movie");
    const tvItems = filteredHistory.filter(h => h.mediaType === "tv");

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="px-4 sm:px-6 lg:px-12">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                        Watch History
                    </h1>
                    <p className="text-muted-foreground">
                        {history.length} {history.length === 1 ? "title" : "titles"} in your history
                    </p>
                </div>

                <div className="flex gap-4 mb-8 border-b border-border">
                    {(["all", "movie", "tv"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                filter === f
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f === "movie" && <Film className="w-4 h-4 inline mr-2" />}
                            {f === "tv" && <Tv className="w-4 h-4 inline mr-2" />}
                            {f === "tv" ? "TV" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {filteredHistory.length === 0 && (
                    <div className="text-center py-16">
                        <Clock className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">No watch history yet</h2>
                        <p className="text-muted-foreground mb-6">Start watching to see your progress here</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-2 bg-primary text-black rounded-lg font-semibold"
                        >
                            Start Watching
                        </button>
                    </div>
                )}

                {(filter === "all" || filter === "movie") && movieItems.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5" /> Movies
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {movieItems.map((item) => {
                                const progressPercent = item.runtime && item.progress ? Math.min((item.progress / item.runtime) * 100, 100) : 0;
                                return (
                                    <Link key={item.id} href={`/watch/movie/${item.movie_id}`} className="group">
                                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50">
                                            {item.poster ? (
                                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-muted-foreground/60" /></div>
                                            )}
                                            {progressPercent > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                                                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-black fill-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-foreground text-sm mt-2 line-clamp-1">{item.title}</p>
                                        <p className="text-muted-foreground text-xs">{progressPercent > 0 ? `${Math.round(progressPercent)}%` : item.year}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(filter === "all" || filter === "tv") && tvItems.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Tv className="w-5 h-5" /> TV
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {tvItems.map((item) => {
                                const progressPercent = item.runtime && item.progress ? Math.min((item.progress / item.runtime) * 100, 100) : 0;
                                return (
                                    <Link key={item.id} href={`/watch/tv/${item.tv_show_id}/${item.season_number || 1}/${item.episode_number || 1}`} className="group">
                                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50">
                                            {item.poster ? (
                                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Tv className="w-8 h-8 text-muted-foreground/60" /></div>
                                            )}
                                            {progressPercent > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                                                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                                                S{item.season_number || 1} E{item.episode_number || 1}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-black fill-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-foreground text-sm mt-2 line-clamp-1">{item.title}</p>
                                        <p className="text-muted-foreground text-xs">S{item.season_number || 1} E{item.episode_number || 1}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
