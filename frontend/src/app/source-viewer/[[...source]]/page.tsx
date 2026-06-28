import { notFound } from "next/navigation";
import { parseSourceViewerRoute } from "@/entities/source-viewer";
import { SourceViewerPage } from "@/page-slices/source-viewer";
import { loadDocsRouteData } from "@/processes/docs-loading";
import { isRepositorySearchEnabled } from "@/shared/lib/repository-search";

interface PageProps {
  params: Promise<{ source?: string[] }>;
}

export const dynamic = "force-static";

export function generateStaticParams(): Array<{ source: string[] }> {
  return [
    { source: [] },
    { source: ["Vidigal-code", "git-page-docs", "tree", "main"] },
  ];
}

export default async function SourceViewerRoutePage({ params }: PageProps) {
  if (!isRepositorySearchEnabled()) {
    notFound();
  }

  const { source } = await params;
  const { data } = await loadDocsRouteData(undefined);
  return <SourceViewerPage data={data} initialRoute={parseSourceViewerRoute(source)} />;
}
