// Sanitasi URL untuk atribut href. Mencegah XSS via skema javascript:/data:/vbscript:
// serta karakter/entitas yang bisa memutus atribut (quote, <, >, backtick) atau
// disuntikkan event handler.
export function safeHref(raw: string): string | null {
  if (!raw) return null;
  if (/["'<>`\s]|&quot;|&#|&lt;|&gt;/i.test(raw)) return null;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("#") || t.startsWith("/")) return t;
  return null;
}
