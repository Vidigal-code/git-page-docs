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

function parseOwnerRepoFromUrl(input: string | undefined): { owner?: string; repo?: string } {
  if (!input) return {};
  try {
    const normalized = input
      .replace(/^git\+/, "")
      .replace(/^git@github\.com:/, "https://github.com/")
      .replace(/\.git$/, "");
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    return {};
  }
  return {};
}

function parseRepoAndVersion(repoSlug: string[] | undefined): { owner?: string; repo?: string; version?: string } {
  if (!repoSlug?.length) return {};
  if (repoSlug.length >= 2 && repoSlug[0] === "v" && repoSlug[1]) {
    return { version: repoSlug[1] };
  }
  if (repoSlug.length >= 4 && repoSlug[2] === "v" && repoSlug[3]) {
    return { owner: repoSlug[0], repo: repoSlug[1], version: repoSlug[3] };
  }
  if (repoSlug.length >= 2) {
    return { owner: repoSlug[0], repo: repoSlug[1] };
  }
  return {};
}

export async function generateStaticParams() {
  const params: { repo: string[] }[] = [{ repo: [] }];
  try {
    const configPath = path.join(process.cwd(), "gitpagedocs/config.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    const versions = config?.VersionControl?.versions?.map((v: { id: string }) => v.id) ?? [];
    for (const vid of versions) {
      if (!params.some((p) => p.repo[0] === "v" && p.repo[1] === vid)) {
        params.push({ repo: ["v", vid] });
      }
    }
    const addRepoWithVersions = (owner: string, repo: string) => {
      if (!params.some((p) => p.repo[0] === owner && p.repo[1] === repo)) {
        params.push({ repo: [owner, repo] });
      }
      for (const vid of versions) {
        if (!params.some((p) => p.repo[0] === owner && p.repo[1] === repo && p.repo[2] === "v" && p.repo[3] === vid)) {
          params.push({ repo: [owner, repo, "v", vid] });
        }
      }
    };
    if (config?.site?.ProjectLink) {
      const fromProjectLink = parseOwnerRepoFromUrl(config.site.ProjectLink);
      if (fromProjectLink.owner && fromProjectLink.repo) {
        addRepoWithVersions(fromProjectLink.owner, fromProjectLink.repo);
      }
    }

    // Ensure the official repository route is pre-rendered even when ProjectLink is not set.
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageRaw = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageRaw) as { repository?: { url?: string } | string; homepage?: string };
    const repositoryUrl =
      typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;
    const fromRepository = parseOwnerRepoFromUrl(repositoryUrl);
    if (fromRepository.owner && fromRepository.repo) {
      addRepoWithVersions(fromRepository.owner, fromRepository.repo);
    }
    const fromHomepage = parseOwnerRepoFromUrl(packageJson.homepage);
    if (fromHomepage.owner && fromHomepage.repo) {
      addRepoWithVersions(fromHomepage.owner, fromHomepage.repo);
    }
  } catch {}
  return params;
}

export default async function DocsPage({ params }: PageProps) {
  const { repo } = await params;
  const { owner, repo: repoName, version } = parseRepoAndVersion(repo);
  const slugForLoad = owner && repoName ? [owner, repoName] : undefined;
  const data = await loadDocsData(slugForLoad, version);

  const repositoryNotUsingGitPageDocs = Boolean(data.activeRepository.requested && data.activeRepository.hasGitPageDocs === false);
  if (data.showRepositorySearchHome || repositoryNotUsingGitPageDocs || !data.config.routes.length) {
    return <RepositorySearchShell data={data} repositoryNotUsingGitPageDocs={repositoryNotUsingGitPageDocs} />;
  }

  return <DocsShell data={data} />;
}
