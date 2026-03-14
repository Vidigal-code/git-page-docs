import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vidigal-code.github.io"),
  title: {
    default: "Git Page Docs",
    template: "%s | Git Page Docs",
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
    title: "Git Page Docs",
    description:
      "Generate, customize and publish multilingual markdown documentation with layout themes.",
    siteName: "Git Page Docs",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
