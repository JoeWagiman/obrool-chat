import React, { useState } from "react";
import { type BioLink, DEFAULT_AVATAR } from "../types";
import {
  Globe,
  ShoppingBag,
  MessageCircle,
  Tag,
  ArrowUpRight,
  Check,
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
  avatarStyle?: "round" | "square" | null;
  isOwner?: boolean;
  showOwnerPanel?: boolean;
  onToggleOwnerPanel?: () => void;
  onOpenOwnerLogin?: () => void;
  referralCode?: string | null;
  hideBranding?: boolean;
}

import { detectPlatformFromUrl } from "../utils/platformDetector";

function renderLinkIcon(link: BioLink) {
  const platform = detectPlatformFromUrl(link.url);
  const effectiveType = link.icon && link.icon !== "globe" && link.icon !== "link" ? link.icon : platform.type;

  switch (effectiveType) {
    case "instagram":
      return (
        <svg className="w-5 h-5 text-[#E1306C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg className="w-5 h-5 text-zinc-950 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46 6.27 6.27 0 0 0 1.95-4.46V8.65a8.28 8.28 0 0 0 5.24 1.83V7.03a4.85 4.85 0 0 1-1.42-.34z"/>
        </svg>
      );
    case "youtube":
      return (
        <svg className="w-5 h-5 text-[#FF0000] fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case "whatsapp":
      return (
        <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      );
    case "shopee":
    case "shopping-bag":
      return <ShoppingBag className="w-5 h-5 text-[#EE4D2D]" />;
    case "tokopedia":
      return <ShoppingBag className="w-5 h-5 text-[#03AC0E]" />;
    case "x":
      return (
        <svg className="w-5 h-5 text-zinc-950 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "facebook":
      return (
        <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5 text-[#0A66C2] fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case "telegram":
      return (
        <svg className="w-5 h-5 text-[#229ED9] fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      );
    case "github":
      return (
        <svg className="w-5 h-5 text-zinc-950 fill-current" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      );
    case "spotify":
      return (
        <svg className="w-5 h-5 text-[#1DB954] fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      );
    case "message-circle":
      return <MessageCircle className="w-5 h-5 text-zinc-700" />;
    case "tag":
      return <Tag className="w-5 h-5 text-zinc-700" />;
    default:
      // Favicon fallback untuk domain/website umum
      if (platform.faviconUrl) {
        return (
          <img
            src={platform.faviconUrl}
            alt=""
            className="w-5 h-5 object-contain rounded-xs"
            onError={(e) => {
              // Jika favicon gagal dimuat, fallback ke ikon globe
              e.currentTarget.style.display = "none";
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = "inline-block";
              }
            }}
          />
        );
      }
      return <Globe className="w-5 h-5 text-zinc-700" />;
  }
}

export const BioLinksSection: React.FC<BioLinksSectionProps> = ({
  name,
  avatar,
  bio,
  links = [],
  adminWhatsApp,
  avatarStyle = "square",
  isOwner,
  showOwnerPanel,
  onToggleOwnerPanel,
  onOpenOwnerLogin,
  referralCode,
  hideBranding = false,
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
            className={`w-20 h-20 sm:w-24 sm:h-24 object-cover shadow-md mx-auto transition-all ${
              avatarStyle === "round" ? "rounded-full" : "rounded-none"
            }`}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-zinc-200 flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-900 stroke-[2.5]" />
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
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {renderLinkIcon(link)}
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
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <span className="truncate text-left">Hubungi Langsung via WhatsApp</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
          </a>
        )}
      </div>

      {/* Footer Branding & Owner Access */}
      <footer className="pt-4 pb-1 text-center flex items-center justify-center gap-2 text-[12px] text-zinc-400">
        {!hideBranding ? (
          <a
            href={
              referralCode
                ? `https://obrool.com/?ref=${encodeURIComponent(referralCode)}`
                : "https://chat.obrool.com"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 transition-colors font-medium"
          >
            Ditenagai oleh Obrool
          </a>
        ) : (
          <a
            href="https://chat.obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 transition-colors font-medium"
          >
            chat.obrool.com
          </a>
        )}
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
