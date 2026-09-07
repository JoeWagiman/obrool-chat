export interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export type EntityType =
  | "personal"
  | "creator"
  | "professional"
  | "business"
  | "shop"
  | "institution"
  | "community";

export interface AgentProfile {
  id: string;
  userId?: string;
  referralCode?: string | null;
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
  leadIntentKeywords?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImage?: string | null;
  pageBackground?: string | null;
  avatarStyle?: "round" | "square" | null;
  lastDecoratedAt?: string | null;
  entityType?: EntityType | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isTyping?: boolean;
}

export const DEFAULT_AVATAR = "/mark.svg";

