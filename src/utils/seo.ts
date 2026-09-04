import type { AgentProfile } from "../types";

function setMetaTag(attributeName: "name" | "property", attributeValue: string, content: string) {
  if (typeof document === "undefined") return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url: string) {
  if (typeof document === "undefined") return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setJsonLd(id: string, data: object) {
  if (typeof document === "undefined") return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function updateDocumentSEO(agent: AgentProfile | null) {
  if (typeof document === "undefined") return;

  if (agent) {
    const title = agent.seoTitle?.trim() || `${agent.name} - Obrool Bio & Chat AI`;
    const description =
      agent.seoDescription?.trim() ||
      agent.bio?.trim() ||
      `Hubungi asisten resmi ${agent.name} di Obrool. Layanan pelanggan interaktif dan info produk 24 jam.`;
    const keywords =
      agent.seoKeywords?.trim() ||
      `${agent.name.toLowerCase()}, bio link, toko online, asisten ai, chatbot whatsapp, obrool`;
    const image = agent.ogImage || agent.avatar || "https://chat.obrool.com/apple-touch-icon.png";
    const currentHandle = agent.handle || agent.id;
    const pageUrl = `https://chat.obrool.com/@${currentHandle}`;

    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);

    // OpenGraph
    setMetaTag("property", "og:type", "profile");
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:url", pageUrl);

    // Twitter
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);

    setCanonical(pageUrl);

    // Rich Schema.org (Store / LocalBusiness)
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": agent.name,
      "description": description,
      "image": image,
      "url": pageUrl,
      ...(agent.adminWhatsApp ? { "telephone": agent.adminWhatsApp } : {}),
      ...(agent.links && agent.links.length > 0
        ? { "sameAs": agent.links.map((l) => l.url).filter(Boolean) }
        : {}),
    };
    setJsonLd("obrool-store-schema", schemaData);
  } else {
    // Landing Page Default
    const defaultTitle = "Obrool - Satu Tautan Bio & Asisten AI untuk Bisnis Anda";
    const defaultDesc =
      "Kumpulkan tautan media sosial, toko online, produk afiliasi, dan asisten chatbot AI interaktif yang siap melayani pelanggan 24 jam nonstop.";
    const defaultKw = "obrool, bio link, tautan bio, asisten ai, chatbot bisnis, toko online, bot whatsapp";
    const defaultUrl = "https://chat.obrool.com";
    const defaultImg = "https://chat.obrool.com/apple-touch-icon.png";

    document.title = defaultTitle;
    setMetaTag("name", "description", defaultDesc);
    setMetaTag("name", "keywords", defaultKw);

    // OpenGraph
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:title", defaultTitle);
    setMetaTag("property", "og:description", defaultDesc);
    setMetaTag("property", "og:image", defaultImg);
    setMetaTag("property", "og:url", defaultUrl);

    // Twitter
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", defaultTitle);
    setMetaTag("name", "twitter:description", defaultDesc);
    setMetaTag("name", "twitter:image", defaultImg);

    setCanonical(defaultUrl);

    // Landing WebSite Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Obrool",
      "url": defaultUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://chat.obrool.com/@{search_term_string}",
        "query-input": "required name=search_term_string",
      },
    };
    setJsonLd("obrool-store-schema", websiteSchema);
  }
}
