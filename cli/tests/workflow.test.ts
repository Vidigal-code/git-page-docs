import { describe, it, expect, vi } from "vitest";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as workflowRuntime from "../runtime/workflow.mjs";

/** Public contract of cli/runtime/workflow.mjs. */
interface WorkflowRuntime {
  ensureGitHubPagesWorkflow(
    getCurrentGitBranch: () => string,
    writeText: (target: string, content: string) => Promise<void> | void,
    docsPath?: string,
  ): Promise<void>;
}

const { ensureGitHubPagesWorkflow } = workflowRuntime as WorkflowRuntime;

const WORKFLOW_PATH = ".github/workflows/gitpagedocs-pages.yml";
const BUILD_STEP = "Build static site with target repository path";
const RELOCATE_STEP = "Relocate output to custom docs path";
const REDIRECT_STEP = "Redirect site root to custom docs path";

async function renderWorkflow(docsPath?: string, branch = "main"): Promise<{ target: string; content: string }> {
  const writeText = vi.fn<(target: string, content: string) => Promise<void>>().mockResolvedValue(undefined);
  await ensureGitHubPagesWorkflow(() => branch, writeText, docsPath);
  expect(writeText).toHaveBeenCalledTimes(1);
  const [target, content] = writeText.mock.calls[0];
  return { target, content };
}

describe("ensureGitHubPagesWorkflow", () => {
  it("writes the workflow to the fixed GitHub Actions path", async () => {
    const { target } = await renderWorkflow("/docs/");
    expect(target).toBe(WORKFLOW_PATH);
  });

  it("adds the custom docs path steps for a slash-wrapped path", async () => {
    const { content } = await renderWorkflow("/docs/");
    expect(content).toContain('GITPAGEDOCS_PATH: "docs"');
    expect(content).toContain(BUILD_STEP);
    expect(content).toContain(RELOCATE_STEP);
    expect(content).toContain(REDIRECT_STEP);
    expect(content).toContain("mkdir -p .gitpagedocs-runtime/out_new/docs");
    expect(content).toContain("mv .gitpagedocs-runtime/out/* .gitpagedocs-runtime/out_new/docs/");
    expect(content).toContain('url=./docs/"');
    expect(content).toContain('<a href="./docs/">Documentation</a>');
  });

  it("strips runs of slashes and keeps dots, underscores and dashes", async () => {
    const { content } = await renderWorkflow("///nested.v1_2-x///");
    expect(content).toContain('GITPAGEDOCS_PATH: "nested.v1_2-x"');
    expect(content).toContain("mkdir -p .gitpagedocs-runtime/out_new/nested.v1_2-x");
    expect(content).toContain('url=./nested.v1_2-x/"');
  });

  it("emits the custom path steps exactly once", async () => {
    const { content } = await renderWorkflow("docs");
    expect(content.match(/GITPAGEDOCS_PATH/g)).toHaveLength(1);
    expect(content.match(new RegExp(BUILD_STEP, "g"))).toHaveLength(1);
  });

  it.each([
    ["a parent traversal", "../evil"],
    ["a path with whitespace", "a b"],
    ["a nested path", "docs/sub"],
    ["only slashes", "///"],
    ["an empty string", ""],
    ["blank spaces", "   "],
    ["undefined", undefined],
  ])("falls back to the plain build step for %s", async (_label, docsPath) => {
    const { target, content } = await renderWorkflow(docsPath);
    expect(target).toBe(WORKFLOW_PATH);
    expect(content).toContain(BUILD_STEP);
    expect(content).not.toContain("GITPAGEDOCS_PATH");
    expect(content).not.toContain(RELOCATE_STEP);
    expect(content).not.toContain(REDIRECT_STEP);
    expect(content).not.toContain("out_new");
  });

  it("ignores a non-string docs path", async () => {
    const { content } = await renderWorkflow(42 as unknown as string);
    expect(content).toContain(BUILD_STEP);
    expect(content).not.toContain("GITPAGEDOCS_PATH");
  });

  it("uses the docs path default when the argument is omitted", async () => {
    const writeText = vi.fn<(target: string, content: string) => Promise<void>>().mockResolvedValue(undefined);
    await ensureGitHubPagesWorkflow(() => "main", writeText);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][1]).not.toContain("GITPAGEDOCS_PATH");
  });

  it("targets the branch reported by the getter", async () => {
    const main = await renderWorkflow("/docs/", "main");
    expect(main.content).toContain('branches: ["main"]');

    const release = await renderWorkflow(undefined, "release/2.x");
    expect(release.content).toContain('branches: ["release/2.x"]');
    expect(release.content).not.toContain('branches: ["main"]');
  });

  it("calls the branch getter without arguments", async () => {
    const getBranch = vi.fn(() => "develop");
    const writeText = vi.fn<(target: string, content: string) => Promise<void>>().mockResolvedValue(undefined);
    await ensureGitHubPagesWorkflow(getBranch, writeText, "");
    expect(getBranch).toHaveBeenCalledTimes(1);
    expect(getBranch.mock.calls[0]).toHaveLength(0);
    expect(writeText.mock.calls[0][1]).toContain('branches: ["develop"]');
  });

  it("keeps the fixed pipeline skeleton around the build steps", async () => {
    const { content } = await renderWorkflow("/docs/");
    expect(content.startsWith("name: Deploy GitPageDocs\n")).toBe(true);
    expect(content).toContain("workflow_dispatch:");
    expect(content).toContain('GITPAGEDOCS_REPOSITORY_SEARCH: "true"');
    expect(content).toContain("git clone --depth 1 https://github.com/Vidigal-code/git-page-docs.git .gitpagedocs-runtime");
    expect(content).toContain("pnpm install --frozen-lockfile");
    expect(content).toContain("uses: actions/upload-pages-artifact@v3");
    expect(content).toContain("uses: actions/deploy-pages@v4");
    expect(content.indexOf("Install runtime dependencies")).toBeLessThan(content.indexOf(BUILD_STEP));
    expect(content.indexOf(BUILD_STEP)).toBeLessThan(content.indexOf("Add .nojekyll"));
    expect(content.endsWith("\n")).toBe(true);
  });

  it("propagates a writer failure", async () => {
    const writeText = vi.fn<(target: string, content: string) => Promise<void>>().mockRejectedValue(new Error("disk full"));
    await expect(ensureGitHubPagesWorkflow(() => "main", writeText, "docs")).rejects.toThrow("disk full");
  });
});
