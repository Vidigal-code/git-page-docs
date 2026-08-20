import { describe, it, expect } from "vitest";
import { parseCliOptions } from "../presentation/options/parser";
import { buildRootConfig } from "../builders/root-config-builder.mjs";
import { DEFAULT_LAYOUTS_DIR } from "../contracts/layouts-paths.mjs";

const NO_ENV = {} as NodeJS.ProcessEnv;

/** Build an argv the parser understands (it slices the first two entries). */
function argv(...args: string[]): string[] {
  return ["node", "gitpagedocs", ...args];
}

function siteOf(options: Parameters<typeof buildRootConfig>[0]) {
  return buildRootConfig(options).site;
}

describe("parseCliOptions layouts folder", () => {
  it("defaults to the standalone layouts home", () => {
    expect(parseCliOptions(argv(), NO_ENV).layoutsDir).toBe(DEFAULT_LAYOUTS_DIR);
  });

  it("accepts --layouts-dir with a separate value", () => {
    expect(parseCliOptions(argv("--layouts-dir", "meus-temas"), NO_ENV).layoutsDir).toBe("meus-temas");
  });

  it("accepts --layouts-dir=value", () => {
    expect(parseCliOptions(argv("--layouts-dir=meus-temas"), NO_ENV).layoutsDir).toBe("meus-temas");
  });

  it("normalizes a supplied folder", () => {
    expect(parseCliOptions(argv("--layouts-dir", "/temas/"), NO_ENV).layoutsDir).toBe("temas");
  });

  it("never mistakes the layouts folder for an owner or repo", () => {
    const options = parseCliOptions(argv("--layouts-dir=temas"), NO_ENV);
    expect(options.githubOwner).toBe("");
    expect(options.githubRepo).toBe("");
  });
});

describe("parseCliOptions explicit flags", () => {
  it("marks nothing explicit for a bare invocation", () => {
    expect(parseCliOptions(argv(), NO_ENV).explicit).toEqual({
      useLocalLayoutConfig: false,
      layoutsDir: false,
      githubOwner: false,
      githubRepo: false,
      outputDir: false,
    });
  });

  it("marks the values the user actually supplied", () => {
    const options = parseCliOptions(argv("--layoutconfig", "--layouts-dir", "temas", "--owner", "acme"), NO_ENV);
    expect(options.explicit.useLocalLayoutConfig).toBe(true);
    expect(options.explicit.layoutsDir).toBe(true);
    expect(options.explicit.githubOwner).toBe(true);
    expect(options.explicit.githubRepo).toBe(false);
  });
});

describe("buildRootConfig layout references", () => {
  it("points at the official layouts when local layouts are off", () => {
    const site = siteOf({ useLocalLayoutConfig: false });
    expect(site.layoutsConfigPathOficial).toBe(true);
    expect(site.layoutsConfigPath).toBe("");
    expect(site.layoutsConfigPathTemplates).toBe("");
  });

  it("references the repository layouts folder when local layouts are on", () => {
    const site = siteOf({
      useLocalLayoutConfig: true,
      githubOwner: "acme",
      githubRepo: "docs",
      layoutsDir: "gitpagelayouts",
    });
    expect(site.layoutsConfigPathOficial).toBe(false);
    expect(site.layoutsConfigPath).toBe(
      "https://github.com/acme/docs/blob/HEAD/gitpagelayouts/layoutsConfig.json",
    );
    expect(site.layoutsConfigPathTemplates).toBe(
      "https://github.com/acme/docs/blob/HEAD/gitpagelayouts/templates",
    );
  });

  it("honours a custom layouts folder in the reference", () => {
    const site = siteOf({
      useLocalLayoutConfig: true,
      githubOwner: "acme",
      githubRepo: "docs",
      layoutsDir: "meus-temas",
    });
    expect(site.layoutsConfigPath).toBe(
      "https://github.com/acme/docs/blob/HEAD/meus-temas/layoutsConfig.json",
    );
  });

  it("falls back to a repo-relative reference without an owner and repo", () => {
    const site = siteOf({ useLocalLayoutConfig: true, layoutsDir: "gitpagelayouts" });
    expect(site.layoutsConfigPath).toBe("gitpagelayouts/layoutsConfig.json");
    expect(site.layoutsConfigPathTemplates).toBe("gitpagelayouts/templates");
  });

  it("never writes the legacy folder into the generated reference", () => {
    const site = siteOf({ useLocalLayoutConfig: true, githubOwner: "acme", githubRepo: "docs" });
    expect(String(site.layoutsConfigPath)).not.toContain("gitpagedocs/layouts");
  });
});
