"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getBasePath(): string {
  if (typeof window === "undefined") return "/git-page-docs";
  const p = window.location.pathname;
  return p.startsWith("/git-page-docs") ? "/git-page-docs" : "";
}

const NOT_INSTALLED = {
  en: "GitPageDocs is not installed.",
  pt: "GitPageDocs Não instalado.",
  es: "GitPageDocs no está instalado.",
};

const SEARCH_PROMPT = {
  en: "Enter owner and repository to open remote documentation.",
  pt: "Informe usuário e repositório para abrir a documentação remota.",
  es: "Ingresa usuario y repositorio para abrir la documentación remota.",
};

const RETURN_HOME = {
  en: "Return Home",
  pt: "Voltar ao início",
  es: "Volver al inicio",
};

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pathOwner, setPathOwner] = useState<string | null>(null);
  const [pathRepo, setPathRepo] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "pt" | "es">("en");

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    const base = getBasePath();
    const withoutBase = base ? path.slice(base.length) : path;
    const parts = withoutBase.split("/").filter(Boolean);
    if (parts.length >= 2) {
      setPathOwner(parts[0]);
      setPathRepo(parts[1]);
    }
  }, []);

  if (!mounted) {
    return (
      <main style={styles.main}>
        <section style={styles.section}>
          <p style={styles.loading}>Loading...</p>
        </section>
      </main>
    );
  }

  const isRepoPath = pathOwner && pathRepo;
  const message = isRepoPath ? NOT_INSTALLED[lang] : "Page not found";
  const prompt = isRepoPath ? SEARCH_PROMPT[lang] : "The requested page does not exist.";
  const returnLabel = RETURN_HOME[lang];

  return (
    <main style={styles.main}>
      <section style={styles.section}>
        <p style={styles.code}>404</p>
        <h1 style={styles.title}>{message}</h1>
        <p style={styles.description}>{prompt}</p>

        {isRepoPath && (
          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const owner = (form.querySelector('[name="owner"]') as HTMLInputElement)?.value?.trim();
              const repo = (form.querySelector('[name="repo"]') as HTMLInputElement)?.value?.trim();
              if (owner && repo) {
                router.push(`/${owner}/${repo}`);
              }
            }}
          >
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "pt" | "es")}
              style={styles.select}
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
            </select>
            <input
              name="owner"
              placeholder={lang === "pt" ? "Usuário (ex: Vidigal-code)" : lang === "es" ? "Usuario (ej: Vidigal-code)" : "Owner (ex: Vidigal-code)"}
              defaultValue={pathOwner}
              style={styles.input}
            />
            <input
              name="repo"
              placeholder={lang === "pt" ? "Repositório (ex: git-page-link-create)" : lang === "es" ? "Repositorio (ej: git-page-link-create)" : "Repository (ex: git-page-link-create)"}
              defaultValue={pathRepo}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              {lang === "pt" ? "Buscar" : lang === "es" ? "Buscar" : "Search"}
            </button>
          </form>
        )}

        <a href={(getBasePath() ? getBasePath() + "/" : "/")} style={styles.link}>
          {returnLabel}
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #131b2a, #070b12 55%)",
    padding: "24px",
  },
  section: {
    width: "min(680px, 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "32px",
    background: "#0f172a",
    boxShadow: "0 18px 60px rgba(0, 0, 0, 0.4)",
  },
  loading: {
    margin: 0,
    color: "#94a3b8",
  },
  code: {
    margin: 0,
    color: "#94a3b8",
    fontWeight: 600,
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    marginTop: 0,
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: 20,
    marginBottom: 16,
  },
  select: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    maxWidth: 200,
  },
  input: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
  },
  button: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#7c3aed",
    color: "#f1f5f9",
    fontWeight: 600,
    cursor: "pointer",
  },
  link: {
    display: "inline-block",
    marginTop: 8,
    padding: "10px 16px",
    border: "1px solid #334155",
    borderRadius: 10,
    background: "#1e293b",
    color: "#f1f5f9",
    fontWeight: 600,
    textDecoration: "none",
  },
};
