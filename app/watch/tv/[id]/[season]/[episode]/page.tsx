"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { 
    Loader2, ArrowLeft, AlertCircle, ChevronLeft, ChevronRight, 
    ChevronDown, List, X, Play
} from "lucide-react";
import { API_BASE_URL, tvAPI, getAccessToken } from "@/lib/api";

export default function WatchTVPage() {
    const router = useRouter();
    const params = useParams();
    const tvId = params?.id as string;
    const currentSeason = parseInt(params?.season as string) || 1;
    const currentEpisode = parseInt(params?.episode as string) || 1;
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [embedUrl, setEmbedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [showEpisodeList, setShowEpisodeList] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(currentSeason);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch TV show details for title and seasons
    const { data: tvDetails, isLoading: loadingTv } = useQuery({
        queryKey: ["tv-details", tvId],
        queryFn: () => tvAPI.getDetails(Number(tvId)),
        enabled: !!tvId,
    });

    // Fetch season details for episode list
    const { data: seasonData, isLoading: loadingSeason } = useQuery({
        queryKey: ["tv-season", tvId, selectedSeason],
        queryFn: () => tvAPI.getSeason(Number(tvId), selectedSeason),
        enabled: !!tvId && !!selectedSeason,
    });

    // Get all seasons for dropdown
    const { data: fullTvDetails } = useQuery({
        queryKey: ["tv-full", tvId],
        queryFn: () => tvAPI.getFullDetails(Number(tvId)),
        enabled: !!tvId,
    });

    const seasons = fullTvDetails?.details?.seasons?.filter((s: any) => s.season_number > 0) || [];
    const episodes = seasonData?.episodes || [];
    
    // Calculate total episodes
    const totalEpisodes = episodes.length;
    const hasNextEpisode = currentEpisode < totalEpisodes;
    const hasPrevEpisode = currentEpisode > 1;
    const nextEpisode = hasNextEpisode ? { season: selectedSeason, episode: currentEpisode + 1 } : null;
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        setShowEpisodeList(!isMobile);
    }, [isMobile]);

    // Fetch embed URL
    const { data: embedData, isLoading: isLoadingEmbed, error: embedError } = useQuery({
        queryKey: ["vidsrc", "tv", tvId, currentSeason, currentEpisode],
        queryFn: async () => {
            const token = getAccessToken();
            const url = `${API_BASE_URL}/vidsrc/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode}`;
            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch embed URL");
            }
            return await response.json();
        },
        enabled: isAuthenticated && !authLoading && !!tvId,
        retry: 2,
        retryDelay: 1000,
    });

    useEffect(() => {
        if (embedData?.embed_url) {
            setEmbedUrl(embedData.embed_url);
            setError(null);
        }
    }, [embedData]);

    useEffect(() => {
        if (embedError) {
            setError(embedError.message || "Failed to load video");
        }
    }, [embedError]);

    // Auto-play next episode
    useEffect(() => {
        if (!autoPlayEnabled || !embedUrl) return;
        
        const handleMessage = (event: MessageEvent) => {
            if (event.data === "ended" || event.data?.type === "ended") {
                if (hasNextEpisode) {
                    router.push(`/watch/tv/${tvId}/${selectedSeason}/${currentEpisode + 1}`);
                } else if (selectedSeason < seasons.length) {
                    // Go to next season
                    router.push(`/watch/tv/${tvId}/${selectedSeason + 1}/1`);
                }
            }
        };
        
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [autoPlayEnabled, embedUrl, hasNextEpisode, currentEpisode, selectedSeason, seasons.length, tvId, router]);

    // Show/hide controls on mouse move
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (embedUrl) setShowControls(false);
        }, 3000);
    }, [embedUrl]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // Update selected season when URL changes
    useEffect(() => {
        setSelectedSeason(currentSeason);
    }, [currentSeason]);

    // Handle season/episode navigation
    const goToEpisode = (season: number, episode: number) => {
        router.push(`/watch/tv/${tvId}/${season}/${episode}`);
        setShowEpisodeList(false);
    };

    const goToNextEpisode = () => {
        if (hasNextEpisode) {
            goToEpisode(selectedSeason, currentEpisode + 1);
        } else if (selectedSeason < seasons.length) {
            goToEpisode(selectedSeason + 1, 1);
        }
    };

    const goToPrevEpisode = () => {
        if (hasPrevEpisode) {
            goToEpisode(selectedSeason, currentEpisode - 1);
        } else if (selectedSeason > 1) {
            const prevSeason = selectedSeason - 1;
            // Would need to fetch prev season episode count - simplified for now
            goToEpisode(prevSeason, 1);
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !authLoading && tvId) {
            const redirectPath = `/watch/tv/${tvId}/${currentSeason}/${currentEpisode}`;
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        }
    }, [isAuthenticated, authLoading, router, tvId, currentSeason, currentEpisode]);

    const isLoading = authLoading || isLoadingEmbed || loadingTv || loadingSeason;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm text-gray-400">Loading episode...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Error state
    if (error || !embedUrl) {
        const isVidsrcError = error?.includes("unavailable") || error?.includes("Vidsrc");
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isVidsrcError ? "text-yellow-500" : "text-red-500"}`} />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {isVidsrcError ? "Stream Unavailable" : "Unable to Load Episode"}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {isVidsrcError ? "This episode is not available on our streaming service yet." : "Something went wrong. Please try again."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 bg-card text-white rounded-lg hover:bg-secondary">
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                        <button onClick={() => router.push(`/tv/${tvId}`)} className="px-4 py-2 bg-primary text-black rounded-lg">
                            Go to TV Show
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentEpisodeData = episodes[currentEpisode - 1];

    const episodeList = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold">Episodes</h2>
                    {isMobile && (
                        <button onClick={() => setShowEpisodeList(false)} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                    className="w-full bg-secondary text-white text-sm px-3 py-2 rounded-lg border border-white/10 cursor-pointer"
                >
                    {seasons.map((season: any) => (
                        <option key={season.season_number} value={season.season_number}>
                            Season {season.season_number} ({season.episode_count} episodes)
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto">
                {episodes.map((episode: any) => (
                    <button
                        key={episode.episode_number}
                        onClick={() => goToEpisode(selectedSeason, episode.episode_number)}
                        className={`w-full p-3 flex gap-3 hover:bg-white/5 transition-colors text-left ${
                            episode.episode_number === currentEpisode ? "bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                    >
                        <div className="flex-shrink-0 w-24 aspect-video rounded overflow-hidden bg-zinc-800 relative group">
                            {episode.still_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                                    alt={episode.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <Play className="w-6 h-6 text-zinc-600" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Play className="w-4 h-4 text-black fill-black" />
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                E{episode.episode_number}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium line-clamp-1 ${
                                episode.episode_number === currentEpisode ? "text-primary" : "text-white"
                            }`}>
                                {episode.episode_number}. {episode.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {episode.air_date ? new Date(episode.air_date).getFullYear() : "TBA"}
                                {episode.runtime && ` · ${episode.runtime}m`}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {episode.overview || "No description available."}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col lg:flex-row" onMouseMove={handleMouseMove}>
            <div className="flex-1 relative">
                {/* Top Bar */}
                <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/85 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push(`/tv/${tvId}`)}
                                className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm hidden sm:inline">Back</span>
                            </button>
                            <div className="text-white">
                                <h1 className="font-semibold text-sm sm:text-base line-clamp-1">{tvDetails?.name || "TV Show"}</h1>
                                <p className="text-xs text-gray-400">
                                    Season {currentSeason} Episode {currentEpisode}
                                    {currentEpisodeData?.name && ` · ${currentEpisodeData.name}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => goToEpisode(parseInt(e.target.value), 1)}
                                    className="appearance-none bg-black/50 text-white text-sm px-3 py-2 pr-8 rounded-lg cursor-pointer hover:bg-black/70 border border-white/10"
                                >
                                    {seasons.map((season: any) => (
                                        <option key={season.season_number} value={season.season_number}>
                                            Season {season.season_number}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                            </div>

                            <button
                                onClick={() => setShowEpisodeList(!showEpisodeList)}
                                className={`p-2 rounded-lg transition-colors ${showEpisodeList ? "bg-primary text-black" : "bg-black/50 text-white hover:bg-black/70"}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative h-[100svh] bg-black">
                    <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        title="TV Episode Player"
                    />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/85 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                    {currentEpisodeData && (
                        <div className="mb-3">
                            <h3 className="text-white font-semibold text-base">{currentEpisodeData.name}</h3>
                            {currentEpisodeData.overview && (
                                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{currentEpisodeData.overview}</p>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goToPrevEpisode}
                            disabled={!hasPrevEpisode && selectedSeason === 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                hasPrevEpisode || selectedSeason > 1
                                    ? "bg-white/10 text-white hover:bg-white/20"
                                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Previous</span>
                        </button>

                        <button
                            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                            className={`text-xs px-3 py-2 rounded-lg ${autoPlayEnabled ? "bg-primary/15 text-primary" : "bg-white/10 text-gray-300"}`}
                        >
                            {autoPlayEnabled ? "Autoplay On" : "Autoplay Off"}
                        </button>

                        <button
                            onClick={goToNextEpisode}
                            disabled={!hasNextEpisode && selectedSeason >= seasons.length}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                hasNextEpisode || selectedSeason < seasons.length
                                    ? "bg-primary text-black hover:bg-accent"
                                    : "bg-primary/50 text-black/50 cursor-not-allowed"
                            }`}
                        >
                            <span className="text-sm">Next</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Episode List */}
            {isMobile ? (
                showEpisodeList && (
                    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm">
                        <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-card border-t border-white/10 rounded-t-2xl overflow-hidden">
                            {episodeList}
                        </div>
                    </div>
                )
            ) : (
                <div className={`${showEpisodeList ? "w-96" : "w-0"} bg-card border-l border-white/10 transition-all duration-300 overflow-hidden`}>
                    {episodeList}
                </div>
            )}
        </div>
    );
}
