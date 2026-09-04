import React from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import type { AgentProfile } from "../types";

interface ChatHeaderProps {
  agent: AgentProfile;
  handleShare?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ agent }) => {
  const avatarUrl =
    agent.avatar ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={agent.name}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-2xs"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm sm:text-base font-bold text-zinc-950 truncate leading-tight">
              {agent.name}
            </h1>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Aktif 24/7 • Respons Instan</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {agent.adminWhatsApp && (
          <a
            href={`https://wa.me/${agent.adminWhatsApp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat WhatsApp CS</span>
          </a>
        )}

        {!agent.hideBranding && (
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-bold text-zinc-900">Obrool</span>
          </a>
        )}
      </div>
    </header>
  );
};
