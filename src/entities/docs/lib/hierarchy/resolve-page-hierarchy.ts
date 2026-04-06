import type {
    LoadedPage,
    GitPageDocsConfig,
    HierarchyConfig,
    ContentType,
} from "../../model/types";
import { CONTENT_TYPES } from "../../model/types/config";

export function resolvePageHierarchy(
    currentPage: LoadedPage | undefined,
    globalConfig: GitPageDocsConfig,
    contentTypeFilter?: ContentType
): ContentType[] {
    if (!currentPage) return [];

    const localHierarchy =
        (currentPage.md?.config as any)?.hierarchyPage ??
        (currentPage.html?.config as any)?.hierarchyPage ??
        (currentPage.video?.config as any)?.hierarchyPage ??
        (currentPage.audio?.config as any)?.hierarchyPage;

    const effectiveHierarchy: HierarchyConfig =
        localHierarchy ??
        globalConfig.hierarchyPage ??
        { md: 0, html: 1, video: 2, audio: 3 };

    const availableTypes = CONTENT_TYPES.filter((t) => currentPage[t]);

    if (contentTypeFilter) {
        if (availableTypes.includes(contentTypeFilter)) {
            return [contentTypeFilter];
        }
        return [];
    }

    return availableTypes.sort((a, b) => {
        const orderA = effectiveHierarchy[a] ?? 999;
        const orderB = effectiveHierarchy[b] ?? 999;
        return orderA - orderB;
    });
}
