"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-[#14B8A6]"
            : "bg-gradient-to-br from-[#14B8A6] to-[#0D9488]"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#0F0F0F]" />
        ) : (
          <Bot className="w-4 h-4 text-[#0F0F0F]" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          isUser
            ? "bg-[#14B8A6] text-[#0F0F0F] rounded-tr-sm"
            : "bg-[#2A2A2A] text-[#F5F5F5] rounded-tl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}