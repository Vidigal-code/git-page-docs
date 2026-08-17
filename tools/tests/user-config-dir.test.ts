import { describe, it, expect } from "vitest";
import path from "node:path";
import {
  resolveUserConfigDir,
  USER_CONFIG_APP_DIR,
  USER_CONFIG_DIR_ENV_VAR,
} from "../src/platform/user-config-dir";

const HOME = path.join(path.parse(process.cwd()).root, "home", "tester");

describe("resolveUserConfigDir", () => {
  it("uses %APPDATA% on Windows", () => {
    const appData = path.join(HOME, "AppData", "Roaming");
    const dir = resolveUserConfigDir({ platform: "win32", env: { APPDATA: appData }, homeDir: HOME });
    expect(dir).toBe(path.join(appData, USER_CONFIG_APP_DIR));
  });

  it("falls back to <home>/AppData/Roaming when %APPDATA% is unset", () => {
    const dir = resolveUserConfigDir({ platform: "win32", env: {}, homeDir: HOME });
    expect(dir).toBe(path.join(HOME, "AppData", "Roaming", USER_CONFIG_APP_DIR));
  });

  it("uses ~/Library/Application Support on macOS", () => {
    const dir = resolveUserConfigDir({ platform: "darwin", env: {}, homeDir: HOME });
    expect(dir).toBe(path.join(HOME, "Library", "Application Support", USER_CONFIG_APP_DIR));
  });

  it("uses $XDG_CONFIG_HOME on Linux when set", () => {
    const xdg = path.join(HOME, "xdg-config");
    const dir = resolveUserConfigDir({ platform: "linux", env: { XDG_CONFIG_HOME: xdg }, homeDir: HOME });
    expect(dir).toBe(path.join(xdg, USER_CONFIG_APP_DIR));
  });

  it("falls back to ~/.config on Linux when $XDG_CONFIG_HOME is unset", () => {
    const dir = resolveUserConfigDir({ platform: "linux", env: {}, homeDir: HOME });
    expect(dir).toBe(path.join(HOME, ".config", USER_CONFIG_APP_DIR));
  });

  it("honors the GITPAGEDOCS_CONFIG_DIR override on every platform", () => {
    const override = path.join(HOME, "custom-config");
    for (const platform of ["win32", "darwin", "linux"] as const) {
      const dir = resolveUserConfigDir({
        platform,
        env: { [USER_CONFIG_DIR_ENV_VAR]: override },
        homeDir: HOME,
      });
      expect(dir).toBe(path.resolve(override));
    }
  });

  it("ignores a blank GITPAGEDOCS_CONFIG_DIR override", () => {
    const dir = resolveUserConfigDir({
      platform: "linux",
      env: { [USER_CONFIG_DIR_ENV_VAR]: "   " },
      homeDir: HOME,
    });
    expect(dir).toBe(path.join(HOME, ".config", USER_CONFIG_APP_DIR));
  });
});
