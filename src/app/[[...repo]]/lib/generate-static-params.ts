import { loadRootConfig } from "@/entities/docs/api/io/config-loader";
import { parseOwnerRepoFromUrl } from "@/shared/lib/runtime/parse-owner-repo";
import { getRepoFromPackage } from "@/shared/config/repo-from-package";

const DEFAULT_VERSIONS = ["1.0.0", "1.1.0", "1.1.1"];
const FALLBACK_OWNER = "Vidigal-code";
const FALLBACK_REPO = "git-page-docs";

export async function generateStaticParams(): Promise<{ repo: string[] }[]> {
  const params: { repo: string[] }[] = [{ repo: [] }];
  let versions: string[] = [...DEFAULT_VERSIONS];

  const addVersionPaths = (vids: string[]) => {
    for (const vid of vids) {
      if (!params.some((p) => p.repo?.length >= 2 && p.repo[0] === "v" && p.repo[1] === vid)) {
        params.push({ repo: ["v", vid] });
      }
    }
  };

  const addRepoWithVersions = (owner: string, repo: string, vids: string[]) => {
    if (!params.some((p) => p.repo?.length >= 2 && p.repo[0] === owner && p.repo[1] === repo)) {
      params.push({ repo: [owner, repo] });
    }
    for (const vid of vids) {
      if (
        !params.some(
          (p) =>
            p.repo?.length >= 4 && p.repo[0] === owner && p.repo[1] === repo && p.repo[2] === "v" && p.repo[3] === vid,
        )
      ) {
        params.push({ repo: [owner, repo, "v", vid] });
      }
    }
  };

  try {
    const config = await loadRootConfig<{
      VersionControl?: { versions?: { id: string }[] };
      site?: { ProjectLink?: string };
    }>();
    versions = config?.VersionControl?.versions?.map((v: { id: string }) => v.id) ?? DEFAULT_VERSIONS;
    addVersionPaths(versions);

    if (config?.site?.ProjectLink) {
      const fromProjectLink = parseOwnerRepoFromUrl(config.site.ProjectLink);
      if (fromProjectLink.owner && fromProjectLink.repo) {
        addRepoWithVersions(fromProjectLink.owner, fromProjectLink.repo, versions);
      }
    }

    const fromPackage = await getRepoFromPackage();
    if (fromPackage?.fromRepository) {
      addRepoWithVersions(fromPackage.fromRepository.owner, fromPackage.fromRepository.repo, versions);
    }
    if (fromPackage?.fromHomepage) {
      addRepoWithVersions(fromPackage.fromHomepage.owner, fromPackage.fromHomepage.repo, versions);
    }
  } catch {
    addVersionPaths(versions);
    try {
      const fromPackage = await getRepoFromPackage();
      if (fromPackage?.fromRepository) {
        addRepoWithVersions(fromPackage.fromRepository.owner, fromPackage.fromRepository.repo, versions);
      }
      if (fromPackage?.fromHomepage) {
        addRepoWithVersions(fromPackage.fromHomepage.owner, fromPackage.fromHomepage.repo, versions);
      }
    } catch {
      addRepoWithVersions(FALLBACK_OWNER, FALLBACK_REPO, versions);
    }
  }
  return params;
}
