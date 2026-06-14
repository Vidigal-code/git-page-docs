import { loadDocsData } from "@/entities/docs/server";
import { parseRepoAndVersion } from "@/shared/lib/runtime/parse-owner-repo";

export interface DocsRouteDataResult {
  data: Awaited<ReturnType<typeof loadDocsData>>;
  repositoryNotUsingGitPageDocs: boolean;
  shouldShowRepositorySearch: boolean;
}

export async function loadDocsRouteData(repoSlug: string[] | undefined): Promise<DocsRouteDataResult> {
  const { owner, repo: repoName, version } = parseRepoAndVersion(repoSlug);
  const slugForLoad = owner && repoName ? [owner, repoName] : undefined;
  const data = await loadDocsData(slugForLoad, version);

  const repositoryNotUsingGitPageDocs = Boolean(
    data.activeRepository.requested && data.activeRepository.hasGitPageDocs === false,
  );
  const shouldShowRepositorySearch =
    data.showRepositorySearchHome || repositoryNotUsingGitPageDocs || !data.config.routes.length;

  return {
    data,
    repositoryNotUsingGitPageDocs,
    shouldShowRepositorySearch,
  };
}
