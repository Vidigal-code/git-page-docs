import { afterEach, expect, it } from "vitest";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, rmdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { preparePdfAssets } from "../build/prepare-pdf-assets";

const roots: string[] = [];
function projectDirectory(): string {
  const root = mkdtempSync(path.join(tmpdir(), "gpd-pdf-assets-"));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    if (path.dirname(root) !== path.resolve(tmpdir())) throw new Error("Unexpected temporary directory");
    rmSync(root, { recursive: true, force: true });
  }
});

it("stages the original PDF bytes at the matching public URL path", () => {
  const root = projectDirectory();
  const folder = path.join(root, "gitpagedocs/docs/versions/0.0.9/en");
  mkdirSync(folder, { recursive: true });
  const pdf = Buffer.from("%PDF-1.7\nexample\n%%EOF");
  writeFileSync(path.join(folder, "guide.pdf"), pdf);
  expect(preparePdfAssets(root)).toBe(1);
  expect(readFileSync(path.join(root, "frontend/public/gitpagedocs/docs/versions/0.0.9/en/guide.pdf"))).toEqual(pdf);
});

it("rejects a dangling destination junction before copying outside public", () => {
  const root = projectDirectory();
  mkdirSync(path.join(root, "gitpagedocs"));
  writeFileSync(path.join(root, "gitpagedocs/guide.pdf"), "%PDF-1.7");
  mkdirSync(path.join(root, "frontend/public"), { recursive: true });
  const outside = path.join(root, "outside");
  symlinkSync(outside, path.join(root, "frontend/public/gitpagedocs"), "junction");
  expect(() => preparePdfAssets(root)).toThrow(/symbolic link/);
  expect(existsSync(path.join(outside, "guide.pdf"))).toBe(false);
});

it("ignores non-PDF files and source junctions", () => {
  const root = projectDirectory();
  const docs = path.join(root, "gitpagedocs");
  const outside = path.join(root, "private");
  mkdirSync(docs);
  mkdirSync(outside);
  writeFileSync(path.join(docs, "config.json"), "{}");
  writeFileSync(path.join(outside, "private.pdf"), "%PDF-1.7");
  symlinkSync(outside, path.join(docs, "linked"), "junction");
  expect(preparePdfAssets(root)).toBe(0);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/config.json"))).toBe(false);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/linked/private.pdf"))).toBe(false);
});

it("allows a checkout without local documentation", () => {
  expect(preparePdfAssets(projectDirectory())).toBe(0);
});

it.each(["file", "directory"])("removes a staged PDF when the source %s is withdrawn", (removedSource) => {
  const root = projectDirectory();
  const source = path.join(root, "gitpagedocs/guide.pdf");
  mkdirSync(path.dirname(source));
  writeFileSync(source, "%PDF-1.7");
  preparePdfAssets(root);
  rmSync(source);
  if (removedSource === "directory") rmdirSync(path.dirname(source));
  expect(preparePdfAssets(root)).toBe(0);
  expect(existsSync(path.join(root, "frontend/public/gitpagedocs/guide.pdf"))).toBe(false);
});
