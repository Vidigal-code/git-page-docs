import { getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import type { FooterConfig } from "@/shared/ui/site-footer";

export function buildFooterConfigFromData(
  data: LoadedDocsData,
  language: string,
): FooterConfig {
  const site = data.config.site;
  const fallbackLinkUrl =
    data.activeVersion?.ProjectLink?.trim() || site.ProjectLink?.trim() || PROJECT_FOOTER_URL;
  return {
    projectLabel: resolveTranslation(
      data.config.translations?.footer?.footerLabel,
      language,
      getLangMenuLabelFromMenu(site.langmenu, language, "footerLabel", "Project"),
    ),
    linkName: site.FooterLinkName?.trim() || "GitPageDocs",
    linkUrl: site.FooterLinkUrl?.trim() || fallbackLinkUrl,
    dateMode: site.FooterDateMode === "year" || site.FooterDateMode === "custom" ? site.FooterDateMode : "browser",
    dateCustom: site.FooterDateCustom?.trim() || "",
  };
}
