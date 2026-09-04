import { safeHref } from "./url-sanitize";

/**
 * High-performance Markdown-to-HTML parser for AI chat messages.
 * Supports:
 * - GFM Tables (| Header | Header | with alignment)
 * - Fenced Code Blocks (```lang ... ```)
 * - Horizontal Rules (---, ***, ___)
 * - Headings (# H1, ## H2, ### H3)
 * - Blockquotes (> Quote)
 * - Bold (**text**), Italic (*text*), Strikethrough (~~text~~)
 * - Inline Code (`code`)
 * - Markdown Links ([text](url)) & Auto-detected URLs
 * - Bullet Lists (- item) & Numbered Lists (1. item)
 * - Clean Paragraphs and Line Breaks
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] || ch);
}

function buildLink(text: string, url: string, relative: boolean): string {
  const safe = safeHref(url);
  if (!safe) return text; // URL tidak aman → render sebagai teks (sudah escaped)
  const cls = "text-blue-600 underline font-medium hover:text-blue-700 break-all";
  if (relative) {
    return `<a href="${safe}" target="_top" class="${cls}">${text}</a>`;
  }
  return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="${cls}">${text}</a>`;
}

function parseInlineMarkdown(text: string): string {
  let res = text;
  // Convert escaped <br> or raw <br> to actual HTML <br>
  res = res.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  res = res.replace(/<br\s*\/?>/gi, "<br>");
  // Bold
  res = res.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#09090b]">$1</strong>');
  // Italic
  res = res.replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');
  // Strikethrough
  res = res.replace(/~~(.+?)~~/g, '<del class="text-[#a1a1aa]">$1</del>');
  // Inline Code
  res = res.replace(/`([^`]+?)`/g, '<code class="bg-[#f4f4f5] px-1.5 py-0.5 rounded text-[0.75rem] font-mono text-[#09090b] border border-[#e4e4e7]">$1</code>');
  // Links (Absolute)
  res = res.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    (_m, text: string, url: string) => buildLink(text, url, false)
  );
  // Links (Relative/Root-relative/Anchors with target="_top")
  res = res.replace(
    /\[([^\]]+)\]\(([^h/][^)]*|#[^)]*|\/[^)]*)\)/g,
    (_m, text: string, url: string) => buildLink(text, url, true)
  );
  return res;
}

function parseTables(src: string): string {
  const lines = src.split("\n");
  const result: string[] = [];
  let inTable = false;
  let tableLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = /^\|.*\|$/.test(line.trim());

    if (isTableRow) {
      if (!inTable) {
        // Look ahead to see if the next line is a separator row e.g. |---|---|
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : "";
        const isNextSep = /^\|?[ \t]*(:?-+:?)[ \t]*(\|[ \t]*(:?-+:?)[ \t]*)+\|?$/.test(nextLine);
        if (isNextSep) {
          inTable = true;
          tableLines = [line.trim()];
        } else {
          result.push(line);
        }
      } else {
        tableLines.push(line.trim());
      }
    } else {
      if (inTable) {
        result.push(renderTableBlock(tableLines));
        inTable = false;
        tableLines = [];
      }
      result.push(line);
    }
  }

  if (inTable && tableLines.length > 0) {
    result.push(renderTableBlock(tableLines));
  }

  return result.join("\n");
}

function renderTableBlock(lines: string[]): string {
  if (lines.length < 2) return lines.join("\n");

  const sepLine = lines[1];
  const alignments = sepLine
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((col) => {
      const c = col.trim();
      if (c.startsWith(":") && c.endsWith(":")) return "text-center";
      if (c.endsWith(":")) return "text-right";
      return "text-left";
    });

  const headerCols = lines[0]
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

  let html = '<div class="my-3 overflow-x-auto rounded-xl border border-[#e4e4e7] bg-white shadow-sm">';
  html += '<table class="w-full text-left border-collapse text-[0.75rem] sm:text-[0.8125rem]">';
  html += '<thead class="bg-[#f4f4f5] border-b border-[#e4e4e7] text-[#09090b]">';
  html += '<tr>';
  headerCols.forEach((col, idx) => {
    const align = alignments[idx] || "text-left";
    const val = parseInlineMarkdown(col);
    html += `<th class="px-3.5 py-2.5 ${align} font-semibold">${val}</th>`;
  });
  html += '</tr></thead>';
  html += '<tbody class="divide-y divide-[#f0f0f0]">';

  for (let i = 2; i < lines.length; i++) {
    const rowCols = lines[i]
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

    const bgClass = i % 2 === 0 ? "bg-white" : "bg-[#fafafa]/80";
    html += `<tr class="${bgClass} hover:bg-[#f4f4f5]/60 transition-colors">`;
    headerCols.forEach((_, idx) => {
      const align = alignments[idx] || "text-left";
      const rawVal = rowCols[idx] !== undefined ? rowCols[idx] : "";
      const val = parseInlineMarkdown(rawVal);
      html += `<td class="px-3.5 py-2.5 text-[#3f3f46] ${align} leading-relaxed">${val}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  return html;
}

export function renderMarkdown(text: string): string {
  if (!text) return "";

  // 1. Normalize line endings
  let src = text.replace(/\r\n/g, "\n");

  // 2. Fenced Code Blocks (extract early before HTML escaping)
  const codeBlocks: string[] = [];
  src = src.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const escapedCode = escapeHtml(code.trim());
    codeBlocks.push(
      `<pre class="bg-[#18181b] text-[#f4f4f5] p-3.5 rounded-xl text-[0.75rem] font-mono overflow-x-auto my-2.5 leading-relaxed"><code>${escapedCode}</code></pre>`
    );
    return placeholder;
  });

  // 3. Escape raw HTML entities
  src = escapeHtml(src);

  // 4. Parse Tables
  src = parseTables(src);

  // 5. Horizontal rules (---, ***, ___)
  src = src.replace(/^[ \t]*([-*_]){3,}[ \t]*$/gm, '<hr class="my-3 border-t border-[#e4e4e7]" />');

  // 6. Headings
  src = src.replace(/^### (.*$)/gim, '<h4 class="font-bold text-[0.875rem] text-[#09090b] mt-3 mb-1">$1</h4>');
  src = src.replace(/^## (.*$)/gim, '<h3 class="font-bold text-[0.9375rem] text-[#09090b] mt-3 mb-1.5">$1</h3>');
  src = src.replace(/^# (.*$)/gim, '<h2 class="font-bold text-[1rem] text-[#09090b] mt-4 mb-2">$1</h2>');

  // 7. Blockquotes
  src = src.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#09090b] pl-3 my-2 text-[#52525b] italic">$1</blockquote>');

  // 8. Bold, Strike, Italic
  src = src.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#09090b]">$1</strong>');
  src = src.replace(/~~(.+?)~~/g, '<del class="text-[#a1a1aa]">$1</del>');
  src = src.replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');

  // 9. Inline code
  src = src.replace(/`([^`]+?)`/g, '<code class="bg-[#f4f4f5] px-1.5 py-0.5 rounded text-[0.75rem] font-mono text-[#09090b] border border-[#e4e4e7]">$1</code>');

  // 10. Links: [text](url) (Absolute)
  src = src.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    (_m, text: string, url: string) => buildLink(text, url, false)
  );

  // 10.5 Links: [text](url) (Relative/Root-relative/Anchors with target="_top")
  src = src.replace(
    /\[([^\]]+)\]\(([^h/][^)]*|#[^)]*|\/[^)]*)\)/g,
    (_m, text: string, url: string) => buildLink(text, url, true)
  );

  // 11. Raw URLs
  src = src.replace(
    /(?<!href=")(https?:\/\/[^\s<]+)/g,
    (m: string) => {
      const safe = safeHref(m);
      if (!safe) return m;
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-700 break-all">${safe}</a>`;
    }
  );

  // 12. Bullet & Numbered lists
  src = src.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  src = src.replace(/((?:<li class="ml-4 list-disc">.*?<\/li>\n?)+)/g, '<ul class="my-1.5 space-y-0.5">$1</ul>');

  src = src.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  src = src.replace(/((?:<li class="ml-4 list-decimal">.*?<\/li>\n?)+)/g, '<ol class="my-1.5 space-y-0.5">$1</ol>');

  // 13. Clean line breaks outside of blocks
  const parts = src.split(/(<(?:div|table|ul|ol|pre|blockquote|hr|h2|h3|h4)[\s\S]*?<\/(?:div|table|ul|ol|pre|blockquote|h2|h3|h4)>|<hr[^>]*>|__CODE_BLOCK_\d+__)/g);

  src = parts
    .map((part) => {
      if (
        part.startsWith("<div") ||
        part.startsWith("<table") ||
        part.startsWith("<ul") ||
        part.startsWith("<ol") ||
        part.startsWith("<pre") ||
        part.startsWith("<blockquote") ||
        part.startsWith("<hr") ||
        part.startsWith("<h2") ||
        part.startsWith("<h3") ||
        part.startsWith("<h4") ||
        part.startsWith("__CODE_BLOCK_")
      ) {
        return part;
      }
      return part
        .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
        .replace(/\n\n+/g, "<br><br>")
        .replace(/\n/g, "<br>");
    })
    .join("");

  // 14. Restore code blocks
  codeBlocks.forEach((codeHtml, idx) => {
    src = src.replace(`__CODE_BLOCK_${idx}__`, codeHtml);
  });

  return src.trim();
}
