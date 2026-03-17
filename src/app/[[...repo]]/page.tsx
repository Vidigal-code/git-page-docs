import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { parseRepoAndVersion } from "@/shared/lib/runtime/parse-owner-repo";
import { DocsShell } from "@/widgets/docs-shell/docs-shell";
import { RepositorySearchShell } from "@/widgets/repository-search-shell/repository-search-shell";
import { generateStaticParams as generateStaticParamsImpl } from "./lib/generate-static-params";

interface PageProps {
  params: Promise<{ repo?: string[] }>;
  searchParams?: Promise<{ version?: string }>;
}

export const dynamic = "force-static";

export const generateStaticParams = generateStaticParamsImpl;

export default async function DocsPage({ params }: PageProps) {
  const { repo } = await params;
  const { owner, repo: repoName, version } = parseRepoAndVersion(repo);
  const slugForLoad = owner && repoName ? [owner, repoName] : undefined;
  const data = await loadDocsData(slugForLoad, version);

  const repositoryNotUsingGitPageDocs = Boolean(
    data.activeRepository.requested && data.activeRepository.hasGitPageDocs === false,
  );
  if (data.showRepositorySearchHome || repositoryNotUsingGitPageDocs || !data.config.routes.length) {
    return <RepositorySearchShell data={data} repositoryNotUsingGitPageDocs={repositoryNotUsingGitPageDocs} />;
  }

  return <DocsShell data={data} />;
}
