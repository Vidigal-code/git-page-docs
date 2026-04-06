/** Build root config for gitpagedocs */
import { OFFICIAL_LAYOUTS_CONFIG_URL, OFFICIAL_LAYOUTS_TEMPLATES_URL } from "../data/urls.mjs";
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
  const repositorySearchHome = githubOwner && githubRepo ? false : true;
  const renderingUrl =
    githubOwner && githubRepo
      ? `https://${githubOwner}.github.io/${githubRepo}/`
      : "https://vidigal-code.github.io/git-page-docs/";
  const projectLink =
    githubOwner && githubRepo
      ? `https://github.com/${githubOwner}/${githubRepo}`
      : "https://github.com/Vidigal-code/git-page-docs";

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
      langmenu: defaultLangMenu,
    },
    VersionControl: {
      versions: versionEntries,
    },
    translations: defaultTranslations,
  };
}
