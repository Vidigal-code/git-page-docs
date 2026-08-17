/** Build root config for gitpagedocs */
import { OFFICIAL_LAYOUTS_CONFIG_URL, OFFICIAL_LAYOUTS_TEMPLATES_URL } from "../data/urls.mjs";
import { resolveProjectLink, resolveRenderingUrl, resolveSourceViewerPath } from "./project-links.mjs";
import { DOCS } from "../content/docs.mjs";
import { DOC_VERSIONS } from "../data/version-constants.mjs";
import { defaultLangMenu } from "../data/i18n-langmenu.mjs";
import { defaultTranslations } from "../data/i18n-translations.mjs";
import { getDefaultSiteConfig } from "../data/default-site-config.mjs";

export function buildRootConfig(options = {}) {
  const useLocalLayoutConfig = Boolean(options.useLocalLayoutConfig);
  const useOfficialLayouts = !useLocalLayoutConfig;
  const githubOwner = options.githubOwner;
  const githubRepo = options.githubRepo;
  const repositorySearchHome = true;
  const renderingUrl = resolveRenderingUrl(githubOwner, githubRepo);
  const projectLink = resolveProjectLink(githubOwner, githubRepo);
  const sourceViewerPath = resolveSourceViewerPath(githubOwner, githubRepo);

  const versionEntries = DOC_VERSIONS.map((id) => ({
    id,
    path: `gitpagedocs/docs/versions/${id}/config.json`,
    ProjectLink: projectLink,
    PathConfig: `gitpagedocs/docs/versions/${id}/config.json`,
    PreviewProject: "",
    UpdateDate: "",
    branch: "",
    release: "",
    commit: "",
    "source-viewer": true,
    "source-viewer-path": sourceViewerPath,
  }));

  const baseSiteConfig = getDefaultSiteConfig(DOCS, projectLink);

  return {
    site: {
      ...baseSiteConfig,
      layoutsConfigPathOficial: useOfficialLayouts,
      layoutsConfigPathTemplatesOficial: useOfficialLayouts ? OFFICIAL_LAYOUTS_TEMPLATES_URL : "",
      layoutsConfigPathOficialUrl: useOfficialLayouts ? OFFICIAL_LAYOUTS_CONFIG_URL : "",
      repositorySearchHome,
      rendering: renderingUrl,
      AiChatEnabled: true,
      docsAccess: { enabled: false, publicKey: "" },
      langmenu: defaultLangMenu,
    },
    VersionControl: {
      versions: versionEntries,
    },
    translations: defaultTranslations,
  };
}
