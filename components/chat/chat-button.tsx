"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatModal, Message } from "./chat-modal";


export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your movie assistant. Ask me for recommendations, suggestions, or anything about movies!",
    },
  ]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-full shadow-2xl flex items-center justify-center md:transition-all duration-200 group"
        aria-label="Open AI Chat"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[#14B8A6] opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-200" />
        
        {/* Icon */}
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <ChatModal
            onClose={() => setIsOpen(false)}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </AnimatePresence>
    </>
  );
}
