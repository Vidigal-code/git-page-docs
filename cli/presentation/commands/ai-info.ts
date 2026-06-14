import { PROVIDER_CATALOG, ALL_PROVIDER_IDS, createModelRegistry, type AiProviderId } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

function capsLabel(caps: { streaming: boolean; vision: boolean; audio: boolean }): string {
  const parts: string[] = [];
  if (caps.streaming) parts.push("stream");
  if (caps.vision) parts.push("vision");
  if (caps.audio) parts.push("audio");
  return parts.join(", ") || "text";
}

/** `gitpagedocs provider [id]` — list providers or show one provider's detail. */
export async function runProvider(ctx: CommandContext): Promise<void> {
  const requested = ctx.args[1] as AiProviderId | undefined;
  if (requested && PROVIDER_CATALOG[requested]) {
    const spec = PROVIDER_CATALOG[requested];
    // eslint-disable-next-line no-console
    console.log(
      `\n  ${spec.label} (${spec.id})\n` +
        `    default model : ${spec.defaultModel}\n` +
        `    capabilities  : ${capsLabel(spec.capabilities)}\n` +
        `    base url      : ${spec.baseUrl || "(user-provided)"}\n` +
        `    models        : ${spec.models.map((m) => m.id).join(", ")}\n`,
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n  AI providers (${ALL_PROVIDER_IDS.length}):\n`);
  for (const id of ALL_PROVIDER_IDS) {
    const spec = PROVIDER_CATALOG[id];
    // eslint-disable-next-line no-console
    console.log(`  ${id.padEnd(14)} ${spec.label.padEnd(18)} ${spec.defaultModel}`);
  }
  // eslint-disable-next-line no-console
  console.log("\n  Detail: gitpagedocs provider <id>\n");
}

/** `gitpagedocs models [provider]` — list models for one or all providers. */
export async function runModels(ctx: CommandContext): Promise<void> {
  const models = createModelRegistry();
  const requested = ctx.args[1] as AiProviderId | undefined;
  const ids = requested && PROVIDER_CATALOG[requested] ? [requested] : ALL_PROVIDER_IDS;
  // eslint-disable-next-line no-console
  console.log("");
  for (const id of ids) {
    const list = models.list(id);
    // eslint-disable-next-line no-console
    console.log(`  ${PROVIDER_CATALOG[id].label} (${id}):`);
    for (const m of list) {
      // eslint-disable-next-line no-console
      console.log(`    - ${m.id}${m.id === PROVIDER_CATALOG[id].defaultModel ? "  (default)" : ""}`);
    }
  }
  // eslint-disable-next-line no-console
  console.log("");
}
