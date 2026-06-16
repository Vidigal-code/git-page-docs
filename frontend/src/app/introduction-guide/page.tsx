import { notFound } from "next/navigation";
import { IntroductionGuidePage } from "@/page-slices/introduction-guide";
import { isRepositorySearchEnabled } from "@/shared/lib/repository-search";

export const dynamic = "force-static";

/**
 * The introduction guide only exists in repository-search builds (GitHub Pages /
 * GITPAGEDOCS_REPOSITORY_SEARCH=true). In single-repo/local builds it 404s, so the
 * route never "appears" outside the search-enabled experience.
 */
export default function IntroductionGuideRoute() {
  if (!isRepositorySearchEnabled()) {
    notFound();
  }
  return <IntroductionGuidePage />;
}
