#!/usr/bin/env node
/**
 * Phase 9 self-test: documentation automation. Verifies the marker patcher's
 * idempotency and manual-content preservation, the DocUpdater over a real temp
 * directory, and deterministic section generators.
 */
import os from "node:os";
import path from "node:path";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { patchManagedRegion, START_MARKER, END_MARKER } from "../src/documentation/marker-patcher";
import { DocUpdater } from "../src/documentation/doc-updater";
import { providersSection, cliCommandsSection, CLI_COMMANDS } from "../src/documentation/sections";
import { FileService } from "../src/filesystem/file-service";

let failures = 0;
function check(label: string, cond: boolean, detail = ""): void {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function readGeneratedVersionConfig(): Record<string, unknown> {
  return JSON.parse(readFileSync("tools/gitpagedocs/docs/versions/1.1.54/config.json", "utf8")) as Record<string, unknown>;
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
}

function routeIds(config: Record<string, unknown>, routeKeys: string[]): Set<number> {
  const ids = new Set<number>();
  for (const key of routeKeys) {
    for (const route of asArray(config[key])) {
      const id = Number(route.id);
      check(`generated config route id is valid for ${key}`, Number.isFinite(id), String(route.id));
      check(`generated config route id ${id} is unique`, !ids.has(id), key);
      ids.add(id);
    }
  }
  return ids;
}

function assertGeneratedMenuContract(): void {
  const config = readGeneratedVersionConfig();
  const routeKeys = ["routes-md", "routes-source-viewer", "routes-html", "routes-video", "routes-audio"];
  const menuKeys = ["menus-header-md", "menus-header-source-viewer", "menus-header-html", "menus-header-video", "menus-header-audio"];
  const ids = routeIds(config, routeKeys);

  check("generated config includes source viewer routes", asArray(config["routes-source-viewer"]).length > 0);
  check("generated config includes video routes", asArray(config["routes-video"]).length > 0);
  check("generated config includes audio routes", asArray(config["routes-audio"]).length > 0);
  check("generated config includes source viewer menu", asArray(config["menus-header-source-viewer"]).length > 0);
  check("generated config includes video menu", asArray(config["menus-header-video"]).length > 0);
  check("generated config includes audio menu", asArray(config["menus-header-audio"]).length > 0);

  for (const key of menuKeys) {
    for (const item of asArray(config[key])) {
      for (const lang of ["pt", "en", "es"]) {
        const localized = item[lang] as { "path-click"?: string } | undefined;
        const pathClick = localized?.["path-click"];
        if (!pathClick?.startsWith("page:")) continue;
        const id = Number(pathClick.slice("page:".length));
        check(`generated ${key} ${lang} points to an existing route`, ids.has(id), pathClick);
      }
    }
  }
}

async function main(): Promise<void> {
  console.log("[smoke:docs] marker patcher");
  const manual = "# My Project\n\nManual intro that must be preserved.\n";
  const first = patchManagedRegion(manual, "GENERATED-A");
  check("appends managed block when no markers", !first.replaced);
  check("keeps manual content", first.content.startsWith("# My Project"));
  check("contains markers", first.content.includes(START_MARKER) && first.content.includes(END_MARKER));

  const second = patchManagedRegion(first.content, "GENERATED-A");
  check("idempotent: re-run identical content", second.content === first.content, "content drifted");
  check("re-run reports replaced", second.replaced);

  const third = patchManagedRegion(first.content, "GENERATED-B");
  check("replaces region with new content", third.content.includes("GENERATED-B") && !third.content.includes("GENERATED-A"));
  check("still preserves manual intro after replace", third.content.startsWith("# My Project"));

  const footer = "Manual intro.\n\n" + START_MARKER + "\nold\n" + END_MARKER + "\n\nManual footer.\n";
  const patchedFooter = patchManagedRegion(footer, "new");
  check("preserves content after end marker", patchedFooter.content.includes("Manual footer."));

  console.log("[smoke:docs] DocUpdater over temp dir");
  const dir = mkdtempSync(path.join(os.tmpdir(), "gpd-docs-"));
  try {
    writeFileSync(path.join(dir, "README.md"), "# Temp\n\nHand-written.\n", "utf8");
    const updater = new DocUpdater(new FileService(dir));
    const generated = `${providersSection()}\n\n${cliCommandsSection(CLI_COMMANDS)}`;

    const r1 = await updater.updateManagedFile("README.md", generated);
    check("first update changes the file", r1.changed);
    const after1 = readFileSync(path.join(dir, "README.md"), "utf8");
    check("manual content preserved in file", after1.includes("Hand-written."));
    check("providers table injected", after1.includes("Supported AI providers"));

    const r2 = await updater.updateManagedFile("README.md", generated);
    check("second identical update is a no-op (changed=false)", r2.changed === false);
    const after2 = readFileSync(path.join(dir, "README.md"), "utf8");
    check("file byte-identical after idempotent re-run", after1 === after2);

    // updateManagedFile on a missing file creates it.
    const r3 = await updater.updateManagedFile("CHANGELOG.md", "## Changes");
    check("creates a missing managed file", r3.changed && !r3.replaced);
    check("created file exists", readFileSync(path.join(dir, "CHANGELOG.md"), "utf8").includes("## Changes"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log("[smoke:docs] deterministic sections");
  check("providersSection lists 14 providers", (providersSection().match(/\| `/g) ?? []).length >= 14);
  check("providersSection deterministic", providersSection() === providersSection());
  check("cliCommandsSection lists commands", cliCommandsSection(CLI_COMMANDS).includes("gitpagedocs init"));

  console.log("[smoke:docs] generated menu contract");
  assertGeneratedMenuContract();

  if (failures > 0) {
    console.error(`\n[smoke:docs] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:docs] OK - documentation automation verified.");
}

main().catch((err) => {
  console.error("[smoke:docs] crashed:", err);
  process.exit(1);
});
