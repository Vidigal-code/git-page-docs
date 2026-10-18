import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

interface QuickNavigationEntryBase {
  searchLabel: string;
}

interface QuickNavigationState<TEntry> {
  quickNavQuery: string;
  setQuickNavQuery: Dispatch<SetStateAction<string>>;
  quickNavActiveIndex: number;
  quickNavActiveIndexRef: RefObject<number>;
  setQuickNavActiveIndex: Dispatch<SetStateAction<number>>;
  quickNavListRef: RefObject<HTMLDivElement | null>;
  quickNavItemRefs: RefObject<Array<HTMLButtonElement | null>>;
  filteredQuickNavEntries: TEntry[];
}

export function filterQuickNavigationEntries<TEntry extends QuickNavigationEntryBase>(entries: TEntry[], query: string): TEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  return normalizedQuery ? entries.filter((entry) => entry.searchLabel.toLowerCase().includes(normalizedQuery)) : entries;
}

export function useQuickNavigation<TEntry extends QuickNavigationEntryBase>(entries: TEntry[]): QuickNavigationState<TEntry> {
  const [quickNavQuery, setQuickNavQuery] = useState("");
  const [quickNavActiveIndex, setActiveIndex] = useState(0);
  const quickNavActiveIndexRef = useRef(0);
  const quickNavListRef = useRef<HTMLDivElement | null>(null);
  const quickNavItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredQuickNavEntries = useMemo(() => filterQuickNavigationEntries(entries, quickNavQuery), [entries, quickNavQuery]);
  const setQuickNavActiveIndex = useCallback<Dispatch<SetStateAction<number>>>((update) => {
    const nextIndex = typeof update === "function" ? update(quickNavActiveIndexRef.current) : update;
    quickNavActiveIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => {
    const list = quickNavListRef.current;
    const activeButton = quickNavItemRefs.current[quickNavActiveIndex];
    if (!list || !activeButton) {
      return;
    }
    activeButton.scrollIntoView({ block: "nearest" });
  }, [quickNavActiveIndex, filteredQuickNavEntries.length]);

  useEffect(() => {
    quickNavListRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [quickNavQuery]);

  return {
    quickNavQuery,
    setQuickNavQuery,
    quickNavActiveIndex,
    quickNavActiveIndexRef,
    setQuickNavActiveIndex,
    quickNavListRef,
    quickNavItemRefs,
    filteredQuickNavEntries,
  };
}
