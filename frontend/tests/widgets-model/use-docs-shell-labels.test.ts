// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useDocsShellLabels } from "@/widgets/docs-shell/model/use-docs-shell-labels";
import { buildSourceViewerLabels } from "@/widgets/repository-source-browser/model/source-viewer-labels";
import { makeConfig, makeDocsData, makeSite } from "./fixtures";

afterEach(cleanup);

describe("useDocsShellLabels", () => {
  it("falls back to the built-in English copy when nothing is configured", () => {
    const { result } = renderHook(() => useDocsShellLabels(makeDocsData(), "en"));
    expect(result.current).toMatchObject({
      previousLabel: "Previous",
      nextLabel: "Next",
      browsePrevLabel: "Previous",
      browseNextLabel: "Next",
      menuOpenLabel: "Menu",
      menuCloseLabel: "Close",
      closeHintLabel: "Close",
      quickNavPlaceholder: "Type to navigate...",
      fullscreenExpandLabel: "Fullscreen",
      aiChatTitle: "AI Assistant",
      aiChatProviderOllama: "Ollama",
      docsAccessGateTitle: "Protected documentation",
      docsAccessBlockCancelBtn: "Cancel",
    });
    expect(result.current.aiChatSystemPrompt).toContain("{headerName}");
    expect(result.current.aiChatSystemPrompt).toContain("{rawContent}");
  });

  it("prefers translations for navigation and langmenu overrides for everything else", () => {
    const data = makeDocsData({
      config: makeConfig({
        site: makeSite({
          langmenu: {
            en: { menuClose: "Dismiss", typeToNavigate: "Jump to...", aiChatTitle: "Helper" },
            pt: { menuOpen: "Abrir", closeHint: "Fechar", docsAccessUnlockBtn: "Desbloquear" },
          },
        }),
        translations: {
          navigation: {
            previous: { en: "Back", pt: "Voltar" },
            next: { pt: "Avançar" },
            browsePrev: { pt: "Anterior" },
            menuClose: { pt: "Fechar menu" },
          },
        },
      }),
    });

    const en = renderHook(() => useDocsShellLabels(data, "en")).result.current;
    expect(en).toMatchObject({
      previousLabel: "Back",
      nextLabel: "Next",
      browsePrevLabel: "Back",
      menuCloseLabel: "Dismiss",
      closeHintLabel: "Dismiss",
      quickNavPlaceholder: "Jump to...",
      aiChatTitle: "Helper",
    });

    const pt = renderHook(() => useDocsShellLabels(data, "pt")).result.current;
    expect(pt).toMatchObject({
      previousLabel: "Voltar",
      nextLabel: "Avançar",
      browsePrevLabel: "Anterior",
      browseNextLabel: "Avançar",
      // langmenu[pt] has no menuClose: the en langmenu still outranks the translation fallback.
      menuCloseLabel: "Dismiss",
      menuOpenLabel: "Abrir",
      closeHintLabel: "Fechar",
      docsAccessUnlockBtn: "Desbloquear",
      // Unknown keys in pt fall back to en langmenu, then to the default copy.
      quickNavPlaceholder: "Jump to...",
      aiChatTitle: "Helper",
      aiChatUnlockBtn: "Unlock",
    });
  });

  it("memoises the label object across renders with the same inputs", () => {
    const data = makeDocsData();
    const { result, rerender } = renderHook(({ lang }) => useDocsShellLabels(data, lang), {
      initialProps: { lang: "en" },
    });
    const first = result.current;
    rerender({ lang: "en" });
    expect(result.current).toBe(first);
    rerender({ lang: "pt" });
    expect(result.current).not.toBe(first);
  });
});

describe("buildSourceViewerLabels", () => {
  it("returns the default copy and honours langmenu overrides with English fallback", () => {
    const defaults = buildSourceViewerLabels(makeSite().langmenu, "en");
    expect(defaults).toMatchObject({
      owner: "Owner",
      repo: "Repository",
      branch: "Branch",
      submit: "Search",
      filter: "Filter files",
      clear: "Clear",
      loadingTree: "Loading source tree...",
      loadingFile: "Loading file...",
      retry: "Try again",
      empty: "No entries found.",
      selectFile: "Select a file",
      preview: "Preview",
      code: "Code",
      back: "Back",
    });

    const langmenu = {
      en: { searchOwnerLabel: "Org", sourceViewerCode: "Source" },
      pt: { searchOwnerLabel: "Organização", sourceViewerBackLabel: "Voltar" },
    };
    expect(buildSourceViewerLabels(langmenu, "pt")).toMatchObject({
      owner: "Organização",
      code: "Source",
      repo: "Repository",
      back: "Voltar",
    });
    // No `back` copy for the language and none in English either: the built-in fallback stays.
    expect(buildSourceViewerLabels(langmenu, "en").back).toBe("Back");
  });
});
