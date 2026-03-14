import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";

async function loadNotFoundTexts() {
  const fallback = {
    title: "Page not found",
    description: "The requested documentation page does not exist in this repository context.",
    returnHome: "Return Home",
  };

  try {
    const configPath = path.join(process.cwd(), "gitpagedocs/config.json");
    const raw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as GitPageDocsConfig;
    const language = config.site.defaultLanguage ?? "en";
    const translations = config.translations?.notFound;
    return {
      title: translations?.title?.[language] ?? translations?.title?.en ?? fallback.title,
      description:
        translations?.description?.[language] ?? translations?.description?.en ?? fallback.description,
      returnHome: translations?.returnHome?.[language] ?? translations?.returnHome?.en ?? fallback.returnHome,
    };
  } catch {
    return fallback;
  }
}

export default async function NotFound() {
  const texts = await loadNotFoundTexts();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at top, #131b2a, #070b12 55%)",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "min(680px, 100%)",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "32px",
          background: "#0f172a",
          boxShadow: "0 18px 60px rgba(0, 0, 0, 0.4)",
        }}
      >
        <p style={{ margin: 0, color: "#94a3b8", fontWeight: 600 }}>404</p>
        <h1 style={{ marginTop: 8, marginBottom: 12 }}>{texts.title}</h1>
        <p style={{ marginTop: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
          {texts.description}
        </p>
        <Link
          href="/"
          style={{
            marginTop: 8,
            display: "inline-block",
            padding: "10px 16px",
            border: "1px solid #334155",
            borderRadius: "10px",
            background: "#1e293b",
            color: "#f1f5f9",
            fontWeight: 600,
          }}
        >
          {texts.returnHome}
        </Link>
      </section>
    </main>
  );
}
