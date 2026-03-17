/** Interactive prompts via inquirer */

import inquirer from "inquirer";
import { DEFAULTS } from "../options/schema.mjs";

export function shouldRunInteractive(argv) {
  const args = argv.slice(2);
  if (args.includes("--interactive") || args.includes("-i")) return true;
  if (args.length === 0) return true;
  if (args.length === 1 && args[0] === "--home") return true;
  return false;
}

export async function promptHomeOptions(parsed) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "outputDir",
      message: "Output directory:",
      default: parsed.outputDir ?? DEFAULTS.home.outputDir,
      validate: (v) => (v && v.trim() ? true : "Required"),
    },
    {
      type: "confirm",
      name: "repositorySearch",
      message: "Enable repository search home?",
      default: parsed.repositorySearch ?? DEFAULTS.repositorySearch,
    },
    {
      type: "input",
      name: "basePath",
      message: "Base path (e.g. git-page-docs, empty for root):",
      default: parsed.basePath ?? DEFAULTS.basePath,
    },
  ]);
  return {
    ...parsed,
    outputDir: answers.outputDir.trim(),
    repositorySearch: answers.repositorySearch,
    basePath: answers.basePath?.trim() ?? "",
  };
}

export async function promptConfigOnlyOptions(parsed) {
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "useLocalLayoutConfig",
      message: "Generate local layout templates?",
      default: parsed.useLocalLayoutConfig ?? false,
    },
    {
      type: "input",
      name: "githubOwner",
      message: "GitHub owner (optional):",
      default: parsed.githubOwner ?? "",
    },
    {
      type: "input",
      name: "githubRepo",
      message: "GitHub repo (optional):",
      default: parsed.githubRepo ?? "",
    },
  ]);
  return {
    ...parsed,
    useLocalLayoutConfig: answers.useLocalLayoutConfig,
    githubOwner: answers.githubOwner?.trim() ?? "",
    githubRepo: answers.githubRepo?.trim() ?? "",
  };
}
