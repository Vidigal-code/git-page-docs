import type { CliOptions } from "../../domain/models/cli-options";
import { parseCliOptions } from "./parser";
import { shouldRunInteractive, promptConfigOnlyOptions, promptHomeOptions } from "../ui/prompts";
import { DEFAULTS } from "./schema";

export async function resolveOptions(argv: string[], env: NodeJS.ProcessEnv): Promise<CliOptions> {
  const parsed = parseCliOptions(argv, env);

  if (parsed.mode === "home") {
    parsed.repositorySearch = parsed.repositorySearch ?? DEFAULTS.home.repositorySearch;
    parsed.basePath = parsed.basePath ?? parsed.docsPath ?? DEFAULTS.home.basePath;
  }

  const runHomeInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "home");
  if (runHomeInteractive && parsed.mode === "home") {
    return promptHomeOptions(parsed);
  }

  const runConfigInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "config-only");
  if (runConfigInteractive && parsed.mode === "config-only") {
    return promptConfigOnlyOptions(parsed);
  }

  return parsed;
}
