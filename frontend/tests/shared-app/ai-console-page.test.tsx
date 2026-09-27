// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/ai-console", () => ({ useAiConsole: vi.fn() }));

import { useAiConsole } from "@/features/ai-console";
import AiConsolePage from "@/app/ai/page";

type AiConsole = ReturnType<typeof useAiConsole>;

function makeConsole(overrides: Partial<AiConsole> = {}): AiConsole {
  return {
    initialized: true,
    unlocked: true,
    error: null,
    busy: false,
    providerId: "openai",
    providers: [
      { id: "openai", label: "OpenAI" },
      { id: "claude", label: "Claude" },
    ],
    model: "gpt-4o-mini",
    messages: [],
    unlock: vi.fn(async () => true),
    reset: vi.fn(async () => {}),
    selectProvider: vi.fn(),
    setModel: vi.fn(),
    saveApiKey: vi.fn(async () => {}),
    testConnection: vi.fn(async () => {}),
    send: vi.fn(async () => {}),
    ...overrides,
  } as unknown as AiConsole;
}

function renderPage(overrides: Partial<AiConsole> = {}): AiConsole {
  const ai = makeConsole(overrides);
  vi.mocked(useAiConsole).mockReturnValue(ai);
  render(<AiConsolePage />);
  return ai;
}

afterEach(() => cleanup());

describe("AiConsolePage", () => {
  it("shows the loading card until the vault state is known", () => {
    renderPage({ initialized: null, unlocked: false });
    expect(screen.getByTestId("ai-console").textContent).toContain("Loading…");
    expect(screen.queryByTestId("password-input")).toBeNull();
  });

  it("asks for a new local password on first run and forwards it to unlock", () => {
    const ai = renderPage({ initialized: false, unlocked: false });
    expect(screen.getByText("Create a local password to encrypt your API keys.")).toBeTruthy();
    expect(screen.getByTestId("unlock-button").textContent).toContain("Create password");
    expect(screen.queryByTestId("reset-password")).toBeNull();

    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "hunter2" } });
    fireEvent.click(screen.getByTestId("unlock-button"));
    expect(ai.unlock).toHaveBeenCalledWith("hunter2");
  });

  it("offers unlock, the error and a reset for an existing vault", () => {
    const ai = renderPage({ initialized: true, unlocked: false, error: "Wrong password" });
    expect(screen.getByText("Enter your local password to unlock.")).toBeTruthy();
    expect(screen.getByTestId("unlock-button").textContent).toContain("Unlock");
    expect(screen.getByText("Wrong password")).toBeTruthy();

    fireEvent.click(screen.getByTestId("reset-password"));
    expect(ai.reset).toHaveBeenCalledTimes(1);
  });

  it("wires the provider, model and API key controls once unlocked", () => {
    const ai = renderPage();
    const select = screen.getByTestId("provider-select") as HTMLSelectElement;
    expect(select.value).toBe("openai");
    expect(select.options).toHaveLength(2);
    fireEvent.change(select, { target: { value: "claude" } });
    expect(ai.selectProvider).toHaveBeenCalledWith("claude");

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "gpt-4.1" } });
    expect(ai.setModel).toHaveBeenCalledWith("gpt-4.1");

    fireEvent.change(screen.getByTestId("apikey-input"), { target: { value: "sk-1" } });
    fireEvent.click(screen.getByTestId("save-key"));
    expect(ai.saveApiKey).toHaveBeenCalledWith("sk-1");

    fireEvent.click(screen.getByTestId("test-connection"));
    expect(ai.testConnection).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("messages").textContent).toContain("Ask the AI or test the connection.");
    expect(screen.queryByTestId("console-error")).toBeNull();
  });

  it("renders the transcript in order, including repeated messages, and sends chat input", () => {
    const ai = renderPage({
      messages: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hi" },
        { role: "user", content: "hi" },
      ],
      error: "Quota exceeded",
    });
    const paragraphs = screen.getByTestId("messages").querySelectorAll("p");
    expect([...paragraphs].map((p) => p.textContent)).toEqual(["user: hi", "assistant: hi", "user: hi"]);
    expect(screen.getByTestId("console-error").textContent).toContain("Quota exceeded");

    const chatInput = screen.getByTestId("chat-input") as HTMLInputElement;
    fireEvent.change(chatInput, { target: { value: "hello" } });
    fireEvent.click(screen.getByTestId("chat-send"));
    expect(ai.send).toHaveBeenCalledWith("hello");
    expect(chatInput.value).toBe("");
  });

  it("disables the network actions while busy", () => {
    renderPage({ busy: true });
    expect((screen.getByTestId("chat-send") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId("test-connection") as HTMLButtonElement).disabled).toBe(true);
  });
});
