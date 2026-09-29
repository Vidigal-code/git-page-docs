import type { CSSProperties } from "react";
import type { ContentTypeRouteConfig } from "@/entities/docs";

const FULL_CONTAINER_STYLE: CSSProperties = { minHeight: "80vh", overflow: "auto" };

/** Route `container`: `"full"` grows with the viewport, a positive number is a fixed height in px. */
export function getContainerStyle(container: ContentTypeRouteConfig["container"]): CSSProperties {
  if (container === "full") return { ...FULL_CONTAINER_STYLE };
  if (typeof container === "number" && container > 0) return { height: container, overflow: "auto" };
  return {};
}
