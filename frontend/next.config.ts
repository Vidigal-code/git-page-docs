import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

// Next 15's transpiled config module has no filename for relative resolution.
const requireConfig = createRequire(__filename);
const { preparePdfAssets } = requireConfig("./build/prepare-pdf-assets.ts") as typeof import("./build/prepare-pdf-assets");
const { trimSlashes } = requireConfig("./src/shared/lib/base-path.ts") as typeof import("./src/shared/lib/base-path");

preparePdfAssets(path.resolve(__dirname, ".."));

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
const emulateGithubPagesRuntime = isGithubPagesBuild || repositorySearchEnabledByEnv;
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "git-page-docs";
const isUserPage = repositoryName.toLowerCase().endsWith(".github.io");

const docsPathSegment = trimSlashes(process.env.GITPAGEDOCS_PATH?.trim() ?? "");

// Local path: only when GITPAGEDOCS_REPOSITORY_SEARCH=false and GITPAGEDOCS_PATH is set
const isLocalMode = !repositorySearchEnabledByEnv && !isGithubPagesBuild;

function resolveBasePath(): string | undefined {
  const override = process.env.GITPAGEDOCS_BASE_PATH;
  if (override !== undefined) return override === "/" || override === "" ? undefined : override;
  const docsBasePath = docsPathSegment ? `/${docsPathSegment}` : undefined;
  if (isLocalMode || isUserPage) return docsBasePath;
  return `/${repositoryName}` + (docsBasePath ?? "");
}

const basePath = resolveBasePath();

// A second dev server (E2E repository-search mode) needs its own build folder.
const distDir = process.env.GITPAGEDOCS_DIST_DIR?.trim() || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir,
  transpilePackages: ["@gitpagedocs/tools"],
  output: isGithubPagesBuild ? "export" : undefined,
  trailingSlash: emulateGithubPagesRuntime,
  basePath: basePath ?? undefined,
  assetPrefix: basePath ?? undefined,
  env: {
    NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH: basePath ?? "",
    NEXT_PUBLIC_GITPAGEDOCS_REPOSITORY_SEARCH: repositorySearchEnabledByEnv ? "true" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
