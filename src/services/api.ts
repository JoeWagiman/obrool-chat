import type { AgentProfile } from "../types";

const OBROOL_API_URL = import.meta.env.VITE_OBROOL_API_URL || "https://obrool.com";

export async function fetchAgentProfile(identifier: string): Promise<AgentProfile> {
  const clean = identifier.trim().replace(/^@/, "");
  const res = await fetch(`${OBROOL_API_URL}/api/agents/${encodeURIComponent(clean)}/public`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Asisten tidak ditemukan atau sedang tidak aktif.");
  }

  const data = await res.json();
  if (!data.agent) {
    throw new Error("Data profil asisten tidak valid.");
  }

  return data.agent as AgentProfile;
}

export async function sendChatMessage(
  agentId: string,
  message: string,
  sessionId: string,
  history?: Array<{ role: "user" | "assistant" | "agent"; content: string; text?: string }>
): Promise<string> {
  const res = await fetch(`${OBROOL_API_URL}/api/adp/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId,
      message,
      sessionId,
      guestDeviceId: sessionId,
      recentHistory: history,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Gagal menghubungi server asisten.");
  }

  const data = await res.json();
  return data.reply || "Maaf, belum dapat memproses jawaban saat ini.";
}

export async function submitLeadCapture(payload: {
  agentId: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${OBROOL_API_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
