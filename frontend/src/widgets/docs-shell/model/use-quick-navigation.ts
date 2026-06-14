import { useEffect, useMemo, useRef, useState } from "react";

interface QuickNavigationEntryBase {
  searchLabel: string;
}

export function useQuickNavigation<TEntry extends QuickNavigationEntryBase>(entries: TEntry[]) {
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [quickNavQuery, setQuickNavQuery] = useState("");
  const [quickNavActiveIndex, setQuickNavActiveIndex] = useState(0);
  const quickNavListRef = useRef<HTMLDivElement | null>(null);
  const quickNavItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredQuickNavEntries = useMemo<TEntry[]>(() => {
    const normalizedQuery = quickNavQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return entries;
    }
    return entries.filter((entry) => entry.searchLabel.toLowerCase().includes(normalizedQuery));
  }, [entries, quickNavQuery]);

  function openQuickNavigation() {
    setQuickNavOpen(true);
    setQuickNavQuery("");
    setQuickNavActiveIndex(0);
  }

  function closeQuickNavigation() {
    setQuickNavOpen(false);
    setQuickNavQuery("");
    setQuickNavActiveIndex(0);
  }

  useEffect(() => {
    if (!quickNavOpen) {
      return;
    }
    const list = quickNavListRef.current;
    const activeButton = quickNavItemRefs.current[quickNavActiveIndex];
    if (!list || !activeButton) {
      return;
    }
    activeButton.scrollIntoView({ block: "nearest" });
  }, [quickNavOpen, quickNavActiveIndex, filteredQuickNavEntries.length]);

  useEffect(() => {
    if (!quickNavOpen) {
      return;
    }
    quickNavListRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [quickNavOpen, quickNavQuery]);

  return {
    quickNavOpen,
    setQuickNavOpen,
    quickNavQuery,
    setQuickNavQuery,
    quickNavActiveIndex,
    setQuickNavActiveIndex,
    quickNavListRef,
    quickNavItemRefs,
    filteredQuickNavEntries,
    openQuickNavigation,
    closeQuickNavigation,
  };
}
