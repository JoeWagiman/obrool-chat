import React from "react";
import type { ChatMessage } from "../types";
import { renderMarkdown } from "../lib/markdown";

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

      <div className={`max-w-[90%] sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
            isUser
              ? "text-white rounded-tr-xs shadow-sm font-medium whitespace-pre-wrap"
              : "bg-white text-zinc-900 border border-zinc-200/90 rounded-tl-xs shadow-2xs prose max-w-none [&_p]:text-[15px] [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-1.5 [&_strong]:font-semibold [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-[13px] [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_th]:bg-zinc-100/90 [&_th]:p-2 [&_th]:border [&_th]:border-zinc-200 [&_th]:text-[14px] [&_th]:font-semibold [&_td]:p-2 [&_td]:border [&_td]:border-zinc-200 [&_td]:text-[14px]"
          }`}
          style={isUser ? { backgroundColor: themeColor } : undefined}
        >
          {isUser ? (
            message.content
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
          )}
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
