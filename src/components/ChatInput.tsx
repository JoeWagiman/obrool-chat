import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  loading: boolean;
  suggestions?: string[] | null;
  themeColor?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading,
  suggestions,
  themeColor = "#0a0a0b",
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSendMessage(text.trim());
    setText("");
  };

  const effectiveSuggestions =
    suggestions && suggestions.length > 0
      ? suggestions
      : [
          "Cek ongkir Jakarta ke Surabaya 1 kg",
          "Berapa ongkir Bandung ke Yogyakarta 2 kg?",
          "Lacak paket JNE 582230008329223",
        ];

  return (
    <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 flex-shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Pills */}
        {effectiveSuggestions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {effectiveSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(s)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-medium whitespace-nowrap transition-colors border border-zinc-200/60 disabled:opacity-50 flex-shrink-0"
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
            className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200/90 rounded-2xl text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 transition-all"
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
      </div>
    </div>
  );
};
