import React, { useState } from "react";
import { type BioLink, DEFAULT_AVATAR } from "../types";
import {
  Globe,
  ShoppingBag,
  MessageCircle,
  Tag,
  Link as LinkIcon,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronUp,
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
  const avatarUrl = avatar || DEFAULT_AVATAR;
  const [isExpanded, setIsExpanded] = useState(false);

  // Jika jumlah link lebih dari 3, sembunyikan sisanya di tampilan awal agar chat tidak terdorong jauh
  const COLLAPSED_LIMIT = 3;
  const hasMoreLinks = links.length > COLLAPSED_LIMIT;
  const visibleLinks = isExpanded ? links : links.slice(0, COLLAPSED_LIMIT);

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
        {visibleLinks.length > 0 &&
          visibleLinks.map((link) => (
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

        {/* Tombol Lipat / Buka Jika Jumlah Link Lebih Dari 3 */}
        {hasMoreLinks && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 px-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            {isExpanded ? (
              <>
                <span>Sembunyikan tautan</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Lihat {links.length - COLLAPSED_LIMIT} tautan lainnya</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}

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
