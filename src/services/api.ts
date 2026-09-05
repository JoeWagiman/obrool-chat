import type { AgentProfile } from "../types";

export const OBROOL_API_URL =
  import.meta.env.VITE_OBROOL_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3000"
    : "https://obrool.com");

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

export interface HandleCheckResult {
  valid: boolean;
  available?: boolean;
  handle?: string;
  reason?: string;
  error?: string;
  agent?: {
    id: string;
    name: string;
    avatar: string | null;
    handle: string;
  };
}

const RESERVED_HANDLES = new Set([
  "admin", "api", "auth", "dashboard", "play", "playground", "chat",
  "login", "register", "obrool", "help", "support", "docs", "pricing",
  "terms", "privacy", "contact", "about", "bot", "ai", "status"
]);

export async function checkHandleAvailability(handle: string): Promise<HandleCheckResult> {
  const clean = handle.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_-]/g, "");

  if (!clean || clean.length < 3 || clean.length > 32) {
    return {
      valid: false,
      available: false,
      error: "Handle harus terdiri dari 3 hingga 32 karakter."
    };
  }

  if (RESERVED_HANDLES.has(clean)) {
    return {
      valid: true,
      available: false,
      reason: "reserved",
      error: "Handle ini dicadangkan untuk sistem Obrool."
    };
  }

  try {
    const res = await fetch(`${OBROOL_API_URL}/api/agents/${encodeURIComponent(clean)}/public`, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data.agent) {
        return {
          valid: true,
          available: false,
          agent: {
            id: data.agent.id,
            name: data.agent.name,
            avatar: data.agent.avatar || null,
            handle: data.agent.handle || clean,
          }
        };
      }
    }

    if (res.status === 404) {
      return {
        valid: true,
        available: true,
        handle: clean
      };
    }

    return {
      valid: true,
      available: true,
      handle: clean
    };
  } catch {
    return {
      valid: false,
      error: "Gagal terhubung ke server asisten."
    };
  }
}

export async function loginOwner(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  const res = await fetch(`${OBROOL_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal masuk. Periksa email dan password.");
  }

  return data;
}

export async function updateAgentProfile(
  agentId: string,
  token: string,
  payload: {
    avatar?: string;
    bio?: string;
    links?: Array<{ id: string; title: string; url: string; icon?: string }>;
    welcomeMessage?: string;
    adminWhatsApp?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImage?: string;
    pageBackground?: string;
  }
): Promise<AgentProfile> {
  const res = await fetch(`${OBROOL_API_URL}/api/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal memperbarui profil.");
  }

  return data.agent as AgentProfile;
}

export async function addQuickKnowledge(
  agentId: string,
  token: string,
  title: string,
  text: string
): Promise<{ message: string }> {
  const res = await fetch(`${OBROOL_API_URL}/api/agents/${agentId}/knowledge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: "text",
      title: title.trim() || "Panduan / Informasi",
      text: text.trim(),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan pengetahuan.");
  }

  return data;
}

export async function generateAgentSeo(
  agentId: string,
  token: string
): Promise<{ seoTitle: string; seoDescription: string; seoKeywords: string }> {
  const res = await fetch(`${OBROOL_API_URL}/api/agents/${agentId}/seo/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal membuat SEO dengan AI.");
  }

  return {
    seoTitle: data.seoTitle || "",
    seoDescription: data.seoDescription || "",
    seoKeywords: data.seoKeywords || "",
  };
}
