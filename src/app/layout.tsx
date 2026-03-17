import type { Metadata } from "next";
import { FALLBACK_HEADER_NAME, resolveHeaderName, resolveIconPath } from "@/shared/lib/resolve-site-assets";
import { loadRootConfig } from "@/entities/docs/api/io/config-loader";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = FALLBACK_HEADER_NAME;
  let iconPath = "/icon.svg";
  try {
    const config = await loadRootConfig<{ site?: { SiteHeaderName?: string; SiteIconPath?: string; name?: string } }>();
    siteName = resolveHeaderName(config?.site?.SiteHeaderName, config?.site?.name);
    const basePath = (process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH ?? "").trim();
    iconPath = resolveIconPath(config?.site?.SiteIconPath, basePath);
  } catch {
    // fallback kept
  }
  return {
    metadataBase: new URL("https://vidigal-code.github.io/git-page-docs/"),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description:
      "Generate, customize and publish multilingual markdown documentation with layout themes.",
    keywords: [
      "docs",
      "markdown",
      "nextjs",
      "github pages",
      "multilingual",
      "theme",
      "seo",
    ],
    openGraph: {
      title: siteName,
      description:
        "Generate, customize and publish multilingual markdown documentation with layout themes.",
      siteName,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: iconPath,
      shortcut: iconPath,
      apple: iconPath,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
