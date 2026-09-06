import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  loading: boolean;
  suggestions?: string[] | null;
  themeColor?: string;
  hasCustomBg?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading,
  suggestions,
  themeColor = "#0a0a0b",
  hasCustomBg = false,
}) => {
  const [text, setText] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setDismissed(true);
    onSendMessage(text.trim());
    setText("");
  };

  const handleSuggestionClick = (s: string) => {
    setDismissed(true);
    onSendMessage(s);
  };

  const effectiveSuggestions =
    suggestions && suggestions.length > 0
      ? suggestions
      : [
          "Bisa ceritakan tentang profil ini?",
          "Apa layanan atau informasi utama di sini?",
          "Bagaimana cara menghubungi atau kerja sama?",
        ];

  return (
    <div
      className={`p-3 sm:p-4 flex-shrink-0 transition-colors ${
        hasCustomBg
          ? "bg-white/80 backdrop-blur-md border-t border-zinc-200/60"
          : "bg-white/95 backdrop-blur-md border-t border-zinc-100"
      }`}
    >
      <div className="w-full max-w-5xl mx-auto space-y-2.5">
        {/* Quick Suggestion Pills - Single row without wrapping, auto-hides once tapped */}
        {!dismissed && effectiveSuggestions.length > 0 && (
          <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar flex-nowrap">
            {effectiveSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                disabled={loading}
                className={`text-[13px] sm:text-[14px] px-3.5 py-1.5 rounded-full font-medium transition-all disabled:opacity-50 text-left whitespace-nowrap flex-shrink-0 ${
                  hasCustomBg
                    ? "bg-white/80 hover:bg-white text-zinc-800 border border-zinc-200/70 shadow-2xs backdrop-blur-xs"
                    : "bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik pesan Anda di sini..."
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-2xl text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-all ${
              hasCustomBg
                ? "bg-white/80 backdrop-blur-xs border border-zinc-200/80 focus:bg-white focus:border-zinc-900 shadow-2xs"
                : "bg-zinc-50 border border-zinc-200/90 focus:bg-white focus:border-zinc-900"
            }`}
          />

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-11 h-11 rounded-2xl text-white flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0 shadow-sm hover:opacity-90 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {/* Legal Disclaimer & Links */}
        <p className="mt-1.5 text-center text-[11px] leading-relaxed text-zinc-400 select-none px-2">
          <span>Dengan mengobrol, Anda menyetujui </span>
          <a
            href="https://obrool.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-zinc-600 transition-colors whitespace-nowrap"
          >
            Syarat Ketentuan
          </a>
          <span> & </span>
          <a
            href="https://obrool.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-zinc-600 transition-colors whitespace-nowrap"
          >
            Kebijakan Privasi
          </a>
        </p>
      </div>
    </div>
  );
};
