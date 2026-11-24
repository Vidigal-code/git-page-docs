import { afterEach, expect, it, vi } from "vitest";
import { loadSourceFile } from "@/entities/source-viewer/api/github-source";

afterEach(() => { vi.unstubAllGlobals(); });

it("reads a UTF-16LE repository file without corrupting its text", async () => {
  const bytes = Uint8Array.from([0xff, 0xfe, 0x6e, 0, 0x6f, 0, 0x64, 0, 0x65, 0, 0x5f, 0, 0x6d, 0, 0x6f, 0, 0x64, 0, 0x75, 0, 0x6c, 0, 0x65, 0, 0x73, 0, 0x2f, 0, 0x0a, 0]);
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(bytes)));

  await expect(loadSourceFile({ owner: "reader", repo: "handbook", branch: "main", path: ".gitignore" })).resolves.toEqual({
    path: ".gitignore",
    content: "node_modules/\n",
  });
});
it("reads UTF-16BE accents and supplementary Unicode without byte-order corruption", async () => {
  const bytes = Uint8Array.from([0xfe, 0xff, 0, 0x61, 0, 0xe7, 0, 0xe3, 0, 0x6f, 0, 0x20, 0xd8, 0x3d, 0xde, 0x80, 0, 0x0d, 0, 0x0a]);
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(bytes)));

  expect((await loadSourceFile({ owner: "reader", repo: "handbook", branch: "main", path: "unicode.txt" })).content).toBe("ação 🚀\r\n");
});

it.each([
  { name: "UTF-8 Unicode", bytes: new TextEncoder().encode("ação 中文 🚀\n"), text: "ação 中文 🚀\n" },
  { name: "UTF-8 BOM", bytes: new TextEncoder().encode("\uFEFFação 🚀\r\n"), text: "ação 🚀\r\n" },
  { name: "UTF-16LE Unicode", bytes: Uint8Array.from([0xff, 0xfe, 0x61, 0, 0xe7, 0, 0xe3, 0, 0x6f, 0, 0x20, 0, 0x3d, 0xd8, 0x80, 0xde]), text: "ação 🚀" },
  { name: "empty file", bytes: new Uint8Array(), text: "" },
  { name: "UTF-16LE BOM only", bytes: Uint8Array.from([0xff, 0xfe]), text: "" },
  { name: "UTF-16BE BOM only", bytes: Uint8Array.from([0xfe, 0xff]), text: "" },
  { name: "single-byte UTF-8", bytes: Uint8Array.from([0x61]), text: "a" },
  { name: "incomplete byte order mark", bytes: Uint8Array.from([0xff]), text: "\uFFFD" },
  { name: "literal NUL in UTF-8", bytes: Uint8Array.from([0x61, 0, 0x62]), text: "a\0b" },
])("preserves the native decoding behavior for $name", async ({ bytes, text }) => {
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(bytes)));

  const file = await loadSourceFile({ owner: "reader", repo: "handbook", branch: "main", path: "text.txt" });

  expect(file.content).toBe(text);
});
