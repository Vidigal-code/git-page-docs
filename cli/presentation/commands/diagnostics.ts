import path from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { defaultConfigLoader } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

function readVersion(pkgRoot: string): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
    return String(pkg.version ?? "unknown");
  } catch {
    return "unknown";
  }
}

export async function runVersion(ctx: CommandContext): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`gitpagedocs ${readVersion(ctx.pkgRoot)} (node ${process.version})`);
}

function probe(label: string, command: string): { label: string; ok: boolean; detail: string } {
  try {
    const out = execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return { label, ok: true, detail: out.split("\n")[0] };
  } catch {
    return { label, ok: false, detail: "not found" };
  }
}

export async function runDoctor(ctx: CommandContext): Promise<void> {
  const checks: Array<{ label: string; ok: boolean; detail: string }> = [];
  checks.push({ label: "node", ok: true, detail: process.version });
  checks.push(probe("git", "git --version"));
  checks.push(probe("gh (GitHub CLI)", "gh --version"));
  checks.push(probe("pnpm", "pnpm --version"));

  const configPath = await defaultConfigLoader.resolveConfigPath(ctx.cwd);
  checks.push({
    label: "gitpagedocs config",
    ok: Boolean(configPath),
    detail: configPath ? path.relative(ctx.cwd, configPath) : "not found (run `gitpagedocs init`)",
  });
  checks.push({
    label: "gitpagedocs/ directory",
    ok: existsSync(path.join(ctx.cwd, "gitpagedocs")),
    detail: existsSync(path.join(ctx.cwd, "gitpagedocs")) ? "present" : "missing",
  });

  // eslint-disable-next-line no-console
  console.log("\n  gitpagedocs doctor\n");
  for (const c of checks) {
    // eslint-disable-next-line no-console
    console.log(`  ${c.ok ? "[ok]" : "[x] "} ${c.label.padEnd(22)} ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.ok && c.label !== "gh (GitHub CLI)").length;
  // eslint-disable-next-line no-console
  console.log(`\n  ${failed === 0 ? "All required checks passed." : `${failed} check(s) need attention.`}\n`);
}

/** Used only when package.json is unreadable — the CLI's published name. */
const FALLBACK_PACKAGE = "@gitpagedocs/cli";
/** The bin this package installs; shown alongside the package name. */
const BIN_NAME = "gitpagedocs";

interface PackageIdentity {
  name: string;
  version: string;
}

/**
 * Read the identity from the installed package.json rather than hardcoding it,
 * so the hint always names the package the user actually has. A hardcoded name
 * is how `update` ended up advertising an unpublished package.
 */
function readPackageIdentity(pkgRoot: string): PackageIdentity {
  try {
    const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
    const name = typeof pkg.name === "string" && pkg.name.length > 0 ? pkg.name : FALLBACK_PACKAGE;
    return { name, version: String(pkg.version ?? "unknown") };
  } catch {
    return { name: FALLBACK_PACKAGE, version: "unknown" };
  }
}

type RegistryLookup =
  | { status: "ok"; latest: string }
  | { status: "missing" }
  | { status: "unreachable" };

function registryBase(): string {
  const configured = process.env.npm_config_registry || "https://registry.npmjs.org";
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

/** Resolve the dist-tag `latest` for a package. Never throws. */
async function fetchLatest(name: string, timeoutMs = 6000): Promise<RegistryLookup> {
  const encoded = name.split("/").map(encodeURIComponent).join("/");
  try {
    const response = await fetch(`${registryBase()}/${encoded}/latest`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "unreachable" };
    const body = (await response.json()) as { version?: unknown };
    if (typeof body.version === "string" && body.version.length > 0) {
      return { status: "ok", latest: body.version };
    }
    return { status: "unreachable" };
  } catch {
    return { status: "unreachable" };
  }
}

/** Numeric version compare, prerelease suffix ignored. */
function compareVersions(a: string, b: string): number {
  const parts = (value: string): number[] =>
    value.split("-")[0].split(".").map((piece) => Number.parseInt(piece, 10) || 0);
  const left = parts(a);
  const right = parts(b);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

export async function runUpdate(ctx: CommandContext): Promise<void> {
  const { name, version } = readPackageIdentity(ctx.pkgRoot);
  const lookup = await fetchLatest(name);
  const label = name === BIN_NAME ? `${BIN_NAME} ${version}` : `${BIN_NAME} ${version}  (${name})`;
  const lines = ["", `  Installed: ${label}`];

  if (lookup.status === "ok") {
    lines.push(`  Latest:    ${lookup.latest}`);
  } else if (lookup.status === "missing") {
    lines.push(`  Latest:    unavailable — the registry has no published ${name}`);
  } else {
    lines.push("  Latest:    unknown — could not reach the npm registry");
  }

  if (lookup.status === "missing") {
    lines.push(
      "",
      "  Nothing can be installed under that name. If the package was renamed",
      "  or unpublished, check the current one:",
      "    https://www.npmjs.com/package/@gitpagedocs/cli",
    );
  } else if (lookup.status === "ok" && compareVersions(version, lookup.latest) >= 0) {
    lines.push("", "  Already on the latest published version.");
  } else {
    const target = lookup.status === "ok" ? lookup.latest : "latest";
    lines.push(
      "",
      "  To update the global CLI:",
      `    npm i -g ${name}@${target}`,
      "  Or, in a project:",
      `    pnpm add -D ${name}@${target}`,
    );
  }

  lines.push("");
  // eslint-disable-next-line no-console
  console.log(lines.join("\n"));
}
