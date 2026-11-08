// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocsShellControlsIcons, type DocsShellControlsIconsProps } from "@/widgets/docs-shell/ui/docs-shell-controls-icons";

const props: DocsShellControlsIconsProps = {
  fallbackProjectLink: "https://github.com/demo/docs",
  projectLabel: "Project",
  useReactProjectLinkIcon: true,
  projectLinkReactIconTag: "FaGithubAlt",
  projectLinkReactIconStyle: { color: "red", fontSize: "25px" },
  versionLinkOptionsWithLabels: [{ id: "branch", label: "Branch", url: "https://github.com/demo/docs/tree/main" }],
  versionLinksLabel: "Repository links",
  useReactVersionLinksIcon: true,
  versionLinksIconTag: "FaCodeBranch",
  versionLinksIconStyle: { color: "red", fontSize: "25px" },
  versionLinksIconImage: undefined,
  versionLinksIconImgWidth: 20,
  versionLinksIconImgHeight: 20,
  infoIconImgWidth: 20,
  infoIconImgHeight: 20,
  previewIconImgWidth: 20,
  previewIconImgHeight: 20,
  showInfoButton: true,
  lastUpdateLabel: "Last update version",
  useReactInfoIcon: true,
  infoIconTag: "BsInfoSquareFill",
  infoIconStyle: { color: "red", fontSize: "25px" },
  infoIconImage: undefined,
  showPreviewButton: true,
  previewProjectUrl: "https://example.com/docs",
  useReactPreviewIcon: true,
  previewIconTag: "CiGlobe",
  previewIconStyle: { color: "red", fontSize: "25px" },
  previewIconImage: undefined,
  onOpenVersionLinksPopup: () => {},
  onOpenInfoPopup: () => {},
};

afterEach(cleanup);

it("renders each header metadata control with an icon before lazy icon packs load", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<DocsShellControlsIcons {...props} />);
  expect([...container.querySelectorAll("a,button")].map(control => ({
    label: control.getAttribute("aria-label"),
    icons: control.querySelectorAll("svg").length,
  }))).toEqual([
    { label: "Project", icons: 1 },
    { label: "Repository links", icons: 1 },
    { label: "Last update version", icons: 1 },
    { label: "Preview", icons: 1 },
  ]);
  for (const icon of container.querySelectorAll("svg")) {
    expect(icon.style.color).toBe("red");
    expect(icon.style.fontSize).toBe("25px");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  }
});

it("preserves explicit image preferences and the legacy project icon", () => {
  const { container } = render(<DocsShellControlsIcons {...props}
    useReactProjectLinkIcon={false}
    useReactVersionLinksIcon={false} versionLinksIconImage="/branch.svg"
    useReactInfoIcon={false} infoIconImage="/info.svg"
    useReactPreviewIcon={false} previewIconImage="/preview.svg"
  />);
  expect([...container.querySelectorAll("img")].map(image => image.getAttribute("src")))
    .toEqual(["/branch.svg", "/info.svg", "/preview.svg"]);
  expect(container.querySelectorAll("svg")).toHaveLength(1);
  expect(container.querySelector('a[aria-label="Project"] svg')?.getAttribute("viewBox")).toBe("0 0 24 24");
});

it("replaces the immediate icons with the explicitly configured icon after it resolves", async () => {
  const { container } = render(<DocsShellControlsIcons {...props}
    projectLinkReactIconTag="FiHeart" versionLinksIconTag="FiHeart"
    infoIconTag="FiHeart" previewIconTag="FiHeart"
  />);
  await waitFor(() => {
    const paths = [...container.querySelectorAll("svg path")];
    expect(paths).toHaveLength(4);
    for (const path of paths) expect(path.getAttribute("d")).toMatch(/^M20\.84 4\.61/);
  });
});

it("keeps usable icons when configured tags cannot be resolved", async () => {
  const container = document.createElement("div");
  await act(async () => {
    render(<DocsShellControlsIcons {...props}
      projectLinkReactIconTag="UnknownIcon" versionLinksIconTag="UnknownIcon"
      infoIconTag="UnknownIcon" previewIconTag="UnknownIcon"
    />, { container });
  });
  expect(container.querySelectorAll("svg")).toHaveLength(4);
});
