export interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface AgentProfile {
  id: string;
  userId?: string;
  name: string;
  status: string;
  handle?: string;
  avatar: string | null;
  bio?: string | null;
  links?: BioLink[];
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
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImage?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
