"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

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

const INSTALLED_NOT_PRERENDERED = {
  en: "GitPageDocs is installed in this repository.",
  pt: "GitPageDocs esta instalado neste repositorio.",
  es: "GitPageDocs esta instalado en este repositorio.",
};

const SEARCH_PROMPT = {
  en: "Enter owner and repository to open remote documentation.",
  pt: "Informe usuário e repositório para abrir a documentação remota.",
  es: "Ingresa usuario y repositorio para abrir la documentación remota.",
};

const INSTALLED_PROMPT = {
  en: "This direct URL was not pre-rendered on GitHub Pages. Use the search form below with the same owner and repository.",
  pt: "Esta URL direta nao foi pre-renderizada no GitHub Pages. Use o formulario de busca abaixo com o mesmo usuario e repositorio.",
  es: "Esta URL directa no fue pre-renderizada en GitHub Pages. Usa el formulario de busqueda abajo con el mismo usuario y repositorio.",
};

const RETURN_HOME = {
  en: "Return Home",
  pt: "Voltar ao início",
  es: "Volver al inicio",
};

type RepoStatus = "unknown" | "checking" | "installed" | "not_installed";

type VersionConfig = {
  routes?: Array<{
    path?: Record<string, string>;
  }>;
};

function normalizeRelativePath(input: string): string {
  return input.replace(/^\/+/, "");
}

async function fetchRepoText(owner: string, repo: string, relativePath: string): Promise<string | null> {
  const normalizedPath = normalizeRelativePath(relativePath);
  const candidates = [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${normalizedPath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${normalizedPath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/${normalizedPath}`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      return await response.text();
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

async function fetchRepoJson<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
  const text = await fetchRepoText(owner, repo, relativePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function loadRemotePreviewHtml(owner: string, repo: string, language: "en" | "pt" | "es"): Promise<string | null> {
  const config = await fetchRepoJson<{
    VersionControl?: { versions?: Array<{ PathConfig?: string; path?: string }> };
  }>(owner, repo, "gitpagedocs/config.json");
  if (!config) {
    return null;
  }

  const firstVersion = config.VersionControl?.versions?.[0];
  const versionConfigPath = firstVersion?.PathConfig || firstVersion?.path;
  if (!versionConfigPath) {
    return null;
  }

  const versionConfig = await fetchRepoJson<VersionConfig>(owner, repo, versionConfigPath);
  if (!versionConfig?.routes?.length) {
    return null;
  }

  const firstRoute = versionConfig.routes[0];
  const markdownPath = firstRoute?.path?.[language] || firstRoute?.path?.en || firstRoute?.path?.pt || firstRoute?.path?.es;
  if (!markdownPath) {
    return null;
  }

  const markdown = await fetchRepoText(owner, repo, markdownPath);
  if (!markdown) {
    return null;
  }

  return marked.parse(markdown) as string;
}

async function checkRepositoryHasGitPageDocs(owner: string, repo: string): Promise<boolean> {
  const candidates = [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/gitpagedocs/config.json`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/gitpagedocs/config.json`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/gitpagedocs/config.json`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      const body = await response.text();
      JSON.parse(body);
      return true;
    } catch {
      // Ignore candidate errors and try the next one.
    }
  }
  return false;
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [pathOwner, setPathOwner] = useState<string | null>(null);
  const [pathRepo, setPathRepo] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "pt" | "es">("en");
  const [repoStatus, setRepoStatus] = useState<RepoStatus>("unknown");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

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

  useEffect(() => {
    if (!pathOwner || !pathRepo) {
      return;
    }

    let cancelled = false;
    setRepoStatus("checking");
    checkRepositoryHasGitPageDocs(pathOwner, pathRepo).then((hasGitPageDocs) => {
      if (cancelled) {
        return;
      }
      setRepoStatus(hasGitPageDocs ? "installed" : "not_installed");
    });

    return () => {
      cancelled = true;
    };
  }, [pathOwner, pathRepo]);

  useEffect(() => {
    if (!pathOwner || !pathRepo || repoStatus !== "installed") {
      setPreviewHtml("");
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    loadRemotePreviewHtml(pathOwner, pathRepo, lang)
      .then((html) => {
        if (cancelled) return;
        setPreviewHtml(html ?? "");
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathOwner, pathRepo, repoStatus, lang]);

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
  const message = isRepoPath
    ? repoStatus === "installed"
      ? INSTALLED_NOT_PRERENDERED[lang]
      : NOT_INSTALLED[lang]
    : "Page not found";
  const prompt = isRepoPath
    ? repoStatus === "installed"
      ? INSTALLED_PROMPT[lang]
      : SEARCH_PROMPT[lang]
    : "The requested page does not exist.";
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
                setPathOwner(owner);
                setPathRepo(repo);
                setRepoStatus("unknown");
                const basePath = getBasePath();
                const nextPath = `${basePath}/${owner}/${repo}/`;
                window.history.replaceState({}, "", nextPath);
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

        {repoStatus === "installed" && (
          <section style={styles.previewSection}>
            <p style={styles.previewTitle}>{lang === "pt" ? "Previa da documentacao" : lang === "es" ? "Vista previa de la documentacion" : "Documentation preview"}</p>
            {previewLoading ? (
              <p style={styles.loading}>{lang === "pt" ? "Carregando..." : lang === "es" ? "Cargando..." : "Loading..."}</p>
            ) : previewHtml ? (
              <div style={styles.previewBody} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p style={styles.loading}>
                {lang === "pt"
                  ? "Nao foi possivel carregar a previa deste repositorio."
                  : lang === "es"
                    ? "No fue posible cargar la vista previa de este repositorio."
                    : "Could not load preview for this repository."}
              </p>
            )}
          </section>
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
  previewSection: {
    marginTop: 16,
    border: "1px solid #334155",
    borderRadius: 12,
    background: "#0b1322",
    padding: 12,
  },
  previewTitle: {
    margin: "0 0 8px 0",
    color: "#cbd5e1",
    fontWeight: 700,
  },
  previewBody: {
    maxHeight: "45vh",
    overflowY: "auto",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: 12,
    background: "#0f172a",
    color: "#f8fafc",
    lineHeight: 1.55,
  },
};
