export function readableMarkdownText(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script, style, svg, noscript, [aria-hidden='true']").forEach((element) => element.remove());
  document.querySelectorAll("p, li, pre, blockquote, h1, h2, h3, h4, h5, h6, br, tr").forEach((element) => element.append("\n"));
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

const MAX_UTTERANCE_LENGTH = 1000;

export function splitNarrationText(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > MAX_UTTERANCE_LENGTH) {
    const space = remaining.lastIndexOf(" ", MAX_UTTERANCE_LENGTH);
    const boundary = space > 0 ? space : MAX_UTTERANCE_LENGTH;
    chunks.push(remaining.slice(0, boundary));
    remaining = remaining.slice(boundary).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
