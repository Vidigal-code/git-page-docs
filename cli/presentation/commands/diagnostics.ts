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
    console.log(`  ${c.ok ? "✓" : "✗"}  ${c.label.padEnd(22)} ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.ok && c.label !== "gh (GitHub CLI)").length;
  // eslint-disable-next-line no-console
  console.log(`\n  ${failed === 0 ? "All required checks passed." : `${failed} check(s) need attention.`}\n`);
}

export async function runUpdate(ctx: CommandContext): Promise<void> {
  const current = readVersion(ctx.pkgRoot);
  // eslint-disable-next-line no-console
  console.log(
    `\n  Installed: gitpagedocs ${current}\n` +
      "  To update the global CLI:\n" +
      "    npm i -g gitpagedocs@latest\n" +
      "  Or, in a project:\n" +
      "    pnpm add -D gitpagedocs@latest\n",
  );
}
