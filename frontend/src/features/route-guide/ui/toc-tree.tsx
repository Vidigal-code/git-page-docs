"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { useTocScrollContainer } from "../model/toc-scroll-context";
import { pushHeadingHash, scrollToHeadingId } from "../lib/scroll-to-heading";
import type { HeadingItem } from "@/entities/docs";
import styles from "./toc-tree.module.css";

const DESKTOP_TOC_MIN_WIDTH = 1025;

function revealActiveGuideLink(navigation: HTMLElement, documentScrollContainer: HTMLElement | null): void {
  const activeLink = navigation.querySelector<HTMLElement>('[aria-current="location"]');
  if (!activeLink) return;
  const scrollport = [navigation, navigation.parentElement].find(element =>
    element && element !== documentScrollContainer
    && element.scrollHeight > element.clientHeight
    && ["auto", "scroll"].includes(getComputedStyle(element).overflowY)
  );
  if (!scrollport) return;

  const linkBounds = activeLink.getBoundingClientRect();
  const viewportTop = scrollport.getBoundingClientRect().top + scrollport.clientTop;
  const viewportBottom = viewportTop + scrollport.clientHeight;
  let scrollDelta = 0;
  if (linkBounds.top < viewportTop) scrollDelta = linkBounds.top - viewportTop;
  else if (linkBounds.bottom > viewportBottom) scrollDelta = linkBounds.bottom - viewportBottom;
  if (scrollDelta !== 0) scrollport.scrollBy({ top: scrollDelta, behavior: "instant" });
}

interface TocTreeProps {
  headings: HeadingItem[];
  activeId?: string;
  className?: string;
  /** When true, use default anchor behavior instead of custom scroll (for fullscreen mode) */
  useDefaultScrollBehavior?: boolean;
}

export function TocTree({ headings, activeId, className, useDefaultScrollBehavior = false }: Readonly<TocTreeProps>): ReactElement | null {
  const [active, setActive] = useState(activeId || "");
  const scrollContainerRef = useTocScrollContainer();
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActive(activeId || "");
  }, [activeId]);

  useEffect(() => {
    if (headings.length === 0) return;

    const root = scrollContainerRef?.current ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActive(id);
          }
        }
      },
      { root, rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, scrollContainerRef]);

  useEffect(() => {
    const revealActive = () => {
      if (window.innerWidth < DESKTOP_TOC_MIN_WIDTH) return;
      const navigation = navigationRef.current;
      if (navigation) revealActiveGuideLink(navigation, scrollContainerRef?.current ?? null);
    };
    revealActive();
    window.addEventListener("resize", revealActive);
    return () => window.removeEventListener("resize", revealActive);
  }, [active, scrollContainerRef]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav ref={navigationRef} className={`${styles.toc} ${className ?? ""}`} aria-label="Table of contents">
      <ul className={styles.list}>
        {headings.map((h) => (
          <li
            key={h.id}
            className={styles.item}
            style={{ paddingLeft: `${(h.level - minLevel) * 12}px` }}
          >
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`${styles.link} ${active === h.id ? styles.active : ""}`}
              {...(useDefaultScrollBehavior
                ? {}
                : {
                    onClick: (e: React.MouseEvent) => {
                      e.preventDefault();
                      const didScroll = scrollToHeadingId(h.id, {
                        preferredContainer: scrollContainerRef?.current ?? null,
                      });
                      if (didScroll) {
                        setActive(h.id);
                        pushHeadingHash(h.id);
                      }
                    },
                  })}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
