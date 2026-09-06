import { useState, useEffect, useRef, useCallback } from "react";
import { sendChatMessage } from "../services/api";
import { type AgentProfile, type ChatMessage } from "../types";

export function useChatConversation(agent: AgentProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isTypingReply, setIsTypingReply] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [sessionId] = useState<string>(() => "sess_" + Math.random().toString(36).substring(2, 12));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const typingTimerRef = useRef<any>(null);
  const activeBotMsgIdRef = useRef<string | null>(null);
  const fullReplyRef = useRef<string>("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  // Set welcome message when agent loads
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
  }, [agent?.id, agent?.welcomeMessage]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Finalize ongoing typing immediately if user resets or sends a new message
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

  const handleSendMessage = useCallback(async (text: string) => {
    if (!agent || chatLoading || isTypingReply) return;

    finalizeCurrentTyping();

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

      const reply = await sendChatMessage(agent.id, text, sessionId, historyPayload);

      // Stop thinking spinner and transition seamlessly to typewriter streaming
      setChatLoading(false);
      setIsTypingReply(true);

      const botId = "b_" + Date.now();
      activeBotMsgIdRef.current = botId;
      fullReplyRef.current = reply;

      // Pacing calculation: bounded between 350ms (short) and 1600ms (long)
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

      if (currentIdx >= reply.length) {
        setIsTypingReply(false);
        activeBotMsgIdRef.current = null;
        fullReplyRef.current = "";
        if (agent.enableLeadCapture) {
          const userMsgCount = messagesRef.current.filter((m) => m.role === "user").length;
          const trigger = agent.leadTriggerCount || 3;
          if (userMsgCount === trigger) {
            setTimeout(() => setShowLeadModal(true), 1200);
          }
        }
      } else {
        const timer = setInterval(() => {
          currentIdx += charsPerStep;
          if (currentIdx >= reply.length) {
            clearInterval(timer);
            typingTimerRef.current = null;
            activeBotMsgIdRef.current = null;
            fullReplyRef.current = "";
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, content: reply, isTyping: false } : m))
            );
            setIsTypingReply(false);

            if (agent.enableLeadCapture) {
              const userMsgCount = messagesRef.current.filter((m) => m.role === "user").length;
              const trigger = agent.leadTriggerCount || 3;
              if (userMsgCount === trigger) {
                setTimeout(() => setShowLeadModal(true), 1200);
              }
            }
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
  }, [agent, chatLoading, isTypingReply, sessionId, finalizeCurrentTyping]);

  const resetMessages = useCallback(() => {
    finalizeCurrentTyping();
    setMessages([]);
  }, [finalizeCurrentTyping]);

  return {
    messages,
    chatLoading,
    isTypingReply,
    showLeadModal,
    setShowLeadModal,
    messagesEndRef,
    handleSendMessage,
    resetMessages,
  };
}
