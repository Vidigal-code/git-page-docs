import { expect, it } from "vitest";
import { buildRootConfig } from "../builders/root-config-builder.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as languageArtifacts from "../builders/language-bundles-builder.mjs";

it("enables the back-to-top arrow only for pages at least three viewports tall", () => {
  expect(buildRootConfig().site.backToTop).toEqual({
    enabled: true,
    minPageHeightViewports: 3,
  });
});

it("generates localized back-to-top labels for documentation pages", () => {
  const { buildLanguageArtifacts } = languageArtifacts as {
    buildLanguageArtifacts(): { languageBundles: Record<string, { langmenu: Record<string, string> }> };
  };
  const { languageBundles } = buildLanguageArtifacts();
  expect(languageBundles.en.langmenu.backToTop).toBe("Back to top");
  expect(languageBundles.pt.langmenu.backToTop).toBe("Voltar ao topo");
  expect(languageBundles.es.langmenu.backToTop).toBe("Volver arriba");
});
