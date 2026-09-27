// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// jsdom parses its default stylesheet on the first getComputedStyle / role query,
// which takes seconds when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 });
import { NavMenuBlockToggle } from "@/features/nav-menu-block-preference/ui/nav-menu-block-toggle";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} data-testid="icon-image" />
  ),
}));

vi.mock("@/shared/ui/react-icon-by-tag", () => ({
  ReactIconByTag: ({ tag }: { tag?: string }) => <i data-testid="react-icon" data-tag={tag ?? ""} />,
}));

function icon(overrides: Partial<ResolvedNavMenuIconConfig> = {}): ResolvedNavMenuIconConfig {
  return {
    iconImage: "",
    useReactIcon: false,
    reactIconTag: undefined,
    reactIconStyle: { color: "red" },
    iconImgWidth: 20,
    iconImgHeight: 20,
    ...overrides,
  };
}

function renderToggle(overrides: Partial<Parameters<typeof NavMenuBlockToggle>[0]> = {}) {
  const onToggle = vi.fn();
  render(
    <NavMenuBlockToggle
      blockMenuOnNav={false}
      onToggle={onToggle}
      activeIcon={icon({ useReactIcon: true, reactIconTag: "FiLock" })}
      inactiveIcon={icon({ useReactIcon: true, reactIconTag: "FiUnlock" })}
      labelActive="Menu stays closed"
      labelInactive="Menu closes on navigation"
      className="toggle"
      {...overrides}
    />,
  );
  return { onToggle };
}

afterEach(() => {
  cleanup();
});

describe("NavMenuBlockToggle", () => {
  it("shows the active icon and label when blocking is on, and toggles on click", () => {
    const { onToggle } = renderToggle({ blockMenuOnNav: true });
    const button = screen.getByRole("button", { name: "Menu stays closed" });
    expect(button.getAttribute("title")).toBe("Menu stays closed");
    expect(button.className).toBe("toggle");
    const reactIcon = screen.getByTestId("react-icon");
    expect(reactIcon.getAttribute("data-tag")).toBe("FiLock");
    expect(reactIcon.parentElement?.tagName).toBe("SPAN");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows the inactive icon and label when blocking is off", () => {
    renderToggle();
    screen.getByRole("button", { name: "Menu closes on navigation" });
    expect(screen.getByTestId("react-icon").getAttribute("data-tag")).toBe("FiUnlock");
  });

  it("renders the configured image when no react icon is requested", () => {
    renderToggle({ inactiveIcon: icon({ iconImage: "/icons/unlock.png", iconImgWidth: 24, iconImgHeight: 18 }) });
    const image = screen.getByTestId("icon-image") as HTMLImageElement;
    expect(image.getAttribute("src")).toBe("/icons/unlock.png");
    expect(image.getAttribute("width")).toBe("24");
    expect(image.getAttribute("height")).toBe("18");
    expect(image.getAttribute("alt")).toBe("");
    expect(screen.queryByTestId("react-icon")).toBeNull();
  });

  it("falls back to the react icon resolver without a wrapper when nothing is configured", () => {
    renderToggle({ inactiveIcon: icon({ reactIconTag: "FiMenu" }) });
    const reactIcon = screen.getByTestId("react-icon");
    expect(reactIcon.getAttribute("data-tag")).toBe("FiMenu");
    expect(reactIcon.parentElement?.tagName).toBe("BUTTON");
  });
});
