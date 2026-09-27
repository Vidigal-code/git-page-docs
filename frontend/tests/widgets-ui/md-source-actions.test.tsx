// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MdSourceActions, markdownFileName } from "@/widgets/docs-shell/ui/content-type-containers/md-source-actions";

const labels = { copy: "Copiar Markdown", copied: "Copiado!", copyError: "Não foi possível copiar", download: "Baixar .md" };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("markdownFileName", () => {
  it("uses the file name of the route path, else a slug of the title", () => {
    expect(markdownFileName("gitpagedocs/docs/versions/0.0.3/pt/getting-started.md")).toBe("getting-started.md");
    expect(markdownFileName("docs/readme")).toBe("readme.md");
    expect(markdownFileName(undefined, "Primeiros passos!")).toBe("primeiros-passos.md");
    expect(markdownFileName(undefined, "--Olá, mundo--")).toBe("ola-mundo.md");
    expect(markdownFileName(undefined, undefined)).toBe("document.md");
  });
});

describe("MdSourceActions", () => {
  it("copies the original markdown and confirms it for a moment", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<MdSourceActions source={"# Oi\n"} fileName="a.md" labels={labels} />);

    const copy = screen.getByTestId("md-copy");
    expect(copy.getAttribute("aria-label")).toBe("Copiar Markdown");
    await act(async () => {
      fireEvent.click(copy);
    });
    expect(writeText).toHaveBeenCalledWith("# Oi\n");
    expect(copy.getAttribute("aria-label")).toBe("Copiado!");
    expect(screen.getByRole("status").textContent).toBe("Copiado!");

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(copy.getAttribute("aria-label")).toBe("Copiar Markdown");
  });

  it("reports a failed copy", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<MdSourceActions source="x" fileName="a.md" labels={labels} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("md-copy"));
    });
    expect(screen.getByTestId("md-copy").getAttribute("aria-label")).toBe("Não foi possível copiar");
  });

  it("reports a failed copy when the Clipboard API is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    render(<MdSourceActions source="x" fileName="a.md" labels={labels} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("md-copy"));
    });
    expect(screen.getByTestId("md-copy").getAttribute("aria-label")).toBe("Não foi possível copiar");
  });

  it("downloads the markdown as a .md file", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:md");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<MdSourceActions source="# Oi" fileName="getting-started.md" labels={labels} />);

    fireEvent.click(screen.getByTestId("md-download"));

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/markdown;charset=utf-8");
    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe("getting-started.md");
    act(() => {
      vi.runAllTimers();
    });
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:md");
  });
});
