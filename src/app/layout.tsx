import type { Metadata } from "next";
import { loadSiteMetadata } from "@/processes/site-metadata";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, iconPath } = await loadSiteMetadata();
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
