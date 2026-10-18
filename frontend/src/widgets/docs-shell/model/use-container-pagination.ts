import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveContainerPages, type ContainerPageSelection, type LoadedDocsData, type RouteAuthorizationConfig, type ResolvedContainerPages } from "@/entities/docs";

export interface ContainerPaginationState extends ResolvedContainerPages {
  select: (selection: ContainerPageSelection) => void;
}

interface ContainerPaginationInput {
  data: LoadedDocsData;
  language: string;
  canAccess: (authorization: RouteAuthorizationConfig | undefined) => boolean;
}

export function useContainerPagination({ data, language, canAccess }: ContainerPaginationInput): ContainerPaginationState {
  const context = `${data.config.site.name}:${data.activeVersionId ?? ""}:${language}`;
  const [selection, setSelection] = useState<{ context: string; positions: Record<string, number> }>({ context, positions: {} });
  if (selection.context !== context) setSelection({ context, positions: {} });
  const resolved = useMemo(() => resolveContainerPages({
    pages: data.pages ?? [], positions: selection.context === context ? selection.positions : {},
    defaults: data.config.site.containerPagination, canAccess,
  }), [data.pages, data.config.site.containerPagination, selection, context, canAccess]);
  useEffect(() => {
    // eslint-disable-next-line no-console -- Report invalid public configuration to site authors.
    for (const issue of resolved.issues) console.warn(`[pagination] ${issue}`);
  }, [resolved.issues]);
  const select = useCallback(({ key, index }: ContainerPageSelection): void => {
    const container = resolved.containers.find((item) => item.key === key);
    if (!container || !Number.isSafeInteger(index) || index < 0 || index >= container.items.length) return;
    setSelection((previous) => ({ context, positions: { ...previous.context === context ? previous.positions : {}, [key]: index } }));
  }, [resolved.containers, context]);
  return { ...resolved, select };
}
