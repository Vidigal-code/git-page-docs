import type { Metadata } from "next";
import { loadSiteName } from "@/processes/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await loadSiteName();
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
