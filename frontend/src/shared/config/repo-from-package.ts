import path from "node:path";
import { readFile } from "node:fs/promises";
import { parseOwnerRepoFromUrl } from "@/shared/lib/runtime/parse-owner-repo";

export interface RepoFromPackageResult {
  fromRepository?: { owner: string; repo: string };
  fromHomepage?: { owner: string; repo: string };
}

export async function getRepoFromPackage(cwd: string = process.cwd()): Promise<RepoFromPackageResult | null> {
  try {
    const packageJsonPath = path.join(cwd, "package.json");
    const packageRaw = await readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageRaw) as {
      repository?: { url?: string } | string;
      homepage?: string;
    };

    const repositoryUrl =
      typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;
    const fromRepository = parseOwnerRepoFromUrl(repositoryUrl);
    const fromHomepage = parseOwnerRepoFromUrl(packageJson.homepage);

    const result: RepoFromPackageResult = {};
    if (fromRepository.owner && fromRepository.repo) {
      result.fromRepository = { owner: fromRepository.owner, repo: fromRepository.repo };
    }
    if (fromHomepage.owner && fromHomepage.repo) {
      result.fromHomepage = { owner: fromHomepage.owner, repo: fromHomepage.repo };
    }
    return Object.keys(result).length ? result : null;
  } catch {
    return null;
  }
}
