import { notFound } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import { loadDocsData } from "@/entities/docs/api/load-docs-data";
import { DocsShell } from "@/widgets/docs-shell/docs-shell";
import { RepositorySearchShell } from "@/widgets/repository-search-shell/repository-search-shell";

interface PageProps {
  params: Promise<{ repo?: string[] }>;
  searchParams?: Promise<{ version?: string }>;
}

// For static export, avoid awaiting searchParams (triggers dynamic)
export const dynamic = "force-static";

export async function generateStaticParams() {
  const params: { repo: string[] }[] = [{ repo: [] }];
  try {
    const configPath = path.join(process.cwd(), "gitpagedocs/config.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    if (config?.site?.ProjectLink) {
      const parsed = new URL(config.site.ProjectLink);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        params.push({ repo: [parts[0], parts[1]] });
      }
    }
    const knownRepos = [["Vidigal-code", "git-page-link-create"]];
    for (const [owner, repo] of knownRepos) {
      if (!params.some((p) => p.repo[0] === owner && p.repo[1] === repo)) {
        params.push({ repo: [owner, repo] });
      }
    }
  } catch {}
  return params;
}

export default async function DocsPage({ params, searchParams }: PageProps) {
  const { repo } = await params;
  const data = await loadDocsData(repo, undefined);

  const repositoryNotUsingGitPageDocs = Boolean(data.activeRepository.requested && data.activeRepository.hasGitPageDocs === false);
  if (!data.showRepositorySearchHome && !repositoryNotUsingGitPageDocs && !data.config.routes.length) {
    notFound();
  }

  if (data.showRepositorySearchHome || repositoryNotUsingGitPageDocs) {
    return <RepositorySearchShell data={data} repositoryNotUsingGitPageDocs={repositoryNotUsingGitPageDocs} />;
  }

  return <DocsShell data={data} />;
}
