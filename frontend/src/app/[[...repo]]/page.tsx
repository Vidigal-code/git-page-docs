import { DocsRoutePage } from "@/page-slices/docs-route";

interface PageProps {
  params: Promise<{ repo?: string[] }>;
}

export const dynamic = "force-static";

export { generateDocsStaticParams as generateStaticParams } from "@/processes/docs-routing";

export default async function DocsPage({ params }: Readonly<PageProps>) {
  const { repo } = await params;
  return <DocsRoutePage repoSlug={repo} />;
}
