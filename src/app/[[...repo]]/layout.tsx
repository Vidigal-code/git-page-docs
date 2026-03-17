import type { Metadata } from "next";
import { FALLBACK_HEADER_NAME, resolveHeaderName } from "@/shared/lib/resolve-site-assets";
import { loadRootConfig } from "@/entities/docs/api/io/config-loader";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = FALLBACK_HEADER_NAME;
  try {
    const config = await loadRootConfig<{ site?: { SiteHeaderName?: string; name?: string } }>();
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
