import { loadRootConfig } from "@/entities/docs/server";
import { parseOwnerRepoFromUrl } from "@/shared/lib/runtime/parse-owner-repo";
import { getRepoFromPackage } from "@/shared/config/repo-from-package";

const DEFAULT_VERSIONS = ["1.0.0", "1.1.0", "1.1.1"];
const FALLBACK_OWNER = "Vidigal-code";
const FALLBACK_REPO = "git-page-docs";

export async function generateDocsStaticParams(): Promise<{ repo: string[] }[]> {
  const params: { repo: string[] }[] = [{ repo: [] }];
  let versions: string[] = [...DEFAULT_VERSIONS];

  const addVersionPaths = (versionIds: string[]) => {
    for (const versionId of versionIds) {
      if (!params.some((entry) => entry.repo?.length >= 2 && entry.repo[0] === "v" && entry.repo[1] === versionId)) {
        params.push({ repo: ["v", versionId] });
      }
    }
  };

  const addRepoWithVersions = (owner: string, repo: string, versionIds: string[]) => {
    if (!params.some((entry) => entry.repo?.length >= 2 && entry.repo[0] === owner && entry.repo[1] === repo)) {
      params.push({ repo: [owner, repo] });
    }
    for (const versionId of versionIds) {
      if (
        !params.some(
          (entry) =>
            entry.repo?.length >= 4 &&
            entry.repo[0] === owner &&
            entry.repo[1] === repo &&
            entry.repo[2] === "v" &&
            entry.repo[3] === versionId,
        )
      ) {
        params.push({ repo: [owner, repo, "v", versionId] });
      }
    }
  };

  try {
    const config = await loadRootConfig<{
      VersionControl?: { versions?: { id: string }[] };
      site?: { ProjectLink?: string };
    }>();
    versions = config?.VersionControl?.versions?.map((version) => version.id) ?? DEFAULT_VERSIONS;
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
