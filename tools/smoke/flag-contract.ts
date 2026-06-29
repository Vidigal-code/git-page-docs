#!/usr/bin/env node
/**
 * Phase 3 compatibility harness: locks the legacy CLI flag contract.
 *
 * Runs the REAL parser (cli/presentation/options/parser.ts) and reporter
 * (cli/application/report/config-only-reporter.mjs) and asserts the
 * flag -> options mapping and human-facing output lines documented in AUDIT.md.
 *
 * Pure and deterministic: no filesystem, git, or network side effects.
 * Invoked via tsx (see package.json "smoke:flags").
 */
import { parseCliOptions } from "../../cli/presentation/options/parser";
// @ts-expect-error .mjs runtime module
import { reportAll } from "../../cli/application/report/config-only-reporter.mjs";
// @ts-expect-error .mjs runtime module
import { ensureGitHubPagesWorkflow } from "../../cli/runtime/workflow.mjs";

let failures = 0;

function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Build a process.argv-shaped array (parser slices off the first two). */
function argv(...flags: string[]): string[] {
  return ["node", "cli/presentation/index.ts", ...flags];
}

const NO_ENV: NodeJS.ProcessEnv = {};

console.log("[smoke:flags] Asserting parser contract...");

{
  const o = parseCliOptions(argv(), NO_ENV);
  check("no-args -> config-only", o.mode === "config-only", o.mode);
  check("no-args -> hasArgs=false", o.hasArgs === false);
  check("no-args -> outputDir=gitpagedocs", o.outputDir === "gitpagedocs", o.outputDir);
  check("no-args -> shouldPush=false", o.shouldPush === false);
  check("no-args -> useLocalLayoutConfig=false", o.useLocalLayoutConfig === false);
}

{
  const o = parseCliOptions(argv("--layoutconfig"), NO_ENV);
  check("--layoutconfig -> useLocalLayoutConfig=true", o.useLocalLayoutConfig === true);
  check("--layoutconfig -> mode config-only", o.mode === "config-only", o.mode);
}

{
  const o = parseCliOptions(argv("--push", "--owner", "acme", "--repo", "docs-repo", "--path", "docs"), NO_ENV);
  check("--push -> shouldPush=true", o.shouldPush === true);
  check("--push -> githubOwner=acme", o.githubOwner === "acme", o.githubOwner);
  check("--push -> githubRepo=docs-repo", o.githubRepo === "docs-repo", o.githubRepo);
  check("--push -> docsPath=docs", o.docsPath === "docs", o.docsPath);
  check("--push -> basePath=docs", o.basePath === "docs", o.basePath);
  check("--push -> mode config-only", o.mode === "config-only", o.mode);
}

{
  const o = parseCliOptions(argv("--owner=acme", "--repo=r2"), NO_ENV);
  check("--owner=acme (equals form)", o.githubOwner === "acme", o.githubOwner);
  check("--repo=r2 (equals form)", o.githubRepo === "r2", o.githubRepo);
}

{
  const o = parseCliOptions(argv("--home"), NO_ENV);
  check("--home -> mode home", o.mode === "home", o.mode);
  check("--home -> outputDir=gitpagedocshome", o.outputDir === "gitpagedocshome", o.outputDir);
  check("--home -> repositorySearch=false", o.repositorySearch === false, String(o.repositorySearch));
}

{
  const o = parseCliOptions(argv("--home", "--search", "true"), NO_ENV);
  check("--home --search true -> repositorySearch=true", o.repositorySearch === true);
}

{
  const o = parseCliOptions(argv("--interactive"), NO_ENV);
  check("--interactive -> isInteractive=true", o.isInteractive === true);
  const o2 = parseCliOptions(argv("-i"), NO_ENV);
  check("-i -> isInteractive=true", o2.isInteractive === true);
}

{
  const o = parseCliOptions(argv("--build"), NO_ENV);
  check("--build -> isBuild=true", o.isBuild === true);
  check("--build -> mode config-only", o.mode === "config-only", o.mode);
  const oEnv = parseCliOptions(argv(), { GITPAGEDOCS_BUILD: "1" });
  check("env GITPAGEDOCS_BUILD=1 -> isBuild=true", oEnv.isBuild === true);
}

{
  const o = parseCliOptions(argv("--serve"), NO_ENV);
  check("--serve -> isServe=true", o.isServe === true);
  check("--serve -> mode config-only", o.mode === "config-only", o.mode);
}

{
  const o = parseCliOptions(argv("--full"), NO_ENV);
  check("--full -> mode full", o.mode === "full", o.mode);
}

{
  const o = parseCliOptions(argv("ai"), NO_ENV);
  check("ai -> mode ai", o.mode === "ai", o.mode);
  const o2 = parseCliOptions(argv("--ai"), NO_ENV);
  check("--ai -> mode ai", o2.mode === "ai", o2.mode);
  const o3 = parseCliOptions(argv("ai", "document"), NO_ENV);
  check("ai document -> aiCommand=document", o3.aiCommand === "document", String(o3.aiCommand));
}

// New verb aliases (Phase 6) mapped onto existing modes.
{
  const o = parseCliOptions(argv("document"), NO_ENV);
  check("document -> mode ai", o.mode === "ai", o.mode);
  check("document -> aiCommand=repo (default)", o.aiCommand === "repo", String(o.aiCommand));
  const o2 = parseCliOptions(argv("document:file"), NO_ENV);
  check("document:file -> mode ai", o2.mode === "ai", o2.mode);
  check("document:file -> aiCommand=file", o2.aiCommand === "file", String(o2.aiCommand));
}
{
  const o = parseCliOptions(argv("deploy"), NO_ENV);
  check("deploy -> shouldPush=true", o.shouldPush === true);
  check("deploy -> mode config-only", o.mode === "config-only", o.mode);
  const o2 = parseCliOptions(argv("pages"), NO_ENV);
  check("pages -> shouldPush=true", o2.shouldPush === true);
}
{
  // `--pages-actions` is a known flag (handled by the command layer); the parser
  // must not misread it as an owner/repo fallback.
  const o = parseCliOptions(argv("--pages-actions"), NO_ENV);
  check("--pages-actions -> no owner fallback", o.githubOwner === "");
  check("--pages-actions -> no repo fallback", o.githubRepo === "");
  check("--pages-actions -> mode config-only", o.mode === "config-only", o.mode);
}

console.log("[smoke:flags] Asserting reporter output contract...");

{
  const base = parseCliOptions(argv(), NO_ENV);
  const lines: string[] = reportAll(base, false);
  check("report: config-only success line", lines.includes("Generated: gitpagedocs/ (config-only)"));
  check("report: no-index line", lines.includes("No index.html/index.js generated."));
  check(
    "report: remote layouts default line",
    lines.includes("Using official remote layouts config by default (no local gitpagedocs/layouts generated)."),
  );
}

{
  const layout = parseCliOptions(argv("--layoutconfig"), NO_ENV);
  const lines: string[] = reportAll(layout, false);
  check(
    "report: --layoutconfig local layouts line",
    lines.includes("Local layouts generated in gitpagedocs/layouts/ (--layoutconfig)."),
  );
}

{
  const push = parseCliOptions(argv("--push", "--owner", "acme", "--repo", "r"), NO_ENV);
  const lines: string[] = reportAll(push, false);
  check("report: push workflow line", lines.includes("Generated: .github/workflows/gitpagedocs-pages.yml"));
  check(
    "report: rendering URL line",
    lines.includes("Configured rendering URL: https://acme.github.io/r/"),
  );
}

{
  const build = parseCliOptions(argv("--build"), NO_ENV);
  const lines: string[] = reportAll(build, false);
  check("report: --build compatibility line", lines.some((l) => l.includes("`--build` keeps compatibility flag")));
}

{
  const full = parseCliOptions(argv("--full"), NO_ENV);
  const lines: string[] = reportAll(full, false);
  check("report: --full skipped line", lines.some((l) => l.includes("External commands were skipped")));
}

{
  const base = parseCliOptions(argv(), NO_ENV);
  const lines: string[] = reportAll(base, true);
  check("report: prebuilt-detected line", lines.some((l) => l.includes("`prebuilt/` detected")));
}

console.log("[smoke:flags] Asserting generated Pages workflow uses pnpm...");

await (async () => {
  let workflow = "";
  await ensureGitHubPagesWorkflow(
    () => "main",
    (_path: string, content: string) => {
      workflow = content;
    },
    "my-path",
  );
  check("workflow installs with pnpm --frozen-lockfile", workflow.includes("pnpm install --frozen-lockfile"));
  check("workflow builds with pnpm exec next build", workflow.includes("pnpm exec next build"));
  check("workflow sets up pnpm", workflow.includes("pnpm/action-setup"));
  check("workflow no longer uses npm ci", !workflow.includes("npm ci"));
  check("workflow preserves .nojekyll step", workflow.includes(".nojekyll"));
  check("workflow preserves runtime clone", workflow.includes(".gitpagedocs-runtime"));
  check("workflow enables repository search during deploy", workflow.includes('GITPAGEDOCS_REPOSITORY_SEARCH: "true"'));
  check("workflow keeps search home at the root", !workflow.includes("Force root URL to docs entrypoint"));
})();

if (failures > 0) {
  console.error(`\n[smoke:flags] FAILED with ${failures} contract violation(s).`);
  process.exit(1);
}
console.log("\n[smoke:flags] OK - legacy flag, reporter and workflow contract intact.");
