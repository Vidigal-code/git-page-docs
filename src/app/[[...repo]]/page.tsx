import { DocsRoutePage } from "@/page-slices/docs-route";
import { generateDocsStaticParams } from "@/processes/docs-routing";

interface PageProps {
  params: Promise<{ repo?: string[] }>;
}

export const dynamic = "force-static";

export const generateStaticParams = generateDocsStaticParams;

export default async function DocsPage({ params }: PageProps) {
  const { repo } = await params;
  return <DocsRoutePage repoSlug={repo} />;
}
