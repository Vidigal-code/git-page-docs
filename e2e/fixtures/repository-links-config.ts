import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { VersionEntry, VersionRepositoryLink } from "../../frontend/src/entities/docs/model/types/version";

const REPOSITORY_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_DIRECTORY = path.join(REPOSITORY_ROOT, "node_modules/.cache/repository-links-site");
const REPOSITORY_URL = "https://github.com/Vidigal-code/git-page-docs";
const EXTRA_BRANCH_COUNT = 18;

export const LEGACY_LINKS_VERSION = "0.0.9";
export const NAMED_REPOSITORY_LINKS = {
  branch: [
    { name: '<Main & "documentation">', url: `${REPOSITORY_URL}/tree/main` },
    ...Array.from({ length: EXTRA_BRANCH_COUNT }, (_, index) => ({
      name: `Documentation branch reference ${String(index + 1).padStart(2, "0")}`,
      url: `${REPOSITORY_URL}/tree/main/gitpagedocs/docs/versions/0.0.16`,
    })),
  ],
  release: [
    { name: "Release notes with a deliberately long title for narrow screens and responsive repository navigation", url: `${REPOSITORY_URL}/releases/tag/v0.0.16` },
    { name: "Previous release", url: `${REPOSITORY_URL}/releases/tag/v0.0.15` },
  ],
  commit: [
    { name: "Published documentation commit", url: `${REPOSITORY_URL}/commit/cd342928a6650a664d27d68a0c7184557a9291fd` },
    { name: "Commit history", url: `${REPOSITORY_URL}/commits/main` },
  ],
} satisfies Record<"branch" | "release" | "commit", VersionRepositoryLink[]>;

export const LEGACY_REPOSITORY_LINKS = {
  branch: `${REPOSITORY_URL}/tree/main`,
  release: `${REPOSITORY_URL}/releases/tag/v0.0.9`,
  commit: `${REPOSITORY_URL}/commits/main`,
};

interface FixtureConfig {
  VersionControl: { versions: VersionEntry[] };
}

export function prepareRepositoryLinksFixture(): string {
  mkdirSync(FIXTURE_DIRECTORY, { recursive: true });
  for (const directory of ["gitpagedocs", "gitpagelayouts"]) {
    cpSync(path.join(REPOSITORY_ROOT, directory), path.join(FIXTURE_DIRECTORY, directory), { recursive: true });
  }
  const configPath = path.join(FIXTURE_DIRECTORY, "gitpagedocs/config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8")) as FixtureConfig;
  const currentVersion = config.VersionControl.versions[0];
  const legacyVersion = config.VersionControl.versions.find((version) => version.id === LEGACY_LINKS_VERSION);
  if (!currentVersion || !legacyVersion) {
    throw new Error("Repository links tests require the current and oldest retained documentation versions.");
  }
  Object.assign(currentVersion, NAMED_REPOSITORY_LINKS);
  Object.assign(legacyVersion, LEGACY_REPOSITORY_LINKS);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return FIXTURE_DIRECTORY;
}
