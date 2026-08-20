import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { planLayoutsMigration } from "../domain/services/layouts-migration.mjs";
import { listFilesRecursively, executeLayoutsMigration } from "../runtime/layouts-migrator.mjs";

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-layouts-"));
  temporaryRoots.push(root);
  return root;
}

function writeFileAt(root: string, relativePath: string, contents: string): void {
  const absolute = path.join(root, ...relativePath.split("/"));
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, contents);
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("planLayoutsMigration", () => {
  it("is not required when the legacy folder is empty", () => {
    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: [],
    });
    expect(plan.required).toBe(false);
    expect(plan.from).toBe("gitpagedocs/layouts");
    expect(plan.to).toBe("gitpagelayouts");
  });

  it("is not required when source and destination are the same folder", () => {
    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagedocs/layouts",
      legacyFiles: ["layoutsConfig.json"],
    });
    expect(plan.required).toBe(false);
  });

  it("sorts and de-duplicates the files it plans to move", () => {
    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: ["templates/b.json", "layoutsConfig.json", "templates/b.json"],
    });
    expect(plan.required).toBe(true);
    expect(plan.files).toEqual(["layoutsConfig.json", "templates/b.json"]);
  });

  it("normalizes Windows separators so paths compare consistently", () => {
    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: ["templates\\a.json"],
      targetFiles: ["templates/a.json"],
    });
    expect(plan.files).toEqual(["templates/a.json"]);
    expect(plan.overwrites).toEqual(["templates/a.json"]);
  });

  it("reports only the files that already exist at the destination", () => {
    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: ["a.json", "b.json"],
      targetFiles: ["b.json", "c.json"],
    });
    expect(plan.overwrites).toEqual(["b.json"]);
  });

  it("tolerates missing and malformed file lists", () => {
    const plan = planLayoutsMigration({ outputDir: "gitpagedocs", layoutsDir: "gitpagelayouts" });
    expect(plan.files).toEqual([]);
    expect(plan.overwrites).toEqual([]);
  });
});

describe("listFilesRecursively", () => {
  it("returns an empty list for a missing directory", () => {
    expect(listFilesRecursively(path.join(makeRoot(), "nope"))).toEqual([]);
  });

  it("returns nested files as sorted POSIX-relative paths", () => {
    const root = makeRoot();
    writeFileAt(root, "layouts/templates/b.json", "{}");
    writeFileAt(root, "layouts/layoutsConfig.json", "{}");
    expect(listFilesRecursively(path.join(root, "layouts"))).toEqual([
      "layoutsConfig.json",
      "templates/b.json",
    ]);
  });
});

describe("executeLayoutsMigration", () => {
  it("moves every planned file and removes the emptied legacy folder", () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", '{"layouts":[]}');
    writeFileAt(root, "gitpagedocs/layouts/templates/custom.json", '{"custom":true}');

    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: listFilesRecursively(path.join(root, "gitpagedocs", "layouts")),
    });
    const result = executeLayoutsMigration(root, plan);

    expect(result.failed).toEqual([]);
    expect(result.moved).toEqual(["layoutsConfig.json", "templates/custom.json"]);
    expect(existsSync(path.join(root, "gitpagedocs", "layouts"))).toBe(false);
    expect(readFileSync(path.join(root, "gitpagelayouts", "templates", "custom.json"), "utf8")).toBe(
      '{"custom":true}',
    );
  });

  it("preserves the docs output dir around the moved folder", () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/config.json", "{}");
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", "{}");

    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: listFilesRecursively(path.join(root, "gitpagedocs", "layouts")),
    });
    executeLayoutsMigration(root, plan);

    expect(existsSync(path.join(root, "gitpagedocs", "config.json"))).toBe(true);
  });

  it("overwrites a destination file that already exists", () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", '{"from":"legacy"}');
    writeFileAt(root, "gitpagelayouts/layoutsConfig.json", '{"from":"new"}');

    const plan = planLayoutsMigration({
      outputDir: "gitpagedocs",
      layoutsDir: "gitpagelayouts",
      legacyFiles: listFilesRecursively(path.join(root, "gitpagedocs", "layouts")),
      targetFiles: listFilesRecursively(path.join(root, "gitpagelayouts")),
    });
    expect(plan.overwrites).toEqual(["layoutsConfig.json"]);

    executeLayoutsMigration(root, plan);
    expect(readFileSync(path.join(root, "gitpagelayouts", "layoutsConfig.json"), "utf8")).toBe(
      '{"from":"legacy"}',
    );
  });
});
