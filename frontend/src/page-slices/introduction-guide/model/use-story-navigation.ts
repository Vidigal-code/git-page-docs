"use client";

import { useEffect, type RefObject } from "react";
import { chapterAt } from "./story";

const GESTURE_IDLE_MS = 180;
const PINNED_STORY_QUERY = "(min-height: 521px)";
const SWIPE_THRESHOLD_PX = 24;
const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [contenteditable], [role='dialog'], [role='listbox']";
const KEY_DIRECTION: Readonly<Record<string, number>> = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };

interface StoryNavigationOptions {
  readonly storyRef: RefObject<HTMLElement | null>;
  readonly total: number;
  readonly goToChapter: (index: number) => void;
}

interface TouchGesture {
  readonly x: number;
  readonly y: number;
  consumed: boolean;
}

function pinnedChapter(story: HTMLElement, total: number): number | undefined {
  const bounds = story.getBoundingClientRect();
  if (bounds.top > 0 || bounds.bottom < window.innerHeight) return undefined;
  return chapterAt(-bounds.top / (story.offsetHeight - window.innerHeight), total);
}

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

/** One gesture selects one complete chapter; page boundaries, controls and zoom keep their native behavior. */
export function useStoryNavigation({ storyRef, total, goToChapter }: StoryNavigationOptions): void {
  useEffect(() => {
    const story = storyRef.current;
    if (!story || total === 0) return;
    const pinnedLayout = window.matchMedia(PINNED_STORY_QUERY);
    let lastWheelAt = Number.NEGATIVE_INFINITY;
    let lastDirection = 0;
    let wheelConsumed = false;
    let touch: TouchGesture | undefined;

    const destinationFor = (direction: number): number | undefined => {
      const current = pinnedChapter(story, total);
      if (current === undefined) return undefined;
      const next = current + direction;
      return next < 0 || next >= total ? undefined : next;
    };

    const step = (direction: number): boolean => {
      const next = destinationFor(direction);
      if (next === undefined) return false;
      goToChapter(next);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (!pinnedLayout.matches || event.ctrlKey || event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (pinnedChapter(story, total) === undefined) return;
      const direction = Math.sign(event.deltaY);
      const now = performance.now();
      const continuingGesture = direction === lastDirection && now - lastWheelAt < GESTURE_IDLE_MS;
      lastWheelAt = now;
      lastDirection = direction;
      if (!continuingGesture) wheelConsumed = step(direction);
      if (wheelConsumed) event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!pinnedLayout.matches || event.altKey || event.ctrlKey || event.metaKey || isInteractive(event.target)) return;
      let direction = KEY_DIRECTION[event.key];
      if (event.key === " ") direction = event.shiftKey ? -1 : 1;
      if (!direction) return;
      const next = destinationFor(direction);
      if (next === undefined) return;
      if (!event.repeat) goToChapter(next);
      event.preventDefault();
    };

    const onTouchStart = (event: TouchEvent) => {
      touch = undefined;
      if (!pinnedLayout.matches || event.touches.length !== 1 || isInteractive(event.target)) return;
      if (pinnedChapter(story, total) === undefined) return;
      const start = event.touches[0];
      touch = { x: start.clientX, y: start.clientY, consumed: false };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) {
        touch = undefined;
        return;
      }
      if (touch.consumed) {
        event.preventDefault();
        return;
      }
      const point = event.touches[0];
      const deltaY = touch.y - point.clientY;
      if (Math.abs(deltaY) <= Math.abs(touch.x - point.clientX)) return;
      const direction = Math.sign(deltaY);
      if (destinationFor(direction) === undefined) return;
      event.preventDefault();
      if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
      touch.consumed = step(direction);
    };

    const clearTouch = () => {
      touch = undefined;
    };

    story.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    story.addEventListener("touchstart", onTouchStart, { passive: true });
    story.addEventListener("touchmove", onTouchMove, { passive: false });
    story.addEventListener("touchend", clearTouch);
    story.addEventListener("touchcancel", clearTouch);
    return () => {
      story.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      story.removeEventListener("touchstart", onTouchStart);
      story.removeEventListener("touchmove", onTouchMove);
      story.removeEventListener("touchend", clearTouch);
      story.removeEventListener("touchcancel", clearTouch);
    };
  }, [storyRef, total, goToChapter]);
}
