import { useState, useEffect, useRef, useCallback } from "react";
import { sendChatMessage } from "../services/api";
import { type AgentProfile, type ChatMessage } from "../types";

// Kata kunci high-intent default — memicu lead modal langsung setelah agent reply
const DEFAULT_INTENT_KEYWORDS = [
  "harga", "berapa", "beli", "order", "pesan", "hubungi", "kontak",
  "whatsapp", "wa", "telepon", "daftar", "booking", "minta",
  "coba gratis", "paket", "promo", "diskon", "harga nya", "biaya",
];

function hasHighIntent(text: string, extraKeywords?: string[]): boolean {
  const lower = text.toLowerCase();
  const keywords = [...DEFAULT_INTENT_KEYWORDS, ...(extraKeywords ?? [])];
  return keywords.some((k) => lower.includes(k));
}

// Hapus flag [LEAD_CAPTURE] dari balasan agent sebelum ditampilkan
const LEAD_FLAG = "[LEAD_CAPTURE]";
function stripLeadFlag(text: string): { clean: string; flagged: boolean } {
  if (text.includes(LEAD_FLAG)) {
    return { clean: text.replace(LEAD_FLAG, "").trim(), flagged: true };
  }
  return { clean: text, flagged: false };
}

// Generate atau ambil visitorId persisten dari localStorage
function getOrCreateVisitorId(): string {
  try {
    const stored = localStorage.getItem("obrool_vid");
    if (stored) return stored;
    const id = "v_" + Math.random().toString(36).substring(2, 14);
    localStorage.setItem("obrool_vid", id);
    return id;
  } catch {
    // localStorage tidak tersedia (iframe sandboxed, dll)
    return "v_" + Math.random().toString(36).substring(2, 14);
  }
}

export function useChatConversation(agent: AgentProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isTypingReply, setIsTypingReply] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // sessionId: per-tab, tidak persisten
  const [sessionId] = useState<string>(() => "sess_" + Math.random().toString(36).substring(2, 12));

  // visitorId: persisten di localStorage, sama selama browser tidak clear storage
  const [visitorId] = useState<string>(getOrCreateVisitorId);

  // Ref untuk melacak apakah lead modal sudah pernah ditampilkan di sesi ini
  const leadShownRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeBotMsgIdRef = useRef<string | null>(null);
  const fullReplyRef = useRef<string>("");

  // Ref untuk intent keyword dari pesan terakhir user (dibaca setelah reply selesai)
  const pendingIntentRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (agent?.welcomeMessage) {
      setMessages([
        {
          id: "welcome_" + Date.now(),
          role: "assistant",
          content: agent.welcomeMessage,
          createdAt: Date.now(),
        },
      ]);
    } else {
      setMessages([]);
    }
    leadShownRef.current = false;
  }, [agent?.id, agent?.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const triggerLeadModal = useCallback(() => {
    if (!leadShownRef.current) {
      leadShownRef.current = true;
      setTimeout(() => setShowLeadModal(true), 1200);
    }
  }, []);

  const finalizeCurrentTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (activeBotMsgIdRef.current && fullReplyRef.current) {
      const botId = activeBotMsgIdRef.current;
      const fullText = fullReplyRef.current;
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, content: fullText, isTyping: false } : m))
      );
      activeBotMsgIdRef.current = null;
      fullReplyRef.current = "";
    }
    setIsTypingReply(false);
  }, []);

  // Dipanggil setelah reply selesai di-render — cek semua trigger lead
  const checkLeadTriggers = useCallback(
    (flaggedByAgent: boolean) => {
      if (!agent?.enableLeadCapture || leadShownRef.current) return;

      // Trigger 1: agent mengirim flag [LEAD_CAPTURE]
      if (flaggedByAgent) {
        triggerLeadModal();
        return;
      }

      // Trigger 2: pesan user mengandung kata kunci high-intent
      if (pendingIntentRef.current) {
        pendingIntentRef.current = false;
        triggerLeadModal();
        return;
      }

      // Trigger 3: fallback hitungan pesan (default 5, bukan 3)
      const userMsgCount = messagesRef.current.filter((m) => m.role === "user").length;
      const trigger = agent.leadTriggerCount || 5;
      if (userMsgCount >= trigger) {
        triggerLeadModal();
      }
    },
    [agent, triggerLeadModal]
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!agent || chatLoading || isTypingReply) return;

      finalizeCurrentTyping();

      // Cek intent keyword sebelum kirim — flag akan dibaca setelah reply selesai
      if (agent.enableLeadCapture && !leadShownRef.current) {
        pendingIntentRef.current = hasHighIntent(text, agent.leadIntentKeywords);
      }

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
        const historyPayload = messagesRef.current
          .slice(0, -1)
          .slice(-8)
          .map((m) => ({
            role: (m.role === "assistant" ? "agent" : "user") as "agent" | "user",
            content: m.content,
            text: m.content,
          }));

        const rawReply = await sendChatMessage(agent.id, text, sessionId, visitorId, historyPayload);
        const { clean: reply, flagged } = stripLeadFlag(rawReply);

        setChatLoading(false);
        setIsTypingReply(true);

        const botId = "b_" + Date.now();
        activeBotMsgIdRef.current = botId;
        fullReplyRef.current = reply;

        const targetDuration = Math.min(1600, Math.max(350, reply.length * 3));
        const intervalMs = 25;
        const totalSteps = Math.max(1, Math.round(targetDuration / intervalMs));
        const charsPerStep = Math.max(1, Math.ceil(reply.length / totalSteps));

        let currentIdx = Math.min(reply.length, charsPerStep);

        const botMsg: ChatMessage = {
          id: botId,
          role: "assistant",
          content: reply.slice(0, currentIdx),
          createdAt: Date.now(),
          isTyping: currentIdx < reply.length,
        };

        setMessages((prev) => [...prev, botMsg]);

        const onTypingDone = () => {
          setIsTypingReply(false);
          activeBotMsgIdRef.current = null;
          fullReplyRef.current = "";
          checkLeadTriggers(flagged);
        };

        if (currentIdx >= reply.length) {
          onTypingDone();
        } else {
          const timer = setInterval(() => {
            currentIdx += charsPerStep;
            if (currentIdx >= reply.length) {
              clearInterval(timer);
              typingTimerRef.current = null;
              setMessages((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: reply, isTyping: false } : m))
              );
              onTypingDone();
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId
                    ? { ...m, content: reply.slice(0, currentIdx), isTyping: true }
                    : m
                )
              );
            }
          }, intervalMs);

          typingTimerRef.current = timer;
        }
      } catch (err) {
        setChatLoading(false);
        setIsTypingReply(false);
        activeBotMsgIdRef.current = null;
        fullReplyRef.current = "";

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
      }
    },
    [agent, chatLoading, isTypingReply, sessionId, visitorId, finalizeCurrentTyping, checkLeadTriggers]
  );

  const resetMessages = useCallback(() => {
    finalizeCurrentTyping();
    leadShownRef.current = false;
    setMessages([]);
  }, [finalizeCurrentTyping]);

  return {
    messages,
    chatLoading,
    isTypingReply,
    showLeadModal,
    setShowLeadModal,
    sessionId,
    visitorId,
    messagesEndRef,
    handleSendMessage,
    resetMessages,
  };
}
