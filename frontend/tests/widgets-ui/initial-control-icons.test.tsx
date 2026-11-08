// @vitest-environment jsdom
import type { ComponentProps, ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AudioPlayerButton } from "@/features/audio-player/ui/audio-player-button";
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference/ui/nav-menu-block-toggle";
import { SearchShellHeader } from "@/widgets/search-shell-header";
import { resolveNavMenuBlockActiveIconConfig, resolveNavMenuBlockInactiveIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

function initialMarkup(element: ReactElement): HTMLDivElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(element);
  return host;
}

it.each([
  { isPlaying: false, label: "Play audio", tag: undefined },
  { isPlaying: true, label: "Pause audio", tag: undefined },
  { isPlaying: false, label: "Play audio", tag: "FiVolume2" },
  { isPlaying: true, label: "Pause audio", tag: "FiSquare" },
])("renders $label before client effects load $tag", ({ isPlaying, label, tag }) => {
  const host = initialMarkup(<AudioPlayerButton
    isPlaying={isPlaying}
    onToggle={vi.fn()}
    playIconTag={tag}
    pauseIconTag={tag}
    playLabel="Play audio"
    pauseLabel="Pause audio"
    iconStyle={{ color: "red", fontSize: "24px" }}
  />);
  const icon = host.querySelector(`button[aria-label="${label}"] svg`);
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute("aria-hidden")).toBe("true");
  expect(icon?.getAttribute("style")).toContain("font-size:24px");
});

it.each([
  { blockMenuOnNav: false, label: "Unlocked menu" },
  { blockMenuOnNav: true, label: "Locked menu" },
])("renders $label before client effects run", ({ blockMenuOnNav, label }) => {
  const host = initialMarkup(<NavMenuBlockToggle
    blockMenuOnNav={blockMenuOnNav}
    onToggle={vi.fn()}
    activeIcon={resolveNavMenuBlockActiveIconConfig(undefined, "dark", "")}
    inactiveIcon={resolveNavMenuBlockInactiveIconConfig(undefined, "dark", "")}
    labelActive="Locked menu"
    labelInactive="Unlocked menu"
  />);
  const icon = host.querySelector(`button[aria-label="${label}"] svg`);
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute("aria-hidden")).toBe("true");
});

function headerProps(): ComponentProps<typeof SearchShellHeader> {
  return {
    siteName: "Documentation",
    basePath: "",
    language: "en",
    languages: ["en"],
    onLanguageChange: vi.fn(),
    activeThemeId: "dark",
    layouts: [],
    onThemeChange: vi.fn(),
    nextModeIsDark: false,
    canToggleMode: false,
    onToggleMode: vi.fn(),
    getLanguageLabel: (language) => language,
  };
}

it.each([
  { name: "default brand", settings: {} },
  { name: "configured brand", settings: { useReactHeaderIcon: true, reactHeaderIconTag: "FiBookOpen" } },
])("renders the search header $name before client effects run", ({ settings }) => {
  const host = initialMarkup(<SearchShellHeader {...headerProps()} {...settings} />);
  const icon = host.querySelector('a[aria-label="Documentation"] svg');
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute("aria-hidden")).toBe("true");
});

it("preserves the configured brand image when React icons are disabled", () => {
  const host = initialMarkup(<SearchShellHeader
    {...headerProps()}
    useReactHeaderIcon={false}
    iconImage="/brand.svg"
    iconImgWidth={24}
    iconImgHeight={18}
  />);
  expect(host.querySelector('a[aria-label="Documentation"] svg')).toBeNull();
  expect(host.querySelector('a[aria-label="Documentation"] img')?.getAttribute("src")).toBe("/brand.svg");
});
