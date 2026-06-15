/**
 * @file resolve-ai-chat-icon.ts
 * @description Extracts AI chat icon configs based on theme mode.
 */
import type { CSSProperties } from "react";
import { resolveIconPath } from "../resolve-icon-path";
import { DEFAULT_ICON_FALLBACK_URL } from "../../../config/icon-defaults";

export interface ResolvedAiChatIconConfig {
    iconImage: string;
    useReactIcon: boolean;
    reactIconTag: string | undefined;
    reactIconStyle: CSSProperties;
    iconImgWidth: number;
    iconImgHeight: number;
}

const DEFAULT_IMG = DEFAULT_ICON_FALLBACK_URL;

export function resolveAiChatOpenIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "BsChatDots",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatOpenDarkImg : site.IconAiChatOpenLightImg;
    const useReactIcon = (site.IconAiChatOpenReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatOpenReactIconesTag || "BsChatDots";
    const color = mode === "dark" ? site.IconAiChatOpenReactIconesTagColorDark : site.IconAiChatOpenReactIconesTagColorLight;
    const size = site.IconAiChatOpenReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatOpenImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatOpenImgHeight) || 20,
    };
}

export function resolveAiChatCloseIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "IoClose",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatCloseDarkImg : site.IconAiChatCloseLightImg;
    const useReactIcon = (site.IconAiChatCloseReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatCloseReactIconesTag || "IoClose";
    const color = mode === "dark" ? site.IconAiChatCloseReactIconesTagColorDark : site.IconAiChatCloseReactIconesTagColorLight;
    const size = site.IconAiChatCloseReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatCloseImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatCloseImgHeight) || 20,
    };
}

export function resolveAiChatSettingsIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiSettings",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatSettingsDarkImg : site.IconAiChatSettingsLightImg;
    const useReactIcon = (site.IconAiChatSettingsReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatSettingsReactIconesTag || "FiSettings";
    const color = mode === "dark" ? site.IconAiChatSettingsReactIconesTagColorDark : site.IconAiChatSettingsReactIconesTagColorLight;
    const size = site.IconAiChatSettingsReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatSettingsImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatSettingsImgHeight) || 20,
    };
}

export function resolveAiChatSendIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiSend",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatSendDarkImg : site.IconAiChatSendLightImg;
    const useReactIcon = (site.IconAiChatSendReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatSendReactIconesTag || "FiSend";
    const color = mode === "dark" ? site.IconAiChatSendReactIconesTagColorDark : site.IconAiChatSendReactIconesTagColorLight;
    const size = site.IconAiChatSendReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatSendImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatSendImgHeight) || 20,
    };
}

export function resolveAiChatCancelIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiXCircle",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatCancelDarkImg : site.IconAiChatCancelLightImg;
    const useReactIcon = (site.IconAiChatCancelReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatCancelReactIconesTag || "FiXCircle";
    const color = mode === "dark" ? site.IconAiChatCancelReactIconesTagColorDark : site.IconAiChatCancelReactIconesTagColorLight;
    const size = site.IconAiChatCancelReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatCancelImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatCancelImgHeight) || 20,
    };
}

export function resolveAiChatTrashIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiTrash2",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatTrashDarkImg : site.IconAiChatTrashLightImg;
    const useReactIcon = (site.IconAiChatTrashReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatTrashReactIconesTag || "FiTrash2";
    const color = mode === "dark" ? site.IconAiChatTrashReactIconesTagColorDark : site.IconAiChatTrashReactIconesTagColorLight;
    const size = site.IconAiChatTrashReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatTrashImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatTrashImgHeight) || 20,
    };
}

export function resolveAiChatClearChatIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiMessageSquare",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatClearChatDarkImg : site.IconAiChatClearChatLightImg;
    const useReactIcon = (site.IconAiChatClearChatReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatClearChatReactIconesTag || "FiMessageSquare";
    const color = mode === "dark" ? site.IconAiChatClearChatReactIconesTagColorDark : site.IconAiChatClearChatReactIconesTagColorLight;
    const size = site.IconAiChatClearChatReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatClearChatImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatClearChatImgHeight) || 20,
    };
}

export function resolveAiChatClearDataIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiDatabase",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatClearDataDarkImg : site.IconAiChatClearDataLightImg;
    const useReactIcon = (site.IconAiChatClearDataReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatClearDataReactIconesTag || "FiDatabase";
    const color = mode === "dark" ? site.IconAiChatClearDataReactIconesTagColorDark : site.IconAiChatClearDataReactIconesTagColorLight;
    const size = site.IconAiChatClearDataReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatClearDataImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatClearDataImgHeight) || 20,
    };
}

export function resolveAiChatExpandIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiMaximize2",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatExpandDarkImg : site.IconAiChatExpandLightImg;
    const useReactIcon = (site.IconAiChatExpandReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatExpandReactIconesTag || "FiMaximize2";
    const color = mode === "dark" ? site.IconAiChatExpandReactIconesTagColorDark : site.IconAiChatExpandReactIconesTagColorLight;
    const size = site.IconAiChatExpandReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatExpandImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatExpandImgHeight) || 20,
    };
}

export function resolveAiChatCollapseIconConfig(site: any, mode: "dark" | "light", basePath: string): ResolvedAiChatIconConfig {
    if (!site) {
        return {
            iconImage: resolveIconPath(DEFAULT_IMG, basePath),
            useReactIcon: true,
            reactIconTag: "FiMinimize2",
            reactIconStyle: {},
            iconImgWidth: 20,
            iconImgHeight: 20,
        };
    }
    const rawImage = mode === "dark" ? site.IconAiChatCollapseDarkImg : site.IconAiChatCollapseLightImg;
    const useReactIcon = (site.IconAiChatCollapseReactIcones ?? !rawImage);
    const reactIconTag = site.IconAiChatCollapseReactIconesTag || "FiMinimize2";
    const color = mode === "dark" ? site.IconAiChatCollapseReactIconesTagColorDark : site.IconAiChatCollapseReactIconesTagColorLight;
    const size = site.IconAiChatCollapseReactIconesTagSize;
    return {
        iconImage: resolveIconPath(rawImage || DEFAULT_IMG, basePath),
        useReactIcon,
        reactIconTag,
        reactIconStyle: { color: color || undefined, fontSize: size || undefined },
        iconImgWidth: Number(site.IconAiChatCollapseImgWidth) || 20,
        iconImgHeight: Number(site.IconAiChatCollapseImgHeight) || 20,
    };
}
