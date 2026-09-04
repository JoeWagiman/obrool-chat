import React from "react";
import type { BioLink } from "../types";
import {
  Globe,
  ShoppingBag,
  MessageCircle,
  Tag,
  Link as LinkIcon,
  ArrowUpRight,
  ShieldCheck,
  Settings,
} from "lucide-react";

interface BioLinksSectionProps {
  name: string;
  avatar: string | null;
  bio?: string | null;
  links?: BioLink[];
  adminWhatsApp?: string | null;
  isOwner?: boolean;
  showOwnerPanel?: boolean;
  onToggleOwnerPanel?: () => void;
  onOpenOwnerLogin?: () => void;
}

function getLinkIcon(type?: string) {
  switch (type) {
    case "shopping-bag":
      return <ShoppingBag className="w-4 h-4 text-zinc-700" />;
    case "message-circle":
      return <MessageCircle className="w-4 h-4 text-zinc-700" />;
    case "tag":
      return <Tag className="w-4 h-4 text-zinc-700" />;
    case "globe":
      return <Globe className="w-4 h-4 text-zinc-700" />;
    default:
      return <LinkIcon className="w-4 h-4 text-zinc-700" />;
  }
}

export const BioLinksSection: React.FC<BioLinksSectionProps> = ({
  name,
  avatar,
  bio,
  links = [],
  adminWhatsApp,
  isOwner,
  showOwnerPanel,
  onToggleOwnerPanel,
  onOpenOwnerLogin,
}) => {
  const avatarUrl =
    avatar ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto pt-2 pb-3 px-4 space-y-5 text-center relative">
      {/* Owner Settings Quick Access (Right-aligned, only visible to owner) */}
      {isOwner && (
        <div className="flex justify-end mb-1">
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
        </div>
      )}

      {/* Store Avatar & Info */}
      <div className="space-y-3">
        <div className="relative inline-block">
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md mx-auto"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-zinc-200 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight flex items-center justify-center gap-1.5">
            <span>{name}</span>
          </h2>
          {bio ? (
            <p className="text-[15px] text-zinc-600 leading-relaxed max-w-md mx-auto">
              {bio}
            </p>
          ) : (
            <p className="text-[15px] text-zinc-400">
              Layanan mandiri & asisten chat resmi.
            </p>
          )}
        </div>
      </div>

      {/* Bio Links */}
      <div className="space-y-2.5">
        {links.length > 0 &&
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-[15px] font-semibold text-zinc-800 transition-all flex items-center justify-between shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center flex-shrink-0">
                  {getLinkIcon(link.icon)}
                </div>
                <span className="truncate text-left">{link.title}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
            </a>
          ))}

        {/* WhatsApp Admin Direct Link */}
        {adminWhatsApp && (
          <a
            href={`https://wa.me/${adminWhatsApp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-[15px] font-semibold text-zinc-800 transition-all flex items-center justify-between shadow-2xs group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-zinc-700" />
              </div>
              <span className="truncate text-left">Hubungi Langsung via WhatsApp</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
          </a>
        )}
      </div>

      {/* Footer Branding & Owner Access */}
      <footer className="pt-4 pb-1 text-center flex items-center justify-center gap-2 text-[12px] text-zinc-400">
        <a
          href="https://chat.obrool.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 transition-colors font-medium"
        >
          chat.obrool.com
        </a>
        {!isOwner && onOpenOwnerLogin && (
          <>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenOwnerLogin}
              className="hover:text-zinc-600 transition-colors cursor-pointer"
            >
              Masuk
            </button>
          </>
        )}
      </footer>
    </div>
  );
};
