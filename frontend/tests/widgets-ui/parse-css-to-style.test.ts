import { describe, it, expect } from "vitest";
import { parseCssToStyle } from "@/widgets/docs-shell/ui/content-type-containers/parse-css-to-style";

describe("parseCssToStyle", () => {
  it("camelCases kebab-case property names and trims names and values", () => {
    expect(parseCssToStyle("color: red; font-size:12px ;  background-color : #fff")).toEqual({
      color: "red",
      fontSize: "12px",
      backgroundColor: "#fff",
    });
    expect(parseCssToStyle("-webkit-line-clamp: 2")).toEqual({ WebkitLineClamp: "2" });
  });

  it("returns an empty style for no css", () => {
    expect(parseCssToStyle(undefined)).toEqual({});
    expect(parseCssToStyle("")).toEqual({});
  });

  it("skips malformed declarations and keeps the rest", () => {
    expect(parseCssToStyle("font-weight; :bold; color:; margin: 0 auto;;")).toEqual({ margin: "0 auto" });
    expect(parseCssToStyle(";;")).toEqual({});
  });

  it("keeps everything after the first colon as the value", () => {
    expect(parseCssToStyle("background: url(http://example.com/a.png)")).toEqual({
      background: "url(http://example.com/a.png)",
    });
  });
});
