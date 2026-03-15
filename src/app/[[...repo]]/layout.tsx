import type { Metadata } from "next";
import path from "node:path";
import { readFile } from "node:fs/promises";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Git Page Docs";
  try {
    const configPath = path.join(process.cwd(), "gitpagedocs/config.json");
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as { site?: { SiteHeaderName?: string; name?: string } };
    siteName = config?.site?.SiteHeaderName?.trim() ?? config?.site?.name ?? siteName;
  } catch {
    // fallback kept
  }
  return {
    title: siteName,
    openGraph: {
      siteName,
    },
  };
}

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
