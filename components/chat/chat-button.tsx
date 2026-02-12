"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatModal } from "./chat-modal";


export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0F0F0F] rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 group"
        aria-label="Open AI Chat"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[#14B8A6] opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-200" />
        
        {/* Icon */}
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && <ChatModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}