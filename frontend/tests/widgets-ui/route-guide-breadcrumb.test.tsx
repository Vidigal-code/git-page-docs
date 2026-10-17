// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { RouteGuideBreadcrumb } from "@/features/route-guide";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";

afterEach(cleanup);
function BreadcrumbExample(): React.JSX.Element {
  const [page, setPage] = useState("install.md");
  return <><RouteGuideBreadcrumb trail={[{ title: "Docs", pathClick: "", ancestorKeys: [] }, { title: "Guides", pathClick: "guides.md", ancestorKeys: ["docs"] }, { title: "Install", pathClick: "install.md", ancestorKeys: ["docs", "guides"] }]} onNavigate={setPage} iconConfig={resolveRouteGuideIconConfig({}, false, "")} homePathClick="intro.md" /><output>{page}</output></>;
}
it("marks the current breadcrumb as text and navigates only actionable ancestors", () => {
  render(<BreadcrumbExample />);
  const navigation = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(within(navigation).queryByRole("button", { name: "Install" })).toBeNull();
  expect(within(navigation).getByText("Install").getAttribute("aria-current")).toBe("page");
  expect(within(navigation).queryByRole("button", { name: "Docs" })).toBeNull();
  fireEvent.click(within(navigation).getByRole("button", { name: "Guides" }));
  expect(screen.getByRole("status").textContent).toBe("guides.md");
  fireEvent.click(within(navigation).getByRole("button", { name: "Home" }));
  expect(screen.getByRole("status").textContent).toBe("intro.md");
});
