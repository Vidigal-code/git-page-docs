import type { Metadata } from "next";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { FALLBACK_HEADER_NAME, resolveHeaderName } from "@/shared/lib/resolve-site-assets";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = FALLBACK_HEADER_NAME;
  try {
    const configPath = path.join(process.cwd(), "gitpagedocs/config.json");
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as { site?: { SiteHeaderName?: string; name?: string } };
    siteName = resolveHeaderName(config?.site?.SiteHeaderName, config?.site?.name);
  } catch {
    // fallback kept
  }
  return {
    title: { absolute: siteName },
    openGraph: {
      siteName,
    },
  };
}

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
