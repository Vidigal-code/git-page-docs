import fs from "node:fs/promises";
import path from "node:path";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { buildMdRoute } from "../../builders/route-builders.mjs";
import type { AiDocPage } from "../application/docs-pattern";

const CANONICAL_LANGS = ["pt", "en", "es"] as const;
type Lang = (typeof CANONICAL_LANGS)[number];

/** AI routes/menus use a high, dedicated id range so they never clash with the
 * deterministic base routes (ids 1..N) and can be identified for idempotency. */
const AI_ROUTE_ID_BASE = 1000;

export interface VersionDocsWriteInput {
  cwd: string;
  versionId: string;
  /** Pages generated per language (only the languages the user selected). */
  pagesByLang: Partial<Record<Lang, AiDocPage[]>>;
}

export interface VersionDocsWriteResult {
  configPath: string;
  slugs: string[];
  files: string[];
}

interface LangContent {
  title: string;
  body: string;
}

function indexBySlug(pages: AiDocPage[] | undefined): Map<string, AiDocPage> {
  const map = new Map<string, AiDocPage>();
  for (const page of pages ?? []) {
    if (!map.has(page.slug)) map.set(page.slug, page);
  }
  return map;
}

/**
 * Write AI-generated pages into the gitpagedocs versioned structure and wire
 * them into the version config.json (routes-md + menus-header-md). Pages are
 * written for ALL three canonical languages (missing languages reuse an
 * available translation) so every route path stays valid. Idempotent: any prior
 * `aiGenerated` routes/menus are replaced, never duplicated. The base config and
 * its deterministic routes are preserved untouched.
 */
export async function writeVersionDocs(input: VersionDocsWriteInput): Promise<VersionDocsWriteResult> {
  const { cwd, versionId, pagesByLang } = input;
  const base = `gitpagedocs/docs/versions/${versionId}`;

  const perLang: Record<Lang, Map<string, AiDocPage>> = {
    pt: indexBySlug(pagesByLang.pt),
    en: indexBySlug(pagesByLang.en),
    es: indexBySlug(pagesByLang.es),
  };

  // Ordered unique slug list (prefer en order, then pt, then es).
  const order: string[] = [];
  const seen = new Set<string>();
  for (const lang of ["en", "pt", "es"] as Lang[]) {
    for (const page of pagesByLang[lang] ?? []) {
      if (!seen.has(page.slug)) {
        seen.add(page.slug);
        order.push(page.slug);
      }
    }
  }
  if (order.length === 0) {
    throw new Error("No AI pages to write.");
  }

  const resolve = (slug: string): Record<Lang, LangContent> => {
    const fallback = CANONICAL_LANGS.map((lang) => perLang[lang].get(slug)).find(Boolean);
    const out = {} as Record<Lang, LangContent>;
    for (const lang of CANONICAL_LANGS) {
      const page = perLang[lang].get(slug) ?? fallback!;
      out[lang] = { title: page.title, body: page.body };
    }
    return out;
  };

  // 1) Write the markdown files (all 3 canonical languages).
  const writtenFiles: string[] = [];
  for (const slug of order) {
    const content = resolve(slug);
    for (const lang of CANONICAL_LANGS) {
      const rel = `${base}/${lang}/${slug}.md`;
      const abs = path.resolve(cwd, rel);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, `${content[lang].body}\n`, "utf-8");
      writtenFiles.push(rel);
    }
  }

  // 2) Patch the version config.json (raw JSON round-trip, preserve all keys).
  const configRel = `${base}/config.json`;
  const configAbs = path.resolve(cwd, configRel);
  let raw: string;
  try {
    raw = await fs.readFile(configAbs, "utf-8");
  } catch {
    throw new Error(
      `Version config not found at ${configRel}. Run the base scaffold (\`gitpagedocs\`) first.`,
    );
  }
  const config = JSON.parse(raw) as Record<string, unknown>;

  const routesMd = Array.isArray(config["routes-md"]) ? (config["routes-md"] as Array<Record<string, unknown>>) : [];
  const menusMd = Array.isArray(config["menus-header-md"]) ? (config["menus-header-md"] as Array<Record<string, unknown>>) : [];
  const keptRoutes = routesMd.filter((route) => route?.aiGenerated !== true);
  const keptMenus = menusMd.filter((menu) => menu?.aiGenerated !== true);

  const newRoutes: Array<Record<string, unknown>> = [];
  const newMenus: Array<Record<string, unknown>> = [];
  order.forEach((slug, index) => {
    const content = resolve(slug);
    const id = AI_ROUTE_ID_BASE + index + 1;
    const pathByLang = {
      pt: `${base}/pt/${slug}.md`,
      en: `${base}/en/${slug}.md`,
      es: `${base}/es/${slug}.md`,
    };
    const titles = { pt: content.pt.title, en: content.en.title, es: content.es.title };
    const descriptions = { pt: "", en: "", es: "" };
    const route = buildMdRoute(versionId, id, pathByLang, titles, descriptions, {}) as Record<string, unknown>;
    route.aiGenerated = true;
    newRoutes.push(route);
    newMenus.push({
      id,
      aiGenerated: true,
      pt: { title: content.pt.title, "path-click": pathByLang.pt },
      en: { title: content.en.title, "path-click": pathByLang.en },
      es: { title: content.es.title, "path-click": pathByLang.es },
    });
  });

  config["routes-md"] = [...keptRoutes, ...newRoutes];
  config["menus-header-md"] = [...keptMenus, ...newMenus];
  await fs.writeFile(configAbs, `${JSON.stringify(config, null, 2)}\n`, "utf-8");

  return { configPath: configRel, slugs: order, files: writtenFiles };
}
