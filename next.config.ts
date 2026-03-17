import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
const emulateGithubPagesRuntime = isGithubPagesBuild || repositorySearchEnabledByEnv;
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "git-page-docs";
const basePathFromEnv = process.env.GITPAGEDOCS_BASE_PATH;

// Local path: only when GITPAGEDOCS_REPOSITORY_SEARCH=false and GITPAGEDOCS_PATH is set
const isLocalMode = !repositorySearchEnabledByEnv && !isGithubPagesBuild;
const localPathRaw = process.env.GITPAGEDOCS_PATH?.trim();
const localBasePath =
  isLocalMode && localPathRaw
    ? "/" + localPathRaw.replace(/^\/+|\/+$/g, "")
    : undefined;

const basePath =
  localBasePath ??
  (basePathFromEnv !== undefined ? basePathFromEnv : emulateGithubPagesRuntime ? `/${repositoryName}` : undefined);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubPagesBuild ? "export" : undefined,
  trailingSlash: emulateGithubPagesRuntime,
  basePath: basePath ?? undefined,
  assetPrefix: basePath ?? undefined,
  env: {
    NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH: basePath ?? "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
