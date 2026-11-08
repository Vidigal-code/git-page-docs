import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ContentTypeRouteConfig, HeaderMenuItem } from "../../frontend/src/entities/docs/model/types/config";
import { MARKDOWN_GFM_FIXTURE } from "./markdown-gfm";
import { MARKDOWN_GUIDE_FIXTURE } from "./markdown-guide";

export const MARKDOWN_ROUTE_ID = 9001;
export const MARKDOWN_GUIDE_ROUTE_ID = 9002;

interface MarkdownFixtureConfig {
  "routes-md": ContentTypeRouteConfig[];
  "menus-header-md": HeaderMenuItem[];
}

export function prepareMarkdownFixture(root: string, versionConfigPath: string): void {
  const configPath = path.join(root, versionConfigPath);
  const config = JSON.parse(readFileSync(configPath, "utf8")) as MarkdownFixtureConfig;
  const markdownPath = path.posix.join(path.posix.dirname(versionConfigPath), "en/markdown-rendering-fixture.md");
  const localizedPath = { en: markdownPath, pt: markdownPath, es: markdownPath };
  const title = "Markdown rendering fixture";
  config["routes-md"].push({
    id: MARKDOWN_ROUTE_ID,
    path: localizedPath,
    title: { en: title, pt: title, es: title },
    container: "full",
    fullscreenEnabled: true,
    RouteguideBrand: false,
  });
  const menu = { title, "path-click": markdownPath };
  config["menus-header-md"].push({ id: MARKDOWN_ROUTE_ID, en: menu, pt: menu, es: menu });
  writeFileSync(path.join(root, markdownPath), MARKDOWN_GFM_FIXTURE);
  const guidePath = path.posix.join(path.posix.dirname(versionConfigPath), "en/markdown-guide-fixture.md");
  const guideTitle = "Configurable document guide";
  const guideMenu = { title: guideTitle, "path-click": guidePath };
  config["routes-md"].push({
    id: MARKDOWN_GUIDE_ROUTE_ID,
    path: { en: guidePath, pt: guidePath, es: guidePath },
    titleIsVisible: false,
    container: "full",
    RouteguideBrand: true,
    RouteGuideTags: ["h1", "h2", "h3", "p", "table", "pre", "img", "summary"],
    RouteguideBrandPosition: "left",
    RouteguideBrandContainerTop: false,
  });
  config["menus-header-md"].push({ id: MARKDOWN_GUIDE_ROUTE_ID, en: guideMenu, pt: guideMenu, es: guideMenu });
  writeFileSync(path.join(root, guidePath), MARKDOWN_GUIDE_FIXTURE);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
