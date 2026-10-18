import { afterEach, expect, it } from "vitest";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { prepareDocumentAssets } from "../build/prepare-document-assets";

let root: string | undefined;
afterEach(() => {
  if (root && path.dirname(root) === path.resolve(tmpdir())) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

it.each(["wav", "mp3", "m4a", "mp4", "webm", "ogg", "FLAC"])("stages %s bytes beside PDF assets without publishing configuration files", (extension) => {
  root = mkdtempSync(path.join(tmpdir(), "gpd-native-assets-"));
  const source = path.join(root, "gitpagedocs/docs/en");
  mkdirSync(source, { recursive: true });
  const media = Buffer.from([82, 73, 70, 70, 0, 1, 2, 3]);
  writeFileSync(path.join(source, `example.${extension}`), media);
  writeFileSync(path.join(source, "config.json"), "{}");
  writeFileSync(path.join(source, ".env"), "SECRET=private");
  writeFileSync(path.join(source, "notes.md"), "Private notes");
  expect(prepareDocumentAssets(root)).toBe(1);
  expect(readFileSync(path.join(root, `frontend/public/gitpagedocs/docs/en/example.${extension}`))).toEqual(media);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/docs/en/config.json"))).toBe(false);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/docs/en/.env"))).toBe(false);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/docs/en/notes.md"))).toBe(false);
});

it("removes a previously staged native file when its source is withdrawn", () => {
  root = mkdtempSync(path.join(tmpdir(), "gpd-native-assets-"));
  const source = path.join(root, "gitpagedocs/docs/en/example.wav");
  mkdirSync(path.dirname(source), { recursive: true });
  writeFileSync(source, "RIFF");
  prepareDocumentAssets(root);
  rmSync(source);
  expect(prepareDocumentAssets(root)).toBe(0);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/docs/en/example.wav"))).toBe(false);
});
