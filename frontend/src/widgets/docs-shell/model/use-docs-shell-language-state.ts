import { useEffect, useState } from "react";
import type { LanguageCode } from "@/entities/docs";

interface UseDocsShellLanguageStateArgs {
  defaultLanguage: LanguageCode;
  availableLanguages: LanguageCode[];
  languageStorageKey: string;
  searchParams: URLSearchParams | { get(name: string): string | null };
  pathname: string;
  getCurrentSearchParams: () => URLSearchParams;
  replaceUrlWithoutNavigation: (nextPathname: string, params: URLSearchParams) => void;
}

export function useDocsShellLanguageState({
  defaultLanguage,
  availableLanguages,
  languageStorageKey,
  searchParams,
  pathname,
  getCurrentSearchParams,
  replaceUrlWithoutNavigation,
}: UseDocsShellLanguageStateArgs) {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [languageRestored, setLanguageRestored] = useState(false);

  useEffect(() => {
    const langFromQuery = searchParams.get("lang") as LanguageCode | null;
    if (langFromQuery && availableLanguages.includes(langFromQuery)) {
      setLanguage(langFromQuery);
      setLanguageRestored(true);
    }
  }, [searchParams, availableLanguages]);

  useEffect(() => {
    if (languageRestored) {
      return;
    }
    try {
      const savedLanguage = window.localStorage.getItem(languageStorageKey) as LanguageCode | null;
      if (savedLanguage && availableLanguages.includes(savedLanguage)) {
        queueMicrotask(() => {
          setLanguage(savedLanguage);
          setLanguageRestored(true);
        });
        return;
      }
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
    setLanguageRestored(true);
  }, [languageStorageKey, availableLanguages, languageRestored]);

  useEffect(() => {
    if (!languageRestored) {
      return;
    }
    try {
      window.localStorage.setItem(languageStorageKey, String(language));
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
  }, [language, languageStorageKey, languageRestored]);

  function onLanguageChange(newLang: LanguageCode) {
    setLanguage(newLang);
    const params = getCurrentSearchParams();
    params.set("lang", newLang);
    params.delete("version");
    const cleanPath = pathname.replace(/\/$/, "") || pathname;
    replaceUrlWithoutNavigation(cleanPath, params);
  }

  return { language, setLanguage, onLanguageChange };
}
