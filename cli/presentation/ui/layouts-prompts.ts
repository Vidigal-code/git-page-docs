/**
 * Layout-related prompts: where layouts come from, where they are written, and
 * the opt-in migration away from the legacy `<outputDir>/layouts/` folder.
 */
import path from "node:path";
import { askConfirm, askSelect, askText, note } from "./clack";
import { interactivePromptsAvailable } from "./tty";
import {
  DEFAULT_LAYOUTS_DIR,
  normalizeLayoutsDir,
  legacyLayoutsDir,
} from "../../contracts/layouts-paths.mjs";
import { planLayoutsMigration } from "../../domain/services/layouts-migration.mjs";
import { listFilesRecursively, executeLayoutsMigration } from "../../runtime/layouts-migrator.mjs";

type LayoutsSource = "official" | "local";

/** Outcome of a completed migration, for the caller to report. */
export interface LayoutsMigrationOutcome {
  from: string;
  to: string;
  movedCount: number;
}

/** Ask whether layouts come from the official remote source or a local folder. */
export async function askLayoutsSource(useLocal: boolean): Promise<boolean> {
  const choice = await askSelect<LayoutsSource>(
    "Layout source",
    [
      {
        value: "official",
        label: "Official layouts (remote)",
        hint: "nothing is written to your repository",
      },
      {
        value: "local",
        label: "Local layouts",
        hint: `generated into ${DEFAULT_LAYOUTS_DIR}/`,
      },
    ],
    useLocal ? "local" : "official",
  );
  return choice === "local";
}

/** Ask which folder should hold the generated layouts. */
export async function askLayoutsDir(current: string): Promise<string> {
  const answer = await askText({
    message: "Layouts folder:",
    defaultValue: normalizeLayoutsDir(current),
    validate: (value) => (value.trim() ? undefined : "A folder name is required."),
  });
  return normalizeLayoutsDir(answer);
}

function toAbsolute(root: string, repoRelative: string): string {
  return path.join(root, ...repoRelative.split("/"));
}

/**
 * Offer to move layouts left behind in the legacy folder.
 *
 * Nothing is moved without an explicit confirmation. Outside a TTY the legacy
 * folder is reported and left alone — the viewer still reads it, so declining
 * (or automating) never breaks an existing site.
 *
 * @returns The outcome when files were moved, otherwise `null`.
 */
export async function migrateLegacyLayoutsInteractive(
  root: string,
  options: { outputDir: string; layoutsDir: string },
): Promise<LayoutsMigrationOutcome | null> {
  const from = legacyLayoutsDir(options.outputDir);
  const to = normalizeLayoutsDir(options.layoutsDir);

  const plan = planLayoutsMigration({
    outputDir: options.outputDir,
    layoutsDir: to,
    legacyFiles: listFilesRecursively(toAbsolute(root, from)),
    targetFiles: listFilesRecursively(toAbsolute(root, to)),
  });

  if (!plan.required) return null;

  if (!interactivePromptsAvailable()) {
    note(
      `${plan.files.length} layout file(s) still live in ${plan.from}/.\n` +
        `The viewer still reads them. Run this in a terminal to move them to ${plan.to}/.`,
      "Legacy layouts",
    );
    return null;
  }

  const overwriteWarning =
    plan.overwrites.length > 0
      ? `\n${plan.overwrites.length} file(s) already in ${plan.to}/ would be replaced.`
      : "";
  note(
    `Found ${plan.files.length} layout file(s) in ${plan.from}/.\n` +
      `Layouts are now generated in ${plan.to}/.${overwriteWarning}`,
    "Legacy layouts",
  );

  const confirmed = await askConfirm(
    `Move them to ${plan.to}/ now?`,
    plan.overwrites.length === 0,
  );
  if (!confirmed) {
    note(`Left untouched — the viewer still reads ${plan.from}/.`, "Legacy layouts");
    return null;
  }

  const result = executeLayoutsMigration(root, plan);

  if (result.failed.length > 0) {
    note(
      `${result.failed.length} file(s) could not be moved:\n` +
        result.failed.map((entry) => `- ${entry.file}: ${entry.reason}`).join("\n"),
      "Migration incomplete",
    );
  }

  return { from: plan.from, to: plan.to, movedCount: result.moved.length };
}
