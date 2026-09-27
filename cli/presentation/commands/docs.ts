import {
  FileService,
  DocUpdater,
  providersSection,
  cliCommandsSection,
  devWorkflowSection,
  securityNoteSection,
  CLI_COMMANDS,
} from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

/** Human-readable outcome of one managed-region update. */
function describeUpdate(result: { changed: boolean; replaced: boolean }): string {
  if (!result.changed) return "already up to date";
  return result.replaced ? "managed region updated" : "managed region added";
}

/**
 * `gitpagedocs docs` — refresh the managed regions of the standard docs files
 * with deterministic content. Idempotent and marker-bounded: manual content
 * outside `<!-- gitpagedocs:start/end -->` is preserved; missing files are
 * created. Covers README, CONTRIBUTING and SECURITY (master-spec docs set).
 */
export async function runDocs(ctx: CommandContext): Promise<void> {
  const updater = new DocUpdater(new FileService(ctx.cwd));

  const updates = [
    { path: "README.md", generated: `${providersSection()}\n\n${cliCommandsSection(CLI_COMMANDS)}` },
    { path: "CONTRIBUTING.md", generated: `${devWorkflowSection()}\n\n${cliCommandsSection(CLI_COMMANDS)}` },
    { path: "SECURITY.md", generated: securityNoteSection() },
  ];

  const results = await updater.updateManagedFiles(updates);
  // eslint-disable-next-line no-console
  console.log("");
  for (const r of results) {
    // eslint-disable-next-line no-console
    console.log(`  ${r.path}: ${describeUpdate(r)}.`);
  }
  // eslint-disable-next-line no-console
  console.log("");
}
