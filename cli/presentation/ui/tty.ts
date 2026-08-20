/**
 * Terminal capability detection.
 *
 * Kept in its own module so every prompt module can ask "may I prompt?" without
 * importing the prompt modules themselves (which would be circular).
 */

/** Environment variables that mark a non-interactive automated run. */
const CI_ENV_FLAGS = ["CI", "GITHUB_ACTIONS"] as const;

/** Flags that explicitly opt out of prompting. */
export const NON_INTERACTIVE_FLAGS = ["--no-interactive", "--yes", "-y"] as const;

function isCiOrNonTty(): boolean {
  for (const flag of CI_ENV_FLAGS) {
    if (process.env[flag] === "true") return true;
  }
  return Boolean(process.stdin && !process.stdin.isTTY);
}

/** True when clack prompts can run (interactive TTY, not CI). */
export function interactivePromptsAvailable(): boolean {
  return !isCiOrNonTty();
}

/** True when the user explicitly asked for a non-interactive run. */
export function promptingOptedOut(args: readonly string[]): boolean {
  return NON_INTERACTIVE_FLAGS.some((flag) => args.includes(flag));
}

/**
 * True when prompts should run for this invocation: a real terminal, and no
 * explicit opt-out.
 */
export function promptingEnabled(args: readonly string[]): boolean {
  return interactivePromptsAvailable() && !promptingOptedOut(args);
}
