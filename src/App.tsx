import { useState, useEffect, useRef } from "react";
import { fetchAgentProfile, sendChatMessage } from "./services/api";
import { type AgentProfile, type ChatMessage, DEFAULT_AVATAR } from "./types";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
import { LeadModal } from "./components/LeadModal";
import { LandingHandleClaim } from "./components/LandingHandleClaim";
import { BioLinksSection } from "./components/BioLinksSection";
import { OwnerSidebarPanel } from "./components/OwnerSidebarPanel";
import { OwnerLoginModal } from "./components/OwnerLoginModal";
import { Loader2, AlertCircle } from "lucide-react";
import { updateDocumentSEO } from "./utils/seo";

function getIdentifierFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const queryAgent = params.get("agent") || params.get("id") || params.get("h");

  let pathHandle = window.location.pathname.replace(/^\/+/, "");
  if (pathHandle.startsWith("@")) {
    pathHandle = pathHandle.slice(1);
  }

  return queryAgent || pathHandle || null;
}

export default function App() {
  const [activeIdentifier, setActiveIdentifier] = useState<string | null>(getIdentifierFromUrl);

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Owner Authentication & Editing State
  const [ownerToken, setOwnerToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("obrool_owner_token") : null;
  });
  const [ownerUserId, setOwnerUserId] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("obrool_owner_uid") : null;
  });
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const isOwner = Boolean(
    ownerToken &&
    agent?.userId &&
    ownerUserId &&
    ownerUserId === agent.userId
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const sessionIdRef = useRef<string>("sess_" + Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Check SSO token from URL hash (e.g. #sso_token=...&sso_user_id=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const ssoToken = params.get("sso_token") || params.get("token");
    const ssoUid = params.get("sso_user_id") || params.get("uid");

    if (ssoToken) {
      localStorage.setItem("obrool_owner_token", ssoToken);
      setOwnerToken(ssoToken);
      if (ssoUid) {
        localStorage.setItem("obrool_owner_uid", ssoUid);
        setOwnerUserId(ssoUid);
      }
      // Bersihkan hash fragment agar URL tetap bersih tanpa token
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const id = getIdentifierFromUrl();
      setActiveIdentifier(id);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync page SEO metadata, OpenGraph, and Schema.org
  useEffect(() => {
    updateDocumentSEO(agent);
  }, [agent]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Load Agent whenever activeIdentifier changes
  useEffect(() => {
    if (!activeIdentifier) {
      setAgent(null);
      setLoadingProfile(false);
      setProfileError(null);
      setMessages([]);
      return;
    }

    setLoadingProfile(true);
    setProfileError(null);

    fetchAgentProfile(activeIdentifier)
      .then((profile) => {
        setAgent(profile);
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
        setProfileError(err.message || "Gagal memuat profil asisten.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [activeIdentifier]);

  const handleSelectHandle = (handle: string) => {
    const clean = handle.trim().replace(/^@+/, "");
    window.history.pushState({}, "", `/@${clean}`);
    setActiveIdentifier(clean);
  };

  const handleBackToHome = () => {
    window.history.pushState({}, "", "/");
    setActiveIdentifier(null);
    setAgent(null);
    setMessages([]);
  };

  const handleOwnerLoginSuccess = (token: string, uid: string) => {
    setOwnerToken(token);
    setOwnerUserId(uid);
    localStorage.setItem("obrool_owner_token", token);
    localStorage.setItem("obrool_owner_uid", uid);
    setShowOwnerPanel(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!agent || chatLoading) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const nextHistory = [...messagesRef.current, userMsg];
    setMessages(nextHistory);
    messagesRef.current = nextHistory;
    setChatLoading(true);

    try {
      const historyPayload = messagesRef.current.slice(0, -1).slice(-8).map((m) => ({
        role: (m.role === "assistant" ? "agent" : "user") as "agent" | "user",
        content: m.content,
        text: m.content,
      }));

      const reply = await sendChatMessage(agent.id, text, sessionIdRef.current, historyPayload);

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (agent.enableLeadCapture) {
        const userMsgCount = messages.filter((m) => m.role === "user").length + 1;
        const trigger = agent.leadTriggerCount || 3;
        if (userMsgCount === trigger) {
          setTimeout(() => setShowLeadModal(true), 1500);
        }
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "err_" + Date.now(),
        role: "assistant",
        content:
          err instanceof Error
            ? err.message
            : "Maaf, terjadi kendala saat menghubungi server. Silakan coba sesaat lagi.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // 1. Root Landing Page (Klaim & Cari Handle ala lynk.id)
  if (!activeIdentifier) {
    return (
      <LandingHandleClaim
        onSelectHandle={handleSelectHandle}
        isLoggedIn={Boolean(ownerToken)}
      />
    );
  }

  // 2. Loading Profile Screen
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center text-[15px]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-3" />
        <p className="text-[15px] font-semibold text-zinc-600">Menghubungkan ke Profil...</p>
      </div>
    );
  }

  // 3. Error Screen
  if (profileError || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center text-[15px]">
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 max-w-md w-full space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-950">Halaman Tidak Ditemukan</h2>
            <p className="text-[15px] text-zinc-600">
              {profileError || "Pastikan tautan atau nama handle yang Anda tuju sudah benar."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-black text-white rounded-xl text-[15px] font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Cari Handle Lain
            </button>
            <a
              href="https://obrool.com/register"
              className="px-4 py-2 bg-zinc-100 text-zinc-800 rounded-xl text-[15px] font-semibold hover:bg-zinc-200 transition-colors"
            >
              Klaim Handle Ini
            </a>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = agent.avatar || DEFAULT_AVATAR;

  // Background styling: supports custom color (e.g. #f4f4f5), gradient, or image URL
  const bgValue = agent.pageBackground?.trim();
  const isBgImage = Boolean(bgValue && (bgValue.startsWith("http://") || bgValue.startsWith("https://") || bgValue.startsWith("data:image/")));
  const customBgStyle: React.CSSProperties = isBgImage
    ? {
        backgroundImage: `url("${bgValue}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : bgValue
    ? { backgroundColor: bgValue }
    : {};

  return (
    <div
      className="h-dvh flex flex-col bg-[#fbfbfa] text-zinc-900 overflow-hidden transition-colors"
      style={customBgStyle}
    >
      {/* Main Container: Full screen width, split columns on large screen, clean without top navbar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full p-2 sm:p-4 lg:p-5 gap-4">
        {/* Left Column: Bio Links & Brand Info (Desktop) */}
        <aside className="hidden lg:flex lg:w-[380px] xl:w-[440px] 2xl:w-[480px] flex-shrink-0 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-y-auto flex-col p-4 xl:p-6">
          <BioLinksSection
            name={agent.name}
            avatar={agent.avatar}
            bio={agent.bio}
            links={agent.links}
            adminWhatsApp={agent.adminWhatsApp}
            isOwner={isOwner}
            showOwnerPanel={showOwnerPanel}
            onToggleOwnerPanel={() => setShowOwnerPanel(!showOwnerPanel)}
            onOpenOwnerLogin={() => setShowOwnerLogin(true)}
          />
        </aside>

        {/* Center/Main Chat Column */}
        <div className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden h-full min-w-0">
          {/* Scrollable Area containing Bio Links on mobile + Chat History */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* On mobile: BioLinksSection displayed at top */}
            <div className="lg:hidden mb-2">
              <BioLinksSection
                name={agent.name}
                avatar={agent.avatar}
                bio={agent.bio}
                links={agent.links}
                adminWhatsApp={agent.adminWhatsApp}
                isOwner={isOwner}
                showOwnerPanel={showOwnerPanel}
                onToggleOwnerPanel={() => setShowOwnerPanel(!showOwnerPanel)}
                onOpenOwnerLogin={() => setShowOwnerLogin(true)}
              />
            </div>

            {/* AI Chat Header/Indicator */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
                Asisten Chat AI
              </span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-w-5xl mx-auto w-full">
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
                  <div className="px-4 py-3 bg-white border border-zinc-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Chat Input Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            suggestions={agent.suggestedQuestions}
            themeColor={agent.widgetColor}
          />
        </div>

        {/* Side Panel (Kanan luar chat untuk mode pemilik tanpa modal) */}
        {isOwner && showOwnerPanel && ownerToken && (
          <aside className="w-[460px] xl:w-[500px] flex-shrink-0 h-full hidden lg:block animate-in slide-in-from-right duration-200">
            <OwnerSidebarPanel
              agent={agent}
              token={ownerToken}
              onClose={() => setShowOwnerPanel(false)}
              onProfileUpdated={(updated) => setAgent(updated)}
            />
          </aside>
        )}

        {/* Mobile Floating Drawer for Owner Panel on small screens */}
        {isOwner && showOwnerPanel && ownerToken && (
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden flex justify-end">
            <div className="w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right duration-200">
              <OwnerSidebarPanel
                agent={agent}
                token={ownerToken}
                onClose={() => setShowOwnerPanel(false)}
                onProfileUpdated={(updated) => setAgent(updated)}
              />
            </div>
          </div>
        )}

        {/* Lead Capture Modal */}
        {agent.enableLeadCapture && (
          <LeadModal
            agentId={agent.id}
            isOpen={showLeadModal}
            onClose={() => setShowLeadModal(false)}
            title={agent.leadTitle}
            themeColor={agent.widgetColor}
          />
        )}

        {/* Owner Login Modal */}
        <OwnerLoginModal
          isOpen={showOwnerLogin}
          onClose={() => setShowOwnerLogin(false)}
          onSuccess={handleOwnerLoginSuccess}
        />
      </div>
    </div>
  );
}
