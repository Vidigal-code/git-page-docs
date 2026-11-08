// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useActiveSection } from "@/page-slices/introduction-guide/model/use-active-section";

const SECTION_IDS = ["overview", "quickstart"];
const SECTION_TOP = 600;
const REVEAL_OFFSET = 8;
const HEADER_BOUNDARY = 97;
const WRAPPER_TOP = 500;
const WRAPPER_BORDER = 2;
const CHILD_TOP = 98;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("selects the section at the header after its ancestor reveal transform ends", () => {
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  document.body.innerHTML = '<section id="overview"></section><div><section id="quickstart"></section></div>';
  const overview = document.getElementById("overview")!;
  const quickstart = document.getElementById("quickstart")!;
  const wrapper = quickstart.parentElement!;
  let revealOffset = REVEAL_OFFSET;
  overview.getBoundingClientRect = () => ({ top: -window.scrollY }) as DOMRect;
  quickstart.getBoundingClientRect = () => ({ top: SECTION_TOP + revealOffset - window.scrollY }) as DOMRect;
  Object.defineProperties(wrapper, {
    offsetTop: { value: WRAPPER_TOP },
    clientTop: { value: WRAPPER_BORDER },
  });
  Object.defineProperties(quickstart, {
    offsetTop: { value: CHILD_TOP },
    offsetParent: { value: wrapper },
  });
  const { result } = renderHook(() => useActiveSection(SECTION_IDS));
  expect(result.current.activeId).toBe("overview");
  revealOffset = 0;
  act(() => {
    vi.stubGlobal("scrollY", SECTION_TOP - HEADER_BOUNDARY);
    window.dispatchEvent(new Event("scroll"));
  });
  expect(result.current.activeId).toBe("quickstart");
});
