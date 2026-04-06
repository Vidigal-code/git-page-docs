import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
const emulateGithubPagesRuntime = isGithubPagesBuild || repositorySearchEnabledByEnv;
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "git-page-docs";
const isUserPage = repositoryName.toLowerCase().endsWith(".github.io");

const rawDocsPath = process.env.GITPAGEDOCS_PATH?.trim();
const docsPathSegment = rawDocsPath ? rawDocsPath.replace(/^\/+|\/+$/g, "") : "";

// Local path: only when GITPAGEDOCS_REPOSITORY_SEARCH=false and GITPAGEDOCS_PATH is set
const isLocalMode = !repositorySearchEnabledByEnv && !isGithubPagesBuild;

// Explicit base path definition taking precedence (interprets "/" and "" as root/undefined)
const explicitBasePath = "GITPAGEDOCS_BASE_PATH" in process.env
  ? (process.env.GITPAGEDOCS_BASE_PATH === "/" || process.env.GITPAGEDOCS_BASE_PATH === ""
    ? undefined
    : process.env.GITPAGEDOCS_BASE_PATH)
  : null;

const basePath =
  explicitBasePath ??
  (isLocalMode
    ? (docsPathSegment ? `/${docsPathSegment}` : undefined)
    : emulateGithubPagesRuntime
      ? (isUserPage
        ? (docsPathSegment ? `/${docsPathSegment}` : undefined)
        : `/${repositoryName}${docsPathSegment ? `/${docsPathSegment}` : ""}`)
      : undefined);

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
