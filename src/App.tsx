import { useState, useEffect, useRef } from "react";
import { fetchAgentProfile, sendChatMessage } from "./services/api";
import type { AgentProfile, ChatMessage } from "./types";
import { ChatHeader } from "./components/ChatHeader";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
import { LeadModal } from "./components/LeadModal";
import { Loader2, AlertCircle } from "lucide-react";

export default function App() {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const sessionIdRef = useRef<string>("sess_" + Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Load Agent on Mount based on URL handle or query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryAgent = params.get("agent") || params.get("id") || params.get("h");

    let pathHandle = window.location.pathname.replace(/^\/+/, "");
    if (pathHandle.startsWith("@")) {
      pathHandle = pathHandle.slice(1);
    }

    // Determine target identifier
    const identifier = queryAgent || pathHandle || "cmtloaz4p0001ob70a96jvol3";

    setLoadingProfile(true);
    fetchAgentProfile(identifier)
      .then((profile) => {
        setAgent(profile);
        if (profile.name) {
          document.title = `${profile.name} — Obrool Chat`;
        }
        // Set welcome message
        if (profile.welcomeMessage) {
          setMessages([
            {
              id: "welcome_" + Date.now(),
              role: "assistant",
              content: profile.welcomeMessage,
              createdAt: Date.now(),
            },
          ]);
        }
      })
      .catch((err) => {
        setProfileError(err.message || "Gagal memuat asisten.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!agent || chatLoading) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      // Send message with short recent history for context
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(agent.id, text, sessionIdRef.current, historyPayload);

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Check Lead Capture trigger
      if (agent.enableLeadCapture) {
        const userMsgCount = messages.filter((m) => m.role === "user").length + 1;
        const trigger = agent.leadTriggerCount || 2;
        if (userMsgCount >= trigger && !showLeadModal) {
          setTimeout(() => {
            setShowLeadModal(true);
          }, 1500);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Terjadi kesalahan saat memproses jawaban.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Loading Screen
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-3" />
        <p className="text-sm font-semibold text-zinc-600">Menghubungkan ke Asisten Toko...</p>
      </div>
    );
  }

  // Error Screen
  if (profileError || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-md w-full space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-base font-bold text-zinc-950">Asisten Tidak Ditemukan</h2>
          <p className="text-xs text-zinc-600">
            {profileError || "Pastikan tautan atau handle toko yang Anda masukkan sudah benar."}
          </p>
          <a
            href="https://obrool.com"
            className="inline-block px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Buka Obrool.com
          </a>
        </div>
      </div>
    );
  }

  const avatarUrl =
    agent.avatar ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

  return (
    <div className="h-dvh flex flex-col bg-[#fbfbfa] text-zinc-900 overflow-hidden">
      {/* Container - Centered max-w-4xl on Desktop, Full Width on Mobile */}
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-white border-x border-zinc-200/70 shadow-sm relative">
        <ChatHeader agent={agent} />

        {/* Message Stream */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              agentAvatar={avatarUrl}
              agentName={agent.name}
              themeColor={agent.widgetColor}
            />
          ))}

          {/* Typing Indicator */}
          {chatLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <img
                src={avatarUrl}
                alt={agent.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-200 flex-shrink-0 mt-1 shadow-2xs"
              />
              <div className="px-4 py-3 bg-white border border-zinc-200/90 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <ChatInput
          onSendMessage={handleSendMessage}
          loading={chatLoading}
          suggestions={agent.suggestedQuestions}
          themeColor={agent.widgetColor}
        />

        {agent.enableLeadCapture && (
          <LeadModal
            agentId={agent.id}
            isOpen={showLeadModal}
            onClose={() => setShowLeadModal(false)}
            title={agent.leadTitle}
            themeColor={agent.widgetColor}
          />
        )}
      </div>
    </div>
  );
}
