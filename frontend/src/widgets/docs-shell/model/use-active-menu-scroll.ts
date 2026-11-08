import { useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";
import { flattenMenuTree, type MenuNode } from "./menu-tree";

export function useActiveMenuScroll(nodes: MenuNode[]): RefObject<HTMLElement | null> {
  const containerRef = useRef<HTMLElement>(null);
  const activeKey = flattenMenuTree(nodes).find((node) => node.active)?.key;

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!activeKey || !container) return;
    const activeItem = container.querySelector<HTMLElement>('nav [aria-current="page"]');
    if (!activeItem) return;
    const centerActiveItem = () => {
      if (container.clientHeight === 0) return;
      const visibleTop = container.getBoundingClientRect().top + container.clientTop;
      const itemBounds = activeItem.getBoundingClientRect();
      const centeredOffset = (container.clientHeight - itemBounds.height) / 2;
      container.scrollTop = Math.max(0, container.scrollTop + itemBounds.top - visibleTop - centeredOffset);
    };
    centerActiveItem();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(centerActiveItem);
    observer.observe(container);
    observer.observe(activeItem);
    return () => observer.disconnect();
  }, [activeKey]);

  return containerRef;
}
