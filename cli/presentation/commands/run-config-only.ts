import path from "node:path";
// @ts-expect-error Legacy .mjs module kept for backward compatibility during migration.
import { executeConfigOnly } from "../../application/config-only/handler.mjs";
import type { CliCommandContext } from "../../application/ports/cli-runtime-ports";

export async function runConfigOnly(params: CliCommandContext): Promise<void> {
  const prebuiltDir =
    typeof params.prebuiltDir === "string"
      ? params.prebuiltDir
      : path.join(String(params.pkgRoot ?? process.cwd()), "prebuilt");

  await executeConfigOnly({
    ...params,
    prebuiltDir,
  });
}
