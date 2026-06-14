import type { CliOptions } from "../../domain/models/cli-options";
import { DEFAULTS } from "../options/schema";
import { askText, askConfirm } from "./clack";

function isCiOrNonTty(): boolean {
  if (process.env.CI === "true") return true;
  if (process.env.GITHUB_ACTIONS === "true") return true;
  if (process.stdin && !process.stdin.isTTY) return true;
  return false;
}

export function shouldRunInteractive(argv: string[]): boolean {
  if (isCiOrNonTty()) return false;
  const args = argv.slice(2);
  if (args.includes("--interactive") || args.includes("-i")) return true;
  if (args.length === 0) return true;
  if (args.length === 1 && args[0] === "--home") return true;
  return false;
}

export async function promptHomeOptions(parsed: CliOptions): Promise<CliOptions> {
  const outputDir = await askText({
    message: "Output directory:",
    defaultValue: parsed.outputDir ?? DEFAULTS.home.outputDir,
    validate: (v) => (v && v.trim() ? undefined : "Required"),
  });
  const repositorySearch = await askConfirm(
    "Enable repository search home?",
    parsed.repositorySearch ?? DEFAULTS.repositorySearch,
  );
  const basePath = await askText({
    message: "Base path (e.g. git-page-docs, empty for root):",
    defaultValue: parsed.basePath ?? DEFAULTS.basePath,
  });

  return {
    ...parsed,
    outputDir: outputDir.trim(),
    repositorySearch,
    basePath: basePath?.trim() ?? "",
  };
}

export async function promptConfigOnlyOptions(parsed: CliOptions): Promise<CliOptions> {
  const useLocalLayoutConfig = await askConfirm(
    "Generate local layout templates?",
    parsed.useLocalLayoutConfig ?? false,
  );
  const githubOwner = await askText({
    message: "GitHub owner (optional):",
    defaultValue: parsed.githubOwner ?? "",
  });
  const githubRepo = await askText({
    message: "GitHub repo (optional):",
    defaultValue: parsed.githubRepo ?? "",
  });

  return {
    ...parsed,
    useLocalLayoutConfig,
    githubOwner: githubOwner?.trim() ?? "",
    githubRepo: githubRepo?.trim() ?? "",
  };
}
