"use client";

import React from "react"

import { useState, useEffect } from "react";
import { ArrowRight, Send } from "lucide-react";
import { creatorsAPI, creatorRequestsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Creator {
  id: string;
  username: string;
  is_public_profile: boolean;
}

function CreatorCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-slate-800 rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-slate-800 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-800 rounded w-24" />
        </div>
      </div>
      <div className="h-10 bg-slate-800 rounded" />
    </div>
  );
}

function CreatorRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Become a Creator</h2>
        <p className="text-slate-400 text-sm mb-6">
          Share your curated picks with our community
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us why you'd be a great creator..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatorPicksPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const creatorsRes = await creatorsAPI.getAll();
        setCreators(creatorsRes);

        try {
          const req = await creatorRequestsAPI.getMyRequest();
          setMyRequest(req);
        } catch {
          setMyRequest(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmitRequest = async (message: string) => {
    try {
      setRequestLoading(true);
      const res = await creatorRequestsAPI.create(message);
      setMyRequest(res);
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setRequestLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CreatorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                Creator Picks
              </h1>
              <p className="text-lg text-slate-400">
                Discover curated recommendations from movie enthusiasts
              </p>
            </div>

            {/* CTA Button */}
            {!myRequest && (
              <button
                onClick={() => setShowModal(true)}
                disabled={requestLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 whitespace-nowrap"
              >
                {requestLoading ? "Requesting..." : "Become a Creator"}
              </button>
            )}

            {myRequest?.status === "pending" && (
              <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-medium text-sm">
                  ⏳ Request pending
                </p>
              </div>
            )}

            {myRequest?.status === "approved" && (
              <div className="px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium text-sm">
                  ✓ You are a creator
                </p>
              </div>
            )}

            {myRequest?.status === "rejected" && (
              <div className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-medium text-sm">
                  ✗ Request rejected
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-slate-400 text-lg">No creators yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <button
                key={creator.id}
                onClick={() => router.push(`/creator-picks/${creator.username}`)}
                className="group bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl p-6 text-left transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                    <span className="text-xl font-bold text-white">
                      {creator.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {creator.username}
                    </h3>
                    <p className="text-slate-500 text-sm">Curator</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-800/50 px-4 py-3 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                  <span className="text-white text-sm font-medium">
                    View Picks
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <CreatorRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitRequest}
        isLoading={requestLoading}
      />
    </div>
  );
}
