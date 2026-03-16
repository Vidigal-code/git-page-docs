"use client";

import { useEffect, useState } from "react";
import { useTocScrollContainer } from "../model/toc-scroll-context";
import type { HeadingItem } from "@/entities/docs/lib/markdown/extract-headings";
import styles from "./toc-tree.module.css";

interface TocTreeProps {
  headings: HeadingItem[];
  activeId?: string;
  className?: string;
}

export function TocTree({ headings, activeId, className }: TocTreeProps) {
  const [active, setActive] = useState(activeId || "");
  const scrollContainerRef = useTocScrollContainer();

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

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className={`${styles.toc} ${className ?? ""}`} aria-label="Table of contents">
      <ul className={styles.list}>
        {headings.map((h) => (
          <li
            key={h.id}
            className={styles.item}
            style={{ paddingLeft: `${(h.level - minLevel) * 12}px` }}
          >
            <a
              href={`#${h.id}`}
              className={`${styles.link} ${active === h.id ? styles.active : ""}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (!el) return;
                const container = scrollContainerRef?.current;
                if (container && container.contains(el)) {
                  const scrollPadding = 80;
                  const elTop = el.getBoundingClientRect().top;
                  const containerTop = container.getBoundingClientRect().top;
                  const scrollOffset = elTop - containerTop + container.scrollTop - scrollPadding;
                  container.scrollTo({ top: Math.max(0, scrollOffset), behavior: "smooth" });
                } else {
                  el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                }
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
