/** Config-only command: delegates to use case handler */

import { existsSync } from "node:fs";
import path from "node:path";
import { executeConfigOnly } from "../application/config-only/handler.mjs";

export async function runConfigOnly(params) {
  const prebuiltDir = params.prebuiltDir ?? path.join(params.pkgRoot ?? process.cwd(), "..", "prebuilt");
  await executeConfigOnly({
    ...params,
    prebuiltDir,
  });
}
