import type { CliOptions } from "../../domain/models/cli-options";
import type { CliCommandRunner, CliRuntimeParams } from "../ports/cli-runtime-ports";

export async function dispatchMode(
  options: CliOptions,
  params: CliRuntimeParams,
  runner: CliCommandRunner,
): Promise<void> {
  if (options.mode === "home") {
    await runner.runHome({ ...params, options });
    return;
  }
  await runner.runConfigOnly({ ...params, options });
}
