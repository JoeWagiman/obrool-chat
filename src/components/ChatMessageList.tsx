import type { RefObject } from "react";
import { type ChatMessage } from "../types";
import { MessageItem } from "./MessageItem";
import { ObroolCometLoader } from "./ObroolCometLoader";

interface ChatMessageListProps {
  messages: ChatMessage[];
  chatLoading: boolean;
  avatarUrl: string;
  agentName: string;
  avatarStyle?: "round" | "square" | null;
  themeColor?: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  chatLoading,
  avatarUrl,
  agentName,
  avatarStyle = "square",
  themeColor,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          agentAvatar={avatarUrl}
          agentName={agentName}
          avatarStyle={avatarStyle}
          themeColor={themeColor}
        />
      ))}

      {/* Typing Indicator */}
      {chatLoading && (
        <div className="flex gap-2.5 items-center justify-start animate-in fade-in py-1">
          <img
            src={avatarUrl}
            alt={agentName}
            className={`w-7 h-7 object-cover flex-shrink-0 transition-all ${
              avatarStyle === "round" ? "rounded-full" : "rounded-none"
            }`}
          />
          <div className="flex items-center justify-center p-1 bg-transparent">
            <ObroolCometLoader size={22} color={themeColor || "#2563EB"} />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
