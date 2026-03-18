import { DocsShell } from "@/widgets/docs-shell";
import { loadDocsRouteData } from "@/processes/docs-loading";
import { RepositorySearchScreen } from "./repository-search-screen";

export async function DocsRoutePage({ repoSlug }: { repoSlug: string[] | undefined }) {
  const routeData = await loadDocsRouteData(repoSlug);

  if (routeData.shouldShowRepositorySearch) {
    return (
      <RepositorySearchScreen
        data={routeData.data}
        repositoryNotUsingGitPageDocs={routeData.repositoryNotUsingGitPageDocs}
      />
    );
  }

  return <DocsShell data={routeData.data} />;
}
