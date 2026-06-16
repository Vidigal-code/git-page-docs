"use client";

import { useMemo, useState } from "react";
import type { GuideSection } from "./types";

/** Pure predicate: does a section match the query (title, lead or keywords)? Reusable & testable. */
export function sectionMatchesQuery(section: GuideSection, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [section.title, section.lead, ...section.keywords].join(" ").toLowerCase();
  return normalized.split(/\s+/).every((term) => haystack.includes(term));
}

/** Search state + the filtered section list. Keeps filtering logic out of the UI. */
export function useGuideSearch(sections: GuideSection[]): {
  query: string;
  setQuery: (value: string) => void;
  results: GuideSection[];
} {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => sections.filter((section) => sectionMatchesQuery(section, query)),
    [sections, query],
  );
  return { query, setQuery, results };
}
