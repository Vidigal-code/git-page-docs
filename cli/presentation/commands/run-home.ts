// @ts-expect-error Legacy .mjs module kept for backward compatibility during migration.
import { executeHome } from "../../application/home/handler.mjs";
import type { CliCommandContext } from "../../application/ports/cli-runtime-ports";

export async function runHome(params: CliCommandContext): Promise<void> {
  await executeHome(params);
}
