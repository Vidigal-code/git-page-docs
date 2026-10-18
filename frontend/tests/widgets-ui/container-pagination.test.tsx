// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ContainerPagination } from "@/widgets/docs-shell/ui/content-type-containers/container-pagination";
import type { PaginatedContainer } from "@/entities/docs/lib/pagination/resolve-container-pages";

afterEach(cleanup);

const container: PaginatedContainer = {
  key: "page-1-md", ownerPageId: 1, type: "md", index: 1,
  items: [1, 2, 3].map((id) => ({ block: { id: String(id), type: "md", content: { routeId: id, config: { id }, markdownByLanguage: { en: "Text" } } }, title: undefined })),
  options: {},
};

it("shows four accessible controls and a counter aligned right, and navigates to each destination", () => {
  const onSelect = vi.fn();
  render(<ContainerPagination container={container} language="en" onSelect={onSelect} />);
  expect(screen.getAllByRole("button")).toHaveLength(4);
  expect(screen.getByRole("navigation").dataset.alignment).toBe("right");
  expect(screen.getByRole("status").textContent).toContain("2 / 3");
  for (const name of ["First page", "Previous page", "Next page", "Last page"]) fireEvent.click(screen.getByRole("button", { name }));
  expect(onSelect.mock.calls.map(([selection]) => selection)).toEqual([
    { key: "page-1-md", index: 0 }, { key: "page-1-md", index: 0 },
    { key: "page-1-md", index: 2 }, { key: "page-1-md", index: 2 },
  ]);
});

it("uses localized text, optional controls and counters, and disables unavailable destinations", () => {
  const customized = { ...container, index: 0, options: {
    display: "text" as const, alignment: "left" as const, showCount: false,
    controls: { last: false }, labels: { first: { pt: "Início" }, previous: { pt: "Voltar" }, next: { pt: "Avançar" } },
  } };
  render(<ContainerPagination container={customized} language="pt" onSelect={vi.fn()} />);
  expect(screen.getAllByRole("button")).toHaveLength(3);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("navigation").dataset.alignment).toBe("left");
  const first = screen.getByRole<HTMLButtonElement>("button", { name: "Início" });
  expect(first.disabled).toBe(true);
  expect(first.textContent).toBe("Início");
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Voltar" }).disabled).toBe(true);
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Avançar" }).disabled).toBe(false);
});
