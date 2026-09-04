import React from "react";
import type { ChatMessage } from "../types";

interface MessageItemProps {
  message: ChatMessage;
  agentAvatar: string;
  agentName: string;
  themeColor?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  agentAvatar,
  agentName,
  themeColor = "#0a0a0b",
}) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in`}>
      {!isUser && (
        <img
          src={agentAvatar}
          alt={agentName}
          className="w-8 h-8 rounded-full object-cover border border-zinc-200 flex-shrink-0 mt-1 shadow-2xs"
        />
      )}

      <div className={`max-w-[85%] sm:max-w-xl flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "text-white rounded-tr-xs shadow-sm font-medium"
              : "bg-white text-zinc-900 border border-zinc-200/90 rounded-tl-xs shadow-2xs"
          }`}
          style={isUser ? { backgroundColor: themeColor } : undefined}
        >
          {message.content}
        </div>

        <span className="text-[10px] text-zinc-400 mt-1 px-1 font-mono">
          {new Date(message.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};
