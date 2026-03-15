import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
const emulateGithubPagesRuntime = isGithubPagesBuild || repositorySearchEnabledByEnv;
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "git-page-docs";
const configuredPagesPathRaw = process.env.GITPAGEDOCS_PAGES_PATH?.trim() ?? "";
const configuredPagesPath = configuredPagesPathRaw
  ? `/${configuredPagesPathRaw.replace(/^\/+|\/+$/g, "")}`
  : "";
const basePath = `/${repositoryName}${configuredPagesPath}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubPagesBuild ? "export" : undefined,
  trailingSlash: emulateGithubPagesRuntime,
  basePath: emulateGithubPagesRuntime ? basePath : undefined,
  assetPrefix: emulateGithubPagesRuntime ? basePath : undefined,
  env: {
    NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH: emulateGithubPagesRuntime ? basePath : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
