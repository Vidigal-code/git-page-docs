import { describe, it, expect } from "vitest";
import { parseCliOptions } from "../../presentation/options/parser";
import { DEFAULTS } from "../../presentation/options/schema";
import { DEFAULT_LAYOUTS_DIR } from "../../contracts/layouts-paths.mjs";

const NO_ENV = {} as NodeJS.ProcessEnv;

/** process.argv shape: the parser drops the runtime and script entries. */
function argv(...args: string[]): string[] {
  return ["node", "gitpagedocs", ...args];
}

describe("parseCliOptions value options", () => {
  it("reads `--name value` and `--name=value` forms", () => {
    expect(parseCliOptions(argv("--owner", "acme", "--repo=docs"), NO_ENV)).toMatchObject({
      githubOwner: "acme",
      githubRepo: "docs",
    });
  });

  it("treats a value option followed by another flag, or at the end, as empty", () => {
    expect(parseCliOptions(argv("--owner", "--repo", "docs"), NO_ENV).githubOwner).toBe("");
    expect(parseCliOptions(argv("--owner"), NO_ENV).githubOwner).toBe("");
  });

  it("trims values", () => {
    const options = parseCliOptions(argv("--path", "  docs  ", "--output=  out "), NO_ENV);
    expect(options.docsPath).toBe("docs");
    expect(options.basePath).toBe("docs");
    expect(options.outputDir).toBe("out");
  });

  it("uses bare `--<owner> --<repo>` as an owner/repo fallback", () => {
    const options = parseCliOptions(argv("--acme", "--docs"), NO_ENV);
    expect(options.githubOwner).toBe("acme");
    expect(options.githubRepo).toBe("docs");
    expect(options.explicit.githubOwner).toBe(true);
    expect(options.explicit.githubRepo).toBe(true);
  });

  it("never lets the fallback override an explicit owner", () => {
    const options = parseCliOptions(argv("--owner", "explicit", "--first", "--second"), NO_ENV);
    expect(options.githubOwner).toBe("explicit");
    expect(options.githubRepo).toBe("second");
  });

  it("ignores known flags, value options and a bare `--` when picking the fallback", () => {
    const options = parseCliOptions(
      argv("--build", "--search=true", "--output", "x", "--layouts-dir=l", "--path=p", "--", "--only"),
      NO_ENV,
    );
    expect(options.githubOwner).toBe("only");
    expect(options.githubRepo).toBe("");
  });
});

describe("parseCliOptions modes and verbs", () => {
  it("defaults to config-only with the documented defaults", () => {
    expect(parseCliOptions(argv(), NO_ENV)).toEqual({
      isBuild: false,
      isServe: false,
      mode: "config-only",
      aiCommand: undefined,
      outputDir: DEFAULTS.outputDir,
      layoutsDir: DEFAULT_LAYOUTS_DIR,
      useLocalLayoutConfig: false,
      shouldPush: false,
      githubOwner: "",
      githubRepo: "",
      docsPath: "",
      basePath: "",
      repositorySearch: undefined,
      isInteractive: false,
      hasArgs: false,
      explicit: {
        useLocalLayoutConfig: false,
        layoutsDir: false,
        githubOwner: false,
        githubRepo: false,
        outputDir: false,
      },
    });
  });

  it.each([
    [["ai"], "ai", undefined],
    [["ai", "document"], "ai", "document"],
    [["--ai"], "ai", undefined],
    [["document"], "ai", "repo"],
    [["document", "file"], "ai", "file"],
    [["document:file"], "ai", "file"],
    [["--home"], "home", undefined],
    [["--full"], "full", undefined],
    [["deploy"], "config-only", undefined],
    [["pages"], "config-only", undefined],
  ])("%j -> mode %s, aiCommand %s", (args, mode, aiCommand) => {
    const options = parseCliOptions(argv(...args), NO_ENV);
    expect(options.mode).toBe(mode);
    expect(options.aiCommand).toBe(aiCommand);
  });

  it("ranks ai over home over full", () => {
    expect(parseCliOptions(argv("--ai", "--home", "--full"), NO_ENV).mode).toBe("ai");
    expect(parseCliOptions(argv("--home", "--full"), NO_ENV).mode).toBe("home");
  });

  it("maps deploy/pages/--push onto shouldPush", () => {
    expect(parseCliOptions(argv("deploy"), NO_ENV).shouldPush).toBe(true);
    expect(parseCliOptions(argv("pages"), NO_ENV).shouldPush).toBe(true);
    expect(parseCliOptions(argv("--push"), NO_ENV).shouldPush).toBe(true);
    expect(parseCliOptions(argv("--build"), NO_ENV).shouldPush).toBe(false);
  });

  it("reads the boolean flags", () => {
    const options = parseCliOptions(argv("--build", "--serve", "--layoutconfig", "-i"), NO_ENV);
    expect(options).toMatchObject({
      isBuild: true,
      isServe: true,
      useLocalLayoutConfig: true,
      isInteractive: true,
      hasArgs: true,
    });
    expect(parseCliOptions(argv("--interactive"), NO_ENV).isInteractive).toBe(true);
  });

  it("honours GITPAGEDOCS_BUILD=1 from the environment", () => {
    expect(parseCliOptions(argv(), { GITPAGEDOCS_BUILD: "1" }).isBuild).toBe(true);
    expect(parseCliOptions(argv(), { GITPAGEDOCS_BUILD: "0" }).isBuild).toBe(false);
  });
});

describe("parseCliOptions home defaults", () => {
  it("switches the output dir to the home default unless overridden", () => {
    expect(parseCliOptions(argv("--home"), NO_ENV).outputDir).toBe(DEFAULTS.home.outputDir);
    expect(parseCliOptions(argv("--home", "--output", "site"), NO_ENV).outputDir).toBe("site");
    expect(parseCliOptions(argv("--home", "--output", "site"), NO_ENV).explicit.outputDir).toBe(true);
  });

  it.each([
    [["--search", "true"], true],
    [["--search=false"], false],
    [["--home"], DEFAULTS.home.repositorySearch],
    [["--home", "--search", "maybe"], DEFAULTS.home.repositorySearch],
    [["--search", "maybe"], undefined],
    [[], undefined],
  ])("%j -> repositorySearch %s", (args, expected) => {
    expect(parseCliOptions(argv(...args), NO_ENV).repositorySearch).toBe(expected);
  });
});
