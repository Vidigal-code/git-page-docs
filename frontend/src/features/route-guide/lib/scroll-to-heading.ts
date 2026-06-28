"use client";

const DEFAULT_SCROLL_PADDING = 80;
const SCROLLABLE_OVERFLOW_VALUES = new Set(["auto", "scroll", "overlay"]);

interface ScrollToHeadingOptions {
  behavior?: ScrollBehavior;
  scrollPadding?: number;
  preferredContainer?: HTMLElement | null;
}

function canScrollVertically(element: HTMLElement): boolean {
  if (element.scrollHeight <= element.clientHeight) {
    return false;
  }

  const { overflowY } = window.getComputedStyle(element);
  return SCROLLABLE_OVERFLOW_VALUES.has(overflowY);
}

function findScrollContainer(element: HTMLElement, preferredContainer?: HTMLElement | null): HTMLElement | null {
  if (preferredContainer?.contains(element) && canScrollVertically(preferredContainer)) {
    return preferredContainer;
  }

  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    if (canScrollVertically(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

function scrollElementInsideContainer(
  element: HTMLElement,
  container: HTMLElement,
  behavior: ScrollBehavior,
  scrollPadding: number,
): void {
  const elementTop = element.getBoundingClientRect().top;
  const containerTop = container.getBoundingClientRect().top;
  const nextTop = elementTop - containerTop + container.scrollTop - scrollPadding;

  container.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}

export function scrollToHeadingElement(element: HTMLElement, options: ScrollToHeadingOptions = {}): void {
  const behavior = options.behavior ?? "smooth";
  const scrollPadding = options.scrollPadding ?? DEFAULT_SCROLL_PADDING;
  const container = findScrollContainer(element, options.preferredContainer);

  if (container) {
    scrollElementInsideContainer(element, container, behavior, scrollPadding);
    return;
  }

  element.scrollIntoView({ behavior, block: "start", inline: "nearest" });
}

export function scrollToHeadingId(headingId: string, options: ScrollToHeadingOptions = {}): boolean {
  const element = document.getElementById(headingId);
  if (!element) {
    return false;
  }

  scrollToHeadingElement(element, options);
  return true;
}

export function getCurrentHeadingHash(): string {
  if (typeof window === "undefined" || !window.location.hash) {
    return "";
  }

  const rawHash = window.location.hash.slice(1);
  try {
    return decodeURIComponent(rawHash);
  } catch {
    return rawHash;
  }
}

export function pushHeadingHash(headingId: string): void {
  const nextHash = `#${encodeURIComponent(headingId)}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;

  window.history.pushState(null, "", nextUrl);
}
