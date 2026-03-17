import type { GitPageDocsConfig } from "@/entities/docs/model/types";
import { readRemoteJsonFromRepo } from "./io/remote-fetcher";
import { parseOwnerRepoFromRenderingUrl } from "./utils/url-utils";

const DEFAULT_CONFIG_PATH = "gitpagedocs/config.json";

function isLocalRuntime(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.VERCEL_ENV === "development";
}

export interface ResolvedDocsSource {
  source: "local" | "remote";
  owner: string | undefined;
  repo: string | undefined;
  config: GitPageDocsConfig;
  hasGitPageDocs: boolean;
  showRepositorySearchHome: boolean;
  isRepositoryRouteRequest: boolean;
}

export async function resolveDocsSource(
  slug: string[] | undefined,
  localConfig: GitPageDocsConfig,
  selectedVersionId?: string,
): Promise<ResolvedDocsSource> {
  const local = isLocalRuntime();
  const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
  const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
  const repositorySearchEnabled = isGithubPagesBuild || repositorySearchEnabledByEnv;
  const renderingRef = parseOwnerRepoFromRenderingUrl(localConfig.site.rendering);
  const projectRef = parseOwnerRepoFromRenderingUrl(localConfig.site.ProjectLink || "");
  const buildRepositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1]?.toLowerCase();
  const isOfficialSearchAggregatorRepo =
    renderingRef.repo?.toLowerCase() === "git-page-docs" ||
    projectRef.repo?.toLowerCase() === "git-page-docs" ||
    buildRepositoryName === "git-page-docs";

  const requestedOwner = slug?.[0];
  const requestedRepo = slug?.[1];
  const isRepositoryRouteRequest = Boolean(repositorySearchEnabled && requestedOwner && requestedRepo);
  const repositorySearchHomeEnabled = (() => {
    if (isGithubPagesBuild && !isOfficialSearchAggregatorRepo) {
      return false;
    }
    if (typeof localConfig.site.repositorySearchHome === "boolean") {
      return localConfig.site.repositorySearchHome;
    }
    if (isGithubPagesBuild) {
      return isOfficialSearchAggregatorRepo;
    }
    return true;
  })();
  const showRepositorySearchHome = Boolean(
    repositorySearchEnabled && repositorySearchHomeEnabled && !requestedOwner && !requestedRepo && !selectedVersionId,
  );
  const renderingFallback = parseOwnerRepoFromRenderingUrl(localConfig.site.rendering);
  const projectLinkFallback = parseOwnerRepoFromRenderingUrl(localConfig.site.ProjectLink || "");

  let source: "local" | "remote" = "local";
  let owner: string | undefined;
  let repo: string | undefined;

  const isLocalRepo = Boolean(
    requestedOwner &&
    requestedRepo &&
    ((requestedOwner.toLowerCase() === projectLinkFallback.owner?.toLowerCase() &&
      requestedRepo.toLowerCase() === projectLinkFallback.repo?.toLowerCase()) ||
      (requestedOwner.toLowerCase() === renderingFallback.owner?.toLowerCase() &&
        requestedRepo.toLowerCase() === renderingFallback.repo?.toLowerCase())),
  );

  if (repositorySearchEnabled && requestedOwner && requestedRepo && !isLocalRepo) {
    source = "remote";
    owner = requestedOwner;
    repo = requestedRepo;
  }

  let config = localConfig;
  let hasGitPageDocs = true;

  if (isLocalRepo) {
    source = "local";
    owner = requestedOwner;
    repo = requestedRepo;
  }
  if (owner && repo) {
    const remoteConfig = await readRemoteJsonFromRepo<GitPageDocsConfig>(owner, repo, DEFAULT_CONFIG_PATH);
    if (remoteConfig) {
      config = remoteConfig;
    } else if (isRepositoryRouteRequest) {
      hasGitPageDocs = false;
      config = localConfig;
    }
  }

  return {
    source,
    owner,
    repo,
    config,
    hasGitPageDocs,
    showRepositorySearchHome,
    isRepositoryRouteRequest,
  };
}
