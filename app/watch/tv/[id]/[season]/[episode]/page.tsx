"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function WatchTVPage() {
    const router = useRouter();
    const params = useParams();
    const tvId = params?.id as string;
    const season = params?.season as string;
    const episode = params?.episode as string;
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [embedUrl, setEmbedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Build the query string
    const queryParams = new URLSearchParams();
    if (season) queryParams.set("season", season);
    if (episode) queryParams.set("episode", episode);

    // Fetch Vidsrc embed URL
    const { data, isLoading: isLoadingEmbed, error: embedError } = useQuery({
        queryKey: ["vidsrc", "tv", tvId, season, episode],
        queryFn: async () => {
            const token = localStorage.getItem("access_token") || localStorage.getItem("token");
            const url = `${API_BASE_URL}/vidsrc/tv/${tvId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url, {
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
        enabled: isAuthenticated && !authLoading && !!tvId,
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

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !authLoading && tvId) {
            const redirectPath = season && episode 
                ? `/watch/tv/${tvId}/${season}/${episode}`
                : `/watch/tv/${tvId}`;
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        }
    }, [isAuthenticated, authLoading, router, tvId, season, episode]);

    // Handle loading state
    if (authLoading || isLoadingEmbed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#14B8A6]" />
                    <p className="text-sm text-gray-400">Loading episode...</p>
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
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Episode</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push(`/tv/${tvId}`)}
                            className="px-4 py-2 bg-[#14B8A6] text-black rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
                        >
                            Go to TV Show
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
                    <h2 className="text-xl font-semibold text-white mb-2">Episode Not Available</h2>
                    <p className="text-gray-400 mb-6">This episode is not available for streaming at the moment.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push(`/tv/${tvId}`)}
                            className="px-4 py-2 bg-[#14B8A6] text-black rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
                        >
                            Go to TV Show
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black w-full h-screen overflow-hidden">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
            </button>

            {/* Episode info */}
            {season && episode && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-3 py-1 bg-black/50 text-white text-sm rounded-lg backdrop-blur-sm">
                    Season {season} Episode {episode}
                </div>
            )}

            {/* Vidsrc iframe embed */}
            <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title="TV Episode Player"
            />
        </div>
    );
}