import type {
    LoadedPage,
    GitPageDocsConfig,
    HierarchyConfig,
    ContentType,
    ContentTypeRouteConfig,
    RouteConfig,
} from "../../model/types";
import { CONTENT_TYPES } from "../../model/types/config";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

const UNORDERED_CONTENT = 999;

function getRouteHierarchy(config: ContentTypeRouteConfig | RouteConfig | undefined): HierarchyConfig | undefined {
    return config && "hierarchyPage" in config ? config.hierarchyPage : undefined;
}

export function resolvePageHierarchy(
    currentPage: LoadedPage | undefined,
    globalConfig: GitPageDocsConfig,
    contentTypeFilter?: ContentType
): ContentType[] {
    if (!currentPage) return [];

    const localHierarchy = [currentPage.md, currentPage.sourceViewer, currentPage.html, currentPage.video, currentPage.audio, currentPage.pdf]
        .map((content) => getRouteHierarchy(content?.config)).find((hierarchy) => hierarchy !== undefined);

    const effectiveHierarchy: HierarchyConfig =
        localHierarchy ??
        globalConfig.hierarchyPage ??
        DEFAULT_HIERARCHY;

    const availableTypes = CONTENT_TYPES.filter((contentType) => {
        if (contentType === "pdf" && globalConfig.site.pdf?.enabled === false) return false;
        if (contentType === "source-viewer") return Boolean(currentPage.sourceViewer);
        return Boolean(currentPage[contentType]);
    });

    if (contentTypeFilter) {
        if (availableTypes.includes(contentTypeFilter)) {
            return [contentTypeFilter];
        }
        return [];
    }

    return availableTypes.sort((a, b) => {
        const orderA = effectiveHierarchy[a] ?? UNORDERED_CONTENT;
        const orderB = effectiveHierarchy[b] ?? UNORDERED_CONTENT;
        return orderA - orderB;
    });
}
