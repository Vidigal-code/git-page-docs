/** Home distribution command: delegates to use case handler */

import { executeHome } from "../application/home/handler.mjs";

export async function runHome(params) {
  await executeHome(params);
}
