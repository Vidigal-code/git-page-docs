import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "git-page-docs";
const basePath = `/${repositoryName}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubPagesBuild ? "export" : undefined,
  trailingSlash: isGithubPagesBuild,
  basePath,
  assetPrefix: isGithubPagesBuild ? basePath : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
