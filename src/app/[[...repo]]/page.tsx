import { notFound } from "next/navigation";
import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { DocsShell } from "@/widgets/docs-shell/docs-shell";
import { RepositorySearchShell } from "@/widgets/repository-search-shell/repository-search-shell";

interface PageProps {
  params: { repo?: string[] };
  searchParams: { version?: string };
}

export function generateStaticParams() {
  return [{ repo: [] }];
}

export default async function DocsPage({ params, searchParams }: PageProps) {
  const { repo } = params;
  const { version } = searchParams;
  const data = await loadDocsData(repo, version);

  const repositoryNotUsingGitPageDocs = Boolean(data.activeRepository.requested && data.activeRepository.hasGitPageDocs === false);
  if (!data.showRepositorySearchHome && !repositoryNotUsingGitPageDocs && !data.config.routes.length) {
    notFound();
  }

  if (data.showRepositorySearchHome || repositoryNotUsingGitPageDocs) {
    return <RepositorySearchShell data={data} repositoryNotUsingGitPageDocs={repositoryNotUsingGitPageDocs} />;
  }

  return <DocsShell data={data} />;
}
