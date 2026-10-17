import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it.each([
  { github: "true", search: "true", repository: "owner/project", docs: "/docs/", override: undefined, expected: "/project/docs" },
  { github: "true", search: "true", repository: "owner/project", docs: "docs", override: "", expected: undefined },
  { github: "true", search: "true", repository: "owner/project", docs: "docs", override: "/", expected: undefined },
  { github: "true", search: "true", repository: "owner/owner.github.io", docs: "", override: undefined, expected: undefined },
  { github: "true", search: "true", repository: "owner/owner.github.io", docs: "//docs//", override: undefined, expected: "/docs" },
  { github: "false", search: "false", repository: "owner/project", docs: "/docs/", override: undefined, expected: "/docs" },
  { github: "false", search: "false", repository: "owner/project", docs: "", override: undefined, expected: undefined },
  { github: "true", search: "true", repository: "owner/project", docs: "docs", override: "/custom", expected: "/custom" },
])("preserves the public base path for $repository ($override, $docs)", async ({ github, search, repository, docs, override, expected }) => {
  vi.stubEnv("GITHUB_ACTIONS", github);
  vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", search);
  vi.stubEnv("GITHUB_REPOSITORY", repository);
  vi.stubEnv("GITPAGEDOCS_PATH", docs);
  vi.stubEnv("GITPAGEDOCS_BASE_PATH", override);
  const { default: config } = await import("../next.config");
  expect(config.basePath).toBe(expected);
  expect(config.env?.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH).toBe(expected ?? "");
});
