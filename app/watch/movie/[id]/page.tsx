"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function WatchMoviePage() {
    const router = useRouter();
    const params = useParams();
    const movieId = params?.id as string;
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [embedUrl, setEmbedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Fetch Vidsrc embed URL
    const { data, isLoading: isLoadingEmbed, error: embedError } = useQuery({
        queryKey: ["vidsrc", "movie", movieId],
        queryFn: async () => {
            const token = localStorage.getItem("access_token") || localStorage.getItem("token");
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

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !authLoading && movieId) {
            router.push(`/login?redirect=${encodeURIComponent(`/watch/movie/${movieId}`)}`);
        }
    }, [isAuthenticated, authLoading, router, movieId]);

    // Handle loading state
    if (authLoading || isLoadingEmbed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#14B8A6]" />
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
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Video</h2>
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
                            onClick={() => router.push("/")}
                            className="px-4 py-2 bg-[#14B8A6] text-black rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
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
                    <h2 className="text-xl font-semibold text-white mb-2">Video Not Available</h2>
                    <p className="text-gray-400 mb-6">This movie is not available for streaming at the moment.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 bg-[#14B8A6] text-black rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
                        >
                            Go Home
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

            {/* Vidsrc iframe embed */}
            <iframe
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
    );
}