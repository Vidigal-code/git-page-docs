"use client";

import { createContext, useContext, type ReactNode, type RefObject } from "react";

export const TocScrollContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function useTocScrollContainer(): RefObject<HTMLElement | null> | null {
  return useContext(TocScrollContainerContext);
}

interface TocScrollContainerProviderProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function TocScrollContainerProvider({
  scrollContainerRef,
  children,
}: TocScrollContainerProviderProps) {
  return (
    <TocScrollContainerContext.Provider value={scrollContainerRef}>
      {children}
    </TocScrollContainerContext.Provider>
  );
}
