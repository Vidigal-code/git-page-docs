// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ApiKeyForm } from "@/features/ask-ai/ui/api-key-form";

/** jsdom has no matchMedia; the dropdown asks it for hover support and screen size. */
function stubMatchMedia(): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // jsdom has no scrollIntoView; the dropdown scrolls the current option into view on open.
  Element.prototype.scrollIntoView = vi.fn();
  stubMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ApiKeyForm provider picker", () => {
  it("renders the themed dropdown with the default option and switches to the Ollama URL field", () => {
    render(<ApiKeyForm onSave={vi.fn()} labels={{ aiChatProviderLabel: "Provedor:" }} />);
    const picker = screen.getByTestId("drawer-provider-select");
    // The native <select> popup ignores the theme; the shared dropdown replaces it.
    expect(picker.querySelector("select")).toBeNull();
    const trigger = picker.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toBe("OpenAI · GPT-4o mini");
    expect(trigger.getAttribute("aria-label")).toBe("Provedor");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Ollama · Llama 3" }));

    expect(trigger.textContent).toBe("Ollama · Llama 3");
    expect((screen.getByTestId("drawer-apikey-input") as HTMLInputElement).placeholder).toContain("11434");
  });

  it("reports the chosen provider:model on save", () => {
    const onSave = vi.fn();
    render(<ApiKeyForm onSave={onSave} />);
    fireEvent.change(screen.getByTestId("drawer-apikey-input"), { target: { value: "sk-1" } });
    fireEvent.click(screen.getByTestId("drawer-save-key"));
    expect(onSave).toHaveBeenCalledWith("openai:gpt-4o-mini", "sk-1");
  });
});
