import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { FileService } from "../src/filesystem/file-service";
import { ValidationError, RepositoryError } from "../src/errors/app-error";

describe("FileService", () => {
  let dir: string;
  let fs: FileService;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-fs-"));
    fs = new FileService(dir);
    mkdirSync(path.join(dir, "sub"), { recursive: true });
    mkdirSync(path.join(dir, "node_modules"), { recursive: true });
    writeFileSync(path.join(dir, "a.ts"), "const TOKEN = 1;\n", "utf8");
    writeFileSync(path.join(dir, "sub", "b.md"), "hello TOKEN world\n", "utf8");
    writeFileSync(path.join(dir, "node_modules", "junk.ts"), "ignored", "utf8");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("lists entries, ignoring node_modules", async () => {
    const top = await fs.list(".");
    expect(top).toContain("a.ts");
    expect(top.some((e) => e.startsWith("node_modules"))).toBe(false);
    const recursive = await fs.list(".", { recursive: true });
    expect(recursive).toContain("sub/b.md");
  });

  it("reads and writes files", async () => {
    expect(await fs.read("a.ts")).toContain("TOKEN");
    const written = await fs.write("out/new.txt", "data");
    expect(written).toBe("out/new.txt");
    expect(await fs.read("out/new.txt")).toBe("data");
  });

  it("rejects path traversal", async () => {
    await expect(fs.read("../../etc/passwd")).rejects.toBeInstanceOf(ValidationError);
    await expect(fs.write("../escape.txt", "x")).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws for a missing file and oversize read", async () => {
    await expect(fs.read("missing.ts")).rejects.toBeInstanceOf(RepositoryError);
    await expect(fs.read("a.ts", 2)).rejects.toBeInstanceOf(ValidationError);
  });

  it("searches text files for a substring", async () => {
    const matches = await fs.search("TOKEN");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches.every((m) => m.line > 0)).toBe(true);
    const tsOnly = await fs.search("TOKEN", { extension: ".ts" });
    expect(tsOnly.every((m) => m.file.endsWith(".ts"))).toBe(true);
    await expect(fs.search("   ")).rejects.toBeInstanceOf(ValidationError);
  });
});
