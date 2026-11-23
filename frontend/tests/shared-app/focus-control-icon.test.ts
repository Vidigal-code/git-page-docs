import { expect, it } from "vitest";
import { resolveControlIcon } from "@/shared/lib/icons/resolve-control-icon";

it.each([undefined, "", "   "])("uses the focused-eye icon when the focus tag is %s", (tag) => {
  const icon = resolveControlIcon({ IconFocusModeReactIcones: true, IconFocusModeReactIconesTag: tag }, { name: "FocusMode", mode: "dark" });
  expect(icon?.tag).toBe("LuScanEye");
});

it("preserves an explicitly configured focus icon and its light-mode style", () => {
  const icon = resolveControlIcon({
    IconFocusModeReactIcones: true,
    IconFocusModeReactIconesTag: "FiBookOpen",
    IconFocusModeReactIconesTagColorLight: "blue",
    IconFocusModeReactIconesTagSize: "24px",
  }, { name: "FocusMode", mode: "light" });
  expect(icon).toEqual({ tag: "FiBookOpen", style: { color: "blue", fontSize: "24px" } });
});

it("preserves a text control when focus icons are disabled", () => {
  expect(resolveControlIcon({ IconFocusModeReactIcones: false }, { name: "FocusMode", mode: "dark" })).toBeUndefined();
});
