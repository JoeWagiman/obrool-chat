import { ShieldCheck, Settings, LogIn } from "lucide-react";
import type { AgentProfile } from "../types";

interface ChatHeaderProps {
  agent: AgentProfile;
  isOwner: boolean;
  showOwnerPanel: boolean;
  onToggleOwnerPanel: () => void;
  onOpenOwnerLogin: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  agent,
  isOwner,
  showOwnerPanel,
  onToggleOwnerPanel,
  onOpenOwnerLogin,
}) => {
  const avatarUrl =
    agent.avatar ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

  return (
    <header className="h-14 px-3 sm:px-5 bg-white border-b border-zinc-200 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
      {/* Left: Avatar & Store Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={agent.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-zinc-200 shadow-2xs"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-xs sm:text-sm font-bold text-zinc-950 truncate leading-tight">
              {agent.name}
            </h1>
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-800 flex-shrink-0" />
          </div>
          <p className="text-[10px] font-medium text-zinc-500 truncate">
            {agent.handle ? `@${agent.handle}` : "Asisten AI"}
          </p>
        </div>
      </div>

      {/* Right: Owner / Login Button */}
      <div className="flex items-center gap-2">
        {isOwner ? (
          <button
            type="button"
            onClick={onToggleOwnerPanel}
            title={showOwnerPanel ? "Tutup Pengaturan" : "Pengaturan Profil"}
            aria-label={showOwnerPanel ? "Tutup Pengaturan" : "Pengaturan Profil"}
            className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center shadow-2xs ${
              showOwnerPanel
                ? "bg-zinc-950 text-white border-zinc-950"
                : "border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-950 bg-white hover:bg-zinc-100"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenOwnerLogin}
            title="Masuk ke akun Obrool"
            className="px-3 py-1.5 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 rounded-lg text-xs font-semibold transition-colors hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
        )}
      </div>
    </header>
  );
};
