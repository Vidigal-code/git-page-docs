// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GuideBackToTop } from "@/page-slices/introduction-guide/ui/guide-back-to-top";
import { renderToStaticMarkup } from "react-dom/server";
import { GuideHero } from "@/page-slices/introduction-guide/ui/guide-hero";
import { GuideSidebar } from "@/page-slices/introduction-guide/ui/guide-sidebar";
import { GuideSection } from "@/page-slices/introduction-guide/ui/guide-section";
import { StoryChapter } from "@/page-slices/introduction-guide/ui/story/story-chapter";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import type { GuideSection as GuideSectionModel, GuideUi } from "@/page-slices/introduction-guide/model/types";

const section: GuideSectionModel = { id: "setup", icon: "FiBookOpen", title: "Setup", lead: "Install the tools", keywords: [], blocks: [] };
const ui: GuideUi = {
  searchPlaceholder: "Search guide", searchEmpty: "No results", onThisPage: "On this page", sectionsLabel: "Sections",
  backToSearch: "Back", backToTop: "Back to top", storyLabel: "Tour", storySkip: "Skip", storyScrollHint: "Scroll", storyChaptersLabel: "Chapters",
};

it("renders guide navigation and chapter icons in the initial HTML before icon packs load", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<GuideMotionProvider>
    <GuideHero id="guide-top" hero={{ eyebrow: "Docs", title: "Guide", subtitle: "Learn", install: "npm install", ctaPrimary: "Start", ctaSecondary: "Repository" }}
      projectUrl="https://github.com/demo/docs" backToSearchHref="/" backToSearchLabel="Back" onPrimary={() => {}} />
    <GuideSidebar ui={ui} sections={[section]} query="" onQueryChange={() => {}} activeId="setup" onSelect={() => {}} />
    <GuideSection section={section} />
    <StoryChapter chapter={{ ...section, number: "01", highlights: [] }} active />
  </GuideMotionProvider>);
  const slots = [
    container.querySelector('[data-guide-back-link]'),
    container.querySelector('[data-hero-action="secondary"]'),
    container.querySelector('label'),
    container.querySelector('nav button'),
    container.querySelector('section#setup header'),
    container.querySelector('article header'),
  ];
  expect(slots.map(slot => slot?.querySelectorAll("svg").length)).toEqual([1, 1, 1, 1, 1, 1]);
});


afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("shows the back-to-top icon as soon as a long guide exposes the button and keeps its focus target", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<><div id="guide-top" tabIndex={-1} /><GuideBackToTop label="Back to top" targetId="guide-top" /></>);
  const button = screen.getByRole("button", { name: "Back to top" });
  expect(button.querySelector("svg")).not.toBeNull();
  fireEvent.click(button);
  expect(document.activeElement).toBe(document.getElementById("guide-top"));
});

it("keeps an explicitly disabled back-to-top control hidden", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
  render(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ enabled: false }} />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it("replaces document placeholders with the configured section and chapter icons", async () => {
  const configured = { ...section, icon: "FiHeart" };
  const { container } = render(<>
    <GuideSidebar ui={ui} sections={[configured]} query="" onQueryChange={() => {}} activeId="setup" onSelect={() => {}} />
    <GuideSection section={configured} />
    <StoryChapter chapter={{ ...configured, number: "01", highlights: [] }} active />
  </>);
  await waitFor(() => {
    const slots = container.querySelectorAll("nav button, section#setup header, article header");
    expect(slots).toHaveLength(3);
    for (const slot of slots) expect(slot.querySelector("svg path")?.getAttribute("d")).toMatch(/^M20\.84 4\.61/);
  });
});
