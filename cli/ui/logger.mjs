/** Consistent log formatting */

export function logStep(msg) {
  console.log(`  > ${msg}`);
}

export function logSuccess(msg) {
  console.log(`  ✓ ${msg}`);
}

export function logInfo(msg) {
  console.log(`  ${msg}`);
}
