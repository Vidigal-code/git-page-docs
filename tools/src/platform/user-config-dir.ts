import os from "node:os";
import path from "node:path";

/** Environment variable that overrides the resolved user config directory. */
export const USER_CONFIG_DIR_ENV_VAR = "GITPAGEDOCS_CONFIG_DIR";

/** Directory name that holds gitpagedocs user-level configuration. */
export const USER_CONFIG_APP_DIR = "gitpagedocs";

export interface UserConfigDirContext {
  /** Platform id (defaults to `process.platform`). */
  platform?: NodeJS.Platform;
  /** Environment map (defaults to `process.env`). */
  env?: NodeJS.ProcessEnv;
  /** User home directory (defaults to `os.homedir()`). */
  homeDir?: string;
}

/**
 * Resolve the per-user gitpagedocs configuration directory following each
 * platform's convention:
 *
 * - Windows: `%APPDATA%\gitpagedocs`
 * - macOS: `~/Library/Application Support/gitpagedocs`
 * - Linux and others: `$XDG_CONFIG_HOME/gitpagedocs` or `~/.config/gitpagedocs`
 *
 * The `GITPAGEDOCS_CONFIG_DIR` environment variable overrides all of the above.
 */
export function resolveUserConfigDir(context: UserConfigDirContext = {}): string {
  const env = context.env ?? process.env;
  const override = env[USER_CONFIG_DIR_ENV_VAR]?.trim();
  if (override) return path.resolve(override);

  const platform = context.platform ?? process.platform;
  const homeDir = context.homeDir ?? os.homedir();

  if (platform === "win32") {
    const appData = env.APPDATA?.trim() || path.join(homeDir, "AppData", "Roaming");
    return path.join(appData, USER_CONFIG_APP_DIR);
  }

  if (platform === "darwin") {
    return path.join(homeDir, "Library", "Application Support", USER_CONFIG_APP_DIR);
  }

  const configHome = env.XDG_CONFIG_HOME?.trim() || path.join(homeDir, ".config");
  return path.join(configHome, USER_CONFIG_APP_DIR);
}
