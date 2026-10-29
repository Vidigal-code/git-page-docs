// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { DocsShellVersionLinksOverlay } from "@/widgets/docs-shell/ui/docs-shell-version-links-overlay";

beforeAll(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value(this: HTMLDialogElement) { this.setAttribute("open", ""); } },
    close: { configurable: true, value(this: HTMLDialogElement) { this.removeAttribute("open"); } },
  });
});
afterEach(cleanup);
afterAll(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

it("lets readers follow a named repository link from the dialog", () => {
  const props = {
    isOpen: true,
    versionLinksLabel: "Links do repositório",
    menuCloseLabel: "Fechar",
    options: [{ id: "branch" as const, label: "Branch", name: "Principal", url: "https://github.com/Vidigal-code/git-page-docs/tree/main" }],
    onClose: vi.fn(),
  };
  render(<DocsShellVersionLinksOverlay {...props} />);
  expect(screen.getByRole("link", { name: "Principal" }).getAttribute("href"))
    .toBe("https://github.com/Vidigal-code/git-page-docs/tree/main");
});

it("names the modal so readers can identify the repository navigation", () => {
  render(<DocsShellVersionLinksOverlay
    isOpen
    versionLinksLabel="Links do repositório"
    menuCloseLabel="Fechar"
    options={[{ id: "branch", label: "Branch", url: "https://example.com/tree/main" }]}
    onClose={vi.fn()}
  />);
  expect(screen.getByRole("dialog", { name: "Links do repositório" })).toBeDefined();
});

it("groups named destinations by category without replacing their names", () => {
  render(<DocsShellVersionLinksOverlay
    isOpen
    versionLinksLabel="Links do repositório"
    menuCloseLabel="Fechar"
    options={[
      { id: "branch", label: "Branches", name: "Principal", url: "https://example.com/main" },
      { id: "branch", label: "Branches", name: "Desenvolvimento", url: "https://example.com/develop" },
      { id: "release", label: "Releases", name: "Versão 0.0.16", url: "https://example.com/v0.0.16" },
      { id: "commit", label: "Commits", name: "Correção da documentação", url: "https://example.com/commit/123" },
    ]}
    onClose={vi.fn()}
  />);
  const branches = screen.getByRole("region", { name: "Branches" });
  expect(within(branches).getAllByRole("link").map((link) => link.getAttribute("aria-label")))
    .toEqual(["Principal", "Desenvolvimento"]);
  expect(within(screen.getByRole("region", { name: "Releases" })).getByRole("link", { name: "Versão 0.0.16" })).toBeDefined();
  expect(within(screen.getByRole("region", { name: "Commits" })).getByRole("link", { name: "Correção da documentação" })).toBeDefined();
});
