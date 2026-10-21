import { afterEach, beforeEach, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileService } from "../src/filesystem/file-service";
import { ValidationError } from "../src/errors/app-error";

const FIXTURE_PREFIX = path.join(os.tmpdir(), "gpd-symlink-");
const OUTSIDE_CONTENT = "OUTSIDE FIXTURE CONTENT";
const DIRECTORY_LINK = process.platform === "win32" ? "junction" : "dir";
let fixture: string;
let root: string;
let outside: string;
let files: FileService;

beforeEach(() => {
  fixture = mkdtempSync(FIXTURE_PREFIX);
  root = path.join(fixture, "root");
  outside = path.join(fixture, "outside");
  mkdirSync(path.join(root, "docs"), { recursive: true });
  mkdirSync(outside);
  writeFileSync(path.join(outside, "secret.txt"), OUTSIDE_CONTENT, "utf8");
  files = new FileService(root);
});

afterEach(() => {
  if (!path.resolve(fixture).startsWith(FIXTURE_PREFIX)) throw new Error("Unexpected fixture path");
  rmSync(fixture, { recursive: true, force: true });
});

it("rejects reading an external file through a repository symlink", async () => {
  symlinkSync(path.join(outside, "secret.txt"), path.join(root, "docs", "link.txt"), "file");
  await expect(files.read("docs/link.txt")).rejects.toBeInstanceOf(ValidationError);
});

it("rejects reading through an external directory link", async () => {
  symlinkSync(outside, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  await expect(files.read("docs/linked/secret.txt")).rejects.toBeInstanceOf(ValidationError);
});

it("rejects writing through an existing file symlink and preserves the outside file", async () => {
  symlinkSync(path.join(outside, "secret.txt"), path.join(root, "docs", "link.txt"), "file");
  await expect(files.write("docs/link.txt", "REPLACEMENT")).rejects.toBeInstanceOf(ValidationError);
  expect(readFileSync(path.join(outside, "secret.txt"), "utf8")).toBe(OUTSIDE_CONTENT);
});

it("rejects replacing an external file through a directory link", async () => {
  symlinkSync(outside, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  await expect(files.write("docs/linked/secret.txt", "REPLACEMENT")).rejects.toBeInstanceOf(ValidationError);
  expect(readFileSync(path.join(outside, "secret.txt"), "utf8")).toBe(OUTSIDE_CONTENT);
});

it("rejects creating nested files below an external directory link before creating directories", async () => {
  symlinkSync(outside, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  await expect(files.write("docs/linked/new/nested/file.md", "NEW CONTENT")).rejects.toBeInstanceOf(ValidationError);
  expect(existsSync(path.join(outside, "new"))).toBe(false);
});

it("rejects writing through a dangling file symlink", async () => {
  const target = path.join(outside, "missing.txt");
  symlinkSync(target, path.join(root, "docs", "link.txt"), "file");
  await expect(files.write("docs/link.txt", "NEW CONTENT")).rejects.toBeInstanceOf(ValidationError);
  expect(existsSync(target)).toBe(false);
});

it("rejects creating files below a dangling directory link", async () => {
  const target = path.join(outside, "missing");
  symlinkSync(target, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  await expect(files.write("docs/linked/new/file.md", "NEW CONTENT")).rejects.toBeInstanceOf(ValidationError);
  expect(existsSync(target)).toBe(false);
});

it("allows reading internal file links but rejects writing through them", async () => {
  const target = path.join(root, "docs", "original.md");
  writeFileSync(target, "INTERNAL CONTENT", "utf8");
  symlinkSync(target, path.join(root, "docs", "link.md"), "file");
  await expect(files.read("docs/link.md")).resolves.toBe("INTERNAL CONTENT");
  await expect(files.write("docs/link.md", "REPLACEMENT")).rejects.toBeInstanceOf(ValidationError);
  expect(readFileSync(target, "utf8")).toBe("INTERNAL CONTENT");
});

it("preserves logical paths when reading, writing and listing an internal directory link", async () => {
  symlinkSync(path.join(root, "docs"), path.join(root, "alias"), DIRECTORY_LINK);
  await expect(files.write("alias/nested/file.md", "INTERNAL CONTENT")).resolves.toBe("alias/nested/file.md");
  await expect(files.read("alias/nested/file.md")).resolves.toBe("INTERNAL CONTENT");
  await expect(files.list("alias", { recursive: true })).resolves.toEqual(["alias/nested/", "alias/nested/file.md"]);
  expect(readFileSync(path.join(root, "docs", "nested", "file.md"), "utf8")).toBe("INTERNAL CONTENT");
});

it("rejects listing an external directory through a repository link", async () => {
  symlinkSync(outside, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  await expect(files.list("docs/linked", { recursive: true })).rejects.toBeInstanceOf(ValidationError);
});

it("excludes external linked contents from search while preserving internal results", async () => {
  symlinkSync(path.join(outside, "secret.txt"), path.join(root, "docs", "link.txt"), "file");
  symlinkSync(outside, path.join(root, "docs", "linked"), DIRECTORY_LINK);
  writeFileSync(path.join(root, "docs", "internal.md"), "INTERNAL FIXTURE CONTENT", "utf8");
  await expect(files.search("FIXTURE CONTENT")).resolves.toEqual([
    { file: "docs/internal.md", line: 1, text: "INTERNAL FIXTURE CONTENT" },
  ]);
});

it("supports a project root that is itself a directory link", async () => {
  const alias = path.join(fixture, "root-alias");
  symlinkSync(root, alias, DIRECTORY_LINK);
  const linkedFiles = new FileService(alias);
  await expect(linkedFiles.write("docs/new.md", "INTERNAL CONTENT")).resolves.toBe("docs/new.md");
  await expect(linkedFiles.read("docs/new.md")).resolves.toBe("INTERNAL CONTENT");
  symlinkSync(outside, path.join(root, "docs", "outside"), DIRECTORY_LINK);
  await expect(linkedFiles.read("docs/outside/secret.txt")).rejects.toBeInstanceOf(ValidationError);
});

it("allows ordinary names starting with two dots without permitting parent traversal", async () => {
  await expect(files.write("..notes/document.md", "INTERNAL CONTENT")).resolves.toBe("..notes/document.md");
  await expect(files.read("..notes/document.md")).resolves.toBe("INTERNAL CONTENT");
  await expect(files.read("../outside/secret.txt")).rejects.toBeInstanceOf(ValidationError);
});

it("preserves missing-file errors for ordinary paths inside the project", async () => {
  await expect(files.read("docs/missing/nested.md")).rejects.toMatchObject({
    message: "File not found: docs/missing/nested.md",
    cause: { code: "ENOENT" },
  });
});

it("preserves a file when the requested path uses it as a parent directory", async () => {
  writeFileSync(path.join(root, "docs", "file.md"), "INTERNAL CONTENT", "utf8");
  await expect(files.write("docs/file.md/nested.md", "REPLACEMENT")).rejects.toBeInstanceOf(Error);
  expect(readFileSync(path.join(root, "docs", "file.md"), "utf8")).toBe("INTERNAL CONTENT");
});
