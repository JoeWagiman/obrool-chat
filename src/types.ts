export interface AgentProfile {
  id: string;
  name: string;
  status: string;
  avatar: string | null;
  widgetColor?: string;
  welcomeMessage?: string;
  suggestedQuestions?: string[] | null;
  adminWhatsApp?: string | null;
  hideBranding?: boolean;
  enableLeadCapture?: boolean;
  leadTitle?: string;
  leadRequirePhone?: boolean;
  leadRequireEmail?: boolean;
  leadTriggerCount?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
