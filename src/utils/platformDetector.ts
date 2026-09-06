// Helper utility to detect platforms from URLs and resolve clean icons / favicons

export interface DetectedPlatform {
  name: string;
  type: string;
  faviconUrl?: string;
  isCustomFavicon?: boolean;
}

export function detectPlatformFromUrl(rawUrl: string): DetectedPlatform {
  const trimmed = rawUrl.trim().toLowerCase();
  let domain = "";

  try {
    const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    domain = urlObj.hostname.replace(/^www\./, "");
  } catch {
    domain = trimmed;
  }

  // 1. Instagram
  if (domain.includes("instagram.com") || domain.includes("instagr.am") || domain === "ig.me") {
    return { name: "Instagram", type: "instagram" };
  }

  // 2. TikTok
  if (domain.includes("tiktok.com")) {
    return { name: "TikTok", type: "tiktok" };
  }

  // 3. YouTube
  if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
    return { name: "YouTube", type: "youtube" };
  }

  // 4. WhatsApp
  if (domain.includes("wa.me") || domain.includes("whatsapp.com")) {
    return { name: "WhatsApp", type: "whatsapp" };
  }

  // 5. Shopee
  if (domain.includes("shopee.co.id") || domain.includes("shopee.com") || domain.includes("shope.ee")) {
    return { name: "Shopee", type: "shopee" };
  }

  // 6. Tokopedia
  if (domain.includes("tokopedia.com") || domain.includes("tokopedia.link")) {
    return { name: "Tokopedia", type: "tokopedia" };
  }

  // 7. X / Twitter
  if (domain.includes("twitter.com") || domain === "x.com") {
    return { name: "X (Twitter)", type: "x" };
  }

  // 8. Facebook
  if (domain.includes("facebook.com") || domain.includes("fb.com") || domain.includes("fb.me")) {
    return { name: "Facebook", type: "facebook" };
  }

  // 9. LinkedIn
  if (domain.includes("linkedin.com")) {
    return { name: "LinkedIn", type: "linkedin" };
  }

  // 10. Telegram
  if (domain.includes("telegram.me") || domain === "t.me" || domain.includes("telegram.org")) {
    return { name: "Telegram", type: "telegram" };
  }

  // 11. GitHub
  if (domain.includes("github.com")) {
    return { name: "GitHub", type: "github" };
  }

  // 12. Spotify
  if (domain.includes("spotify.com")) {
    return { name: "Spotify", type: "spotify" };
  }

  // 13. Marketplace / Toko Umum Lain (Lazada, Bukalapak, Blibli)
  if (domain.includes("lazada.co.id") || domain.includes("lazada.com")) {
    return { name: "Lazada", type: "lazada" };
  }
  if (domain.includes("bukalapak.com")) {
    return { name: "Bukalapak", type: "bukalapak" };
  }
  if (domain.includes("blibli.com")) {
    return { name: "Blibli", type: "blibli" };
  }

  // 14. Website / Domain umum: Ambil favicon via Google S2 Favicon service
  if (domain && domain.includes(".")) {
    return {
      name: domain,
      type: "website",
      faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
      isCustomFavicon: true,
    };
  }

  return { name: "Website", type: "globe" };
}
