"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { API_BASE_URL, moviesAPI, getAccessToken } from "@/lib/api";

export default function WatchMoviePage() {
    const router = useRouter();
    const params = useParams();
    const movieId = params?.id as string;
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [embedUrl, setEmbedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch movie details for title and info
    const { data: movieDetails, isLoading: loadingMovie } = useQuery({
        queryKey: ["movie-details", movieId],
        queryFn: () => moviesAPI.getDetails(Number(movieId)),
        enabled: !!movieId,
    });

    // Fetch Vidsrc embed URL
    const { data, isLoading: isLoadingEmbed, error: embedError } = useQuery({
        queryKey: ["vidsrc", "movie", movieId],
        queryFn: async () => {
            const token = getAccessToken();
            const response = await fetch(`${API_BASE_URL}/vidsrc/movie/${movieId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch embed URL");
            }
            return await response.json();
        },
        enabled: isAuthenticated && !authLoading && !!movieId,
        retry: 2,
        retryDelay: 1000,
    });

    // Update embed URL when data changes
    useEffect(() => {
        if (data?.embed_url) {
            setEmbedUrl(data.embed_url);
        }
    }, [data]);

    // Set error state
    useEffect(() => {
        if (embedError) {
            setError(embedError.message || "Failed to load video");
        }
    }, [embedError]);

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

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !authLoading && movieId) {
            router.push(`/login?redirect=${encodeURIComponent(`/watch/movie/${movieId}`)}`);
        }
    }, [isAuthenticated, authLoading, router, movieId]);

    // Get related/recommended movies
    const { data: recommendations } = useQuery({
        queryKey: ["movie-recommendations", movieId],
        queryFn: () => moviesAPI.getRecommendations(Number(movieId)),
        enabled: !!movieId,
    });

    // Handle loading state
    const isLoading = authLoading || isLoadingEmbed || loadingMovie;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm text-gray-400">Loading video...</p>
                </div>
            </div>
        );
    }

    // Handle not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Handle error state
    if (error) {
        const isVidsrcError = error.includes("unavailable") || error.includes("Vidsrc");
        
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isVidsrcError ? "text-yellow-500" : "text-red-500"}`} />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {isVidsrcError ? "Stream Unavailable" : "Unable to Load Video"}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {isVidsrcError 
                            ? "This movie is not available on our streaming service yet. We're working on adding more content!"
                            : "Something went wrong while loading the video. Please try again."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-card text-white rounded-lg hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle no embed URL
    if (!embedUrl) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Stream Not Available</h2>
                    <p className="text-gray-400 mb-6">
                        This movie is not available for streaming at the moment. Check back later for new content!
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-card text-white rounded-lg hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black" onMouseMove={handleMouseMove}>
            {/* Player */}
            <div className={`relative bg-black ${showInfo ? "h-[60svh]" : "h-[100svh]"}`}>
                {/* Top Bar */}
                <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/85 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm hidden sm:inline">Back</span>
                            </button>
                            <div className="text-white">
                                <h1 className="font-semibold text-sm sm:text-base line-clamp-1">
                                    {movieDetails?.title || "Movie"}
                                </h1>
                                <p className="text-xs text-gray-400">
                                    {movieDetails?.release_date?.split("-")[0]}
                                    {movieDetails?.runtime && ` · ${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${showInfo ? "bg-primary text-black" : "bg-black/50 text-white hover:bg-black/70"}`}
                        >
                            Details
                        </button>
                    </div>
                </div>

                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    title="Movie Player"
                />
            </div>

            {/* Details Panel */}
            <div className={`bg-card border-t border-border transition-all duration-300 overflow-hidden ${showInfo ? "max-h-[60svh]" : "max-h-0"}`}>
                <div className="p-6 overflow-y-auto max-h-[60svh]">
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-shrink-0">
                            {movieDetails?.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${movieDetails.poster_path}`}
                                    alt={movieDetails.title}
                                    className="w-32 md:w-44 rounded-lg shadow-lg"
                                />
                            ) : (
                                <div className="w-32 md:w-44 aspect-[2/3] bg-zinc-800 rounded-lg flex items-center justify-center">
                                    <span className="text-zinc-500 text-xs">No Poster</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">{movieDetails?.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                                {movieDetails?.release_date && (
                                    <span>{movieDetails.release_date.split("-")[0]}</span>
                                )}
                                {movieDetails?.runtime && (
                                    <span>
                                        {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
                                    </span>
                                )}
                                {movieDetails?.vote_average > 0 && (
                                    <span className="text-primary">
                                        ★ {movieDetails.vote_average.toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {movieDetails?.genres?.map((genre: any) => (
                                    <span
                                        key={genre.id}
                                        className="px-3 py-1 bg-white/10 text-white text-xs rounded-full"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-300 leading-relaxed">{movieDetails?.overview}</p>
                        </div>
                    </div>

                    {recommendations?.results && recommendations.results.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Up Next</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {recommendations.results.slice(0, 10).map((movie: any) => (
                                    <button
                                        key={movie.id}
                                        onClick={() => {
                                            router.push(`/watch/movie/${movie.id}`);
                                            setShowInfo(false);
                                        }}
                                        className="group text-left"
                                    >
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-2">
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-zinc-500 text-xs">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                            {movie.title}
                                        </h4>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
