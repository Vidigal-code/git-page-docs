import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as templates from "../../home/templates.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as writer from "../../home/home-file-writer.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as constants from "../../home/constants.mjs";

const { getEnvTemplate, getDockerfileTemplate, getReadmeTemplate } = templates as {
  getEnvTemplate(options: { repositorySearch?: boolean; basePath?: string }): string;
  getDockerfileTemplate(): string;
  getReadmeTemplate(): string;
};
const { writeHomeFiles } = writer as {
  writeHomeFiles(root: string, outputDir: string, options?: { repositorySearch?: boolean; basePath?: string }): Promise<void>;
};
const { STATIC_OUTPUT_DIR, ARTIFACTS_DIR } = constants as { STATIC_OUTPUT_DIR: string; ARTIFACTS_DIR: string };

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-home-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("home templates", () => {
  it("renders the .env with repository search off and the base path commented out by default", () => {
    const env = getEnvTemplate({});
    expect(env).toContain("GITPAGEDOCS_REPOSITORY_SEARCH=false");
    expect(env).toContain("# GITPAGEDOCS_PATH=gi-page-docs");
    expect(env).not.toMatch(/^GITPAGEDOCS_PATH=/m);
  });

  it("renders the .env with repository search on and an explicit base path", () => {
    const env = getEnvTemplate({ repositorySearch: true, basePath: "my-docs" });
    expect(env).toContain("GITPAGEDOCS_REPOSITORY_SEARCH=true");
    expect(env).toMatch(/^GITPAGEDOCS_PATH=my-docs$/m);
    expect(env).not.toContain("# GITPAGEDOCS_PATH=");
  });

  it("renders an nginx Dockerfile serving the folder", () => {
    const dockerfile = getDockerfileTemplate();
    expect(dockerfile.startsWith("FROM nginx:alpine\n")).toBe(true);
    expect(dockerfile).toContain("COPY . /usr/share/nginx/html");
    expect(dockerfile).toContain("EXPOSE 80");
  });

  it("renders a README whose commands run from the folder itself", () => {
    const readme = getReadmeTemplate();
    expect(readme.startsWith("# GitPageDocs Home\n")).toBe(true);
    expect(readme).toContain("npx serve .");
    expect(readme).toContain("docker build -t gitpagedocshome .");
    expect(readme).toContain("https://github.com/Vidigal-code/git-page-docs");
    expect(readme).not.toContain("cd ");
  });
});

describe("writeHomeFiles", () => {
  it("writes .env, Dockerfile and README into the output folder, creating it", async () => {
    const root = makeRoot();
    await writeHomeFiles(root, "dist", { repositorySearch: true, basePath: "docs" });

    expect(readFileSync(path.join(root, "dist", ".env"), "utf8")).toBe(getEnvTemplate({ repositorySearch: true, basePath: "docs" }));
    expect(readFileSync(path.join(root, "dist", "Dockerfile"), "utf8")).toBe(getDockerfileTemplate());
    expect(readFileSync(path.join(root, "dist", "README.md"), "utf8")).toBe(getReadmeTemplate());
  });

  it.each([".", "./"])("writes into the root itself for output dir %j with default options", async (outputDir) => {
    const root = makeRoot();
    await writeHomeFiles(root, outputDir);

    expect(readFileSync(path.join(root, ".env"), "utf8")).toBe(getEnvTemplate({}));
    expect(readFileSync(path.join(root, "Dockerfile"), "utf8")).toBe(getDockerfileTemplate());
    expect(readFileSync(path.join(root, "README.md"), "utf8")).toBe(getReadmeTemplate());
  });
});

describe("home constants", () => {
  it("points at the Next static export and the docs artifacts folder", () => {
    expect(STATIC_OUTPUT_DIR).toBe("frontend/out");
    expect(ARTIFACTS_DIR).toBe("gitpagedocs");
  });
});
