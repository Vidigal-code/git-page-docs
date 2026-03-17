/** Resolve final options (parser + interactive prompts) */

import { parseCliOptions } from "./parser.mjs";
import { shouldRunInteractive, promptHomeOptions, promptConfigOnlyOptions } from "../ui/prompts.mjs";
import { DEFAULTS } from "./schema.mjs";

export async function resolveOptions(argv, env) {
  const parsed = parseCliOptions(argv, env);

  if (parsed.mode === "home") {
    parsed.repositorySearch = parsed.repositorySearch ?? DEFAULTS.home.repositorySearch;
    parsed.basePath = parsed.basePath ?? parsed.docsPath ?? DEFAULTS.home.basePath;
  }

  const runInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "home");
  if (runInteractive && parsed.mode === "home") {
    return promptHomeOptions(parsed);
  }

  const runConfigInteractive = parsed.isInteractive || (shouldRunInteractive(argv) && parsed.mode === "config-only");
  if (runConfigInteractive && parsed.mode === "config-only") {
    return promptConfigOnlyOptions(parsed);
  }

  return parsed;
}
