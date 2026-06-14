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
