"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { chatAPI } from "@/lib/chat-api";
import { ChatMessage } from "./chat-message";
import { MovieSuggestionCard } from "./movie-suggestion-card";

interface Message {
  role: "user" | "assistant";
  content: string;
  movies?: Array<{
    id: number;
    title: string;
    poster: string;
    rating: number;
    year: number;
    media_type: "movie" | "tv";
  }>;
}

interface ChatModalProps {
  onClose: () => void;
}

export function ChatModal({ onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your movie assistant. Ask me for recommendations, suggestions, or anything about movies!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAPI.ask(userMessage);
      setMessages((prev) => [...prev, response]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md flex items-end md:items-center justify-end md:justify-end"
      onClick={onClose}
    >
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, y: 100, x: 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 100, x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-[85vh] md:w-[420px] md:h-[600px] md:m-6 bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#2A2A2A] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#1A1A1A]/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0F0F0F]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F5F5F5]">Movie Assistant</h2>
              <p className="text-xs text-[#A0A0A0]">Powered by AI</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#14B8A6]/20 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-[#A0A0A0] hover:text-[#14B8A6]" />
          </motion.button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <ChatMessage message={message} />
              {message.movies && message.movies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.movies.map((movie) => (
                    <MovieSuggestionCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-[#A0A0A0] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#2A2A2A] bg-[#1A1A1A]/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about movies..."
              disabled={isLoading}
              className="flex-1 h-11 px-4 bg-[#2A2A2A] border border-[#2A2A2A] focus:border-[#14B8A6]/50 rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#A0A0A0] focus:outline-none transition-all duration-200 disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-11 px-4 bg-[#14B8A6] hover:bg-[#14B8A6]/90 disabled:bg-[#2A2A2A] disabled:text-[#808080] text-[#0F0F0F] rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}