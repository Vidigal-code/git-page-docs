// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAiChat } from "@/features/ask-ai/model/use-ai-chat";
import {
  AUTO_LOCK_WARNING_SECONDS,
  DEFAULT_AUTO_LOCK_SECONDS,
  normalizeAutoLockSeconds,
  resolveInactivityPhase,
  useInactivityLock,
} from "@/features/ask-ai/model/inactivity-lock";
import { InactivityLockDialog } from "@/widgets/ai-chat-drawer/ui/inactivity-lock-dialog";
import { LlmError } from "@/features/ask-ai/api/llm-error";
import type { LlmCompletionParams } from "@/features/ask-ai/api/llm-factory";

const { getLlmService, streamCompletion } = vi.hoisted(() => {
  const streamCompletion = vi.fn<(params: LlmCompletionParams) => Promise<void>>();
  return { streamCompletion, getLlmService: vi.fn(() => ({ streamCompletion })) };
});

vi.mock("@/features/ask-ai/api/llm-factory", () => ({ getLlmService }));

const LABELS = {
  aiChatError401: "Auth error",
  aiChatError429: "Rate limited",
  aiChatError500: "Server error",
  aiChatErrorGeneric: "Generic",
};

const CLOUD_CREDS = async () => ({ providerAndModel: "openai", apiKey: "k" });

function abortError(): Error {
  return Object.assign(new Error("aborted"), { name: "AbortError" });
}

function echoStream(...chunks: string[]) {
  streamCompletion.mockImplementation(async ({ onChunk }) => {
    for (const chunk of chunks) onChunk(chunk);
  });
}

beforeEach(() => {
  window.localStorage.clear();
  streamCompletion.mockReset();
  getLlmService.mockClear();
});

afterEach(cleanup);

describe("useAiChat", () => {
  it("ignores blank messages without attachments", async () => {
    const { result } = renderHook(() => useAiChat());
    await act(async () => {
      await result.current.sendMessage("   ");
    });
    expect(result.current.messages).toEqual([]);
    expect(getLlmService).not.toHaveBeenCalled();
  });

  it("streams the reply into the assistant placeholder using resolved credentials", async () => {
    echoStream("Hel", "lo");
    const resolveCredentials = vi.fn(async () => ({ providerAndModel: "gemini:flash", apiKey: "k-1" }));
    const { result } = renderHook(() => useAiChat("You are docs.", LABELS, resolveCredentials));

    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    expect(resolveCredentials).toHaveBeenCalledTimes(1);
    expect(getLlmService).toHaveBeenCalledWith("gemini:flash", { apiKey: "k-1", baseUrl: undefined });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages.map((m) => [m.role, m.content])).toEqual([
      ["user", "Hi"],
      ["assistant", "Hello"],
    ]);
    const params = streamCompletion.mock.calls[0][0];
    expect(params.messages).toEqual([
      { role: "system", content: "You are docs.", attachments: undefined },
      { role: "user", content: "Hi", attachments: undefined },
    ]);
    expect(params.signal).toBeInstanceOf(AbortSignal);
  });

  it("carries the conversation history into the next request", async () => {
    echoStream("A");
    const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));

    await act(async () => {
      await result.current.sendMessage("first");
    });
    await act(async () => {
      await result.current.sendMessage("second");
    });

    const params = streamCompletion.mock.calls[1][0];
    expect(params.messages.map((m) => [m.role, m.content])).toEqual([
      ["user", "first"],
      ["assistant", "A"],
      ["user", "second"],
    ]);
    expect(result.current.messages).toHaveLength(4);
  });

  it("accepts attachment-only messages", async () => {
    echoStream("seen");
    const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
    const attachments = [{ type: "image" as const, mimeType: "image/png", base64: "abc" }];

    await act(async () => {
      await result.current.sendMessage("", attachments);
    });

    expect(result.current.messages[0].attachments).toEqual(attachments);
    expect(streamCompletion.mock.calls[0][0].messages[0]).toEqual({ role: "user", content: "", attachments });
  });

  describe("legacy credential fallback (no resolver injected)", () => {
    it("uses the stored key as an API key for cloud providers", async () => {
      echoStream("ok");
      window.localStorage.setItem("gitpagedocs_ai_provider", "claude:sonnet");
      window.localStorage.setItem("gitpagedocs_ai_key", "sk-legacy");
      const { result } = renderHook(() => useAiChat());
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(getLlmService).toHaveBeenCalledWith("claude:sonnet", { apiKey: "sk-legacy", baseUrl: undefined });
    });

    it("uses the stored value as a base URL for ollama", async () => {
      echoStream("ok");
      window.localStorage.setItem("gitpagedocs_ai_provider", "ollama:llama3");
      window.localStorage.setItem("gitpagedocs_ai_key", "http://localhost:11434");
      const { result } = renderHook(() => useAiChat());
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(getLlmService).toHaveBeenCalledWith("ollama:llama3", { apiKey: undefined, baseUrl: "http://localhost:11434" });
    });

    it("defaults to openai with no key when nothing is stored", async () => {
      echoStream("ok");
      const { result } = renderHook(() => useAiChat());
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(getLlmService).toHaveBeenCalledWith("openai", { apiKey: undefined, baseUrl: undefined });
    });
  });

  it("surfaces a locked vault as the 401 label without calling the provider", async () => {
    const { result } = renderHook(() => useAiChat(undefined, LABELS, async () => null));
    await act(async () => {
      await result.current.sendMessage("Hi");
    });
    expect(getLlmService).not.toHaveBeenCalled();
    expect(result.current.messages[1].content).toBe("Auth error Try again!");
    expect(result.current.isLoading).toBe(false);
  });

  it("falls back to the generic then hard-coded label when the vault is locked", async () => {
    const generic = renderHook(() => useAiChat(undefined, { aiChatErrorGeneric: "Generic" }, async () => null));
    await act(async () => {
      await generic.result.current.sendMessage("Hi");
    });
    expect(generic.result.current.messages[1].content).toBe("Generic Try again!");

    const bare = renderHook(() => useAiChat(undefined, undefined, async () => null));
    await act(async () => {
      await bare.result.current.sendMessage("Hi");
    });
    expect(bare.result.current.messages[1].content).toBe("Authentication error Try again!");
  });

  describe("error mapping", () => {
    it.each([
      [401, "Auth error"],
      [403, "Auth error"],
      [429, "Rate limited"],
      [500, "Server error"],
      [503, "Server error"],
      [404, "Generic"],
    ])("maps LlmError %s to its label", async (status, label) => {
      streamCompletion.mockRejectedValue(new LlmError("provider said no", status));
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe(`\n\n${label} Try again!`);
      expect(result.current.isLoading).toBe(false);
    });

    it("shows the raw message for status-less (network/CORS) LlmErrors", async () => {
      streamCompletion.mockRejectedValue(new LlmError("Could not reach openai.", 0));
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe("\n\nCould not reach openai. Try again!");
    });

    it("keeps the generic label for LlmErrors without a status code", async () => {
      streamCompletion.mockRejectedValue(new LlmError("unknown"));
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe("\n\nGeneric Try again!");
    });

    it("uses the generic label for non-LlmError failures and a hard-coded default without labels", async () => {
      streamCompletion.mockRejectedValue(new Error("boom"));
      const labelled = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await labelled.result.current.sendMessage("Hi");
      });
      expect(labelled.result.current.messages[1].content).toBe("\n\nGeneric Try again!");

      const bare = renderHook(() => useAiChat(undefined, undefined, CLOUD_CREDS));
      await act(async () => {
        await bare.result.current.sendMessage("Hi");
      });
      expect(bare.result.current.messages[1].content).toBe("\n\nGeneric Error Try again!");
    });

    it("leaves the partial reply untouched when the request was aborted", async () => {
      streamCompletion.mockImplementation(async ({ onChunk }) => {
        onChunk("partial");
        throw abortError();
      });
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe("partial");
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("cancelMessage aborts the in-flight request and clears the loading flag", async () => {
    streamCompletion.mockImplementation(
      ({ signal }) =>
        new Promise<void>((_, reject) => {
          signal?.addEventListener("abort", () => reject(abortError()));
        }),
    );
    const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.sendMessage("Hi");
    });
    await waitFor(() => expect(streamCompletion).toHaveBeenCalledTimes(1));
    expect(result.current.isLoading).toBe(true);

    act(() => result.current.cancelMessage());
    await act(async () => {
      await pending;
    });

    expect(streamCompletion.mock.calls[0][0].signal?.aborted).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages[1].content).toBe("");
  });

  it("aborts the previous request when a new message is sent while one is in flight", async () => {
    const signals: AbortSignal[] = [];
    streamCompletion.mockImplementation(({ signal, onChunk }) => {
      if (signal) signals.push(signal);
      return new Promise<void>((resolve, reject) => {
        signal?.addEventListener("abort", () => reject(abortError()));
        if (signals.length === 2) {
          onChunk("second reply");
          resolve();
        }
      });
    });
    const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.sendMessage("one");
    });
    await waitFor(() => expect(streamCompletion).toHaveBeenCalledTimes(1));
    await act(async () => {
      await result.current.sendMessage("two");
      await first;
    });

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    expect(result.current.messages.map((m) => m.content)).toEqual(["one", "", "two", "second reply"]);
  });

  it("clearMessages empties the log and cancels any pending request", async () => {
    echoStream("x");
    const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
    await act(async () => {
      await result.current.sendMessage("Hi");
    });
    expect(result.current.messages).toHaveLength(2);
    act(() => result.current.clearMessages());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("closes provider errors with the localized retry hint and no brackets", async () => {
    streamCompletion.mockRejectedValue(new LlmError("upstream", 500));
    const labels = { aiChatError500: "Ocorreu um erro interno no servidor do modelo de IA.", aiChatRetryHint: "Tente novamente!" };
    const { result } = renderHook(() => useAiChat(undefined, labels, CLOUD_CREDS));
    await act(async () => {
      await result.current.sendMessage("Oi");
    });
    expect(result.current.messages[1].content).toBe("\n\nOcorreu um erro interno no servidor do modelo de IA. Tente novamente!");
    expect(result.current.messages[1].content).not.toContain("[");
  });
});

describe("inactivity auto-lock", () => {
  it("normalizes the configured seconds: default 30, 0 disables, rounds, rejects junk", () => {
    expect(DEFAULT_AUTO_LOCK_SECONDS).toBe(30);
    expect(AUTO_LOCK_WARNING_SECONDS).toBe(10);
    expect(normalizeAutoLockSeconds(undefined)).toBe(30);
    expect(normalizeAutoLockSeconds("abc")).toBe(30);
    expect(normalizeAutoLockSeconds(-5)).toBe(30);
    expect(normalizeAutoLockSeconds(Number.NaN)).toBe(30);
    expect(normalizeAutoLockSeconds(0)).toBe(0);
    expect(normalizeAutoLockSeconds(60)).toBe(60);
    expect(normalizeAutoLockSeconds("100")).toBe(100);
    expect(normalizeAutoLockSeconds(45.6)).toBe(46);
  });

  it("resolves the phase of an idle session", () => {
    expect(resolveInactivityPhase(0, 30)).toEqual({ phase: "active" });
    expect(resolveInactivityPhase(19_999, 30)).toEqual({ phase: "active" });
    expect(resolveInactivityPhase(20_000, 30)).toEqual({ phase: "warning", remaining: 10 });
    expect(resolveInactivityPhase(25_500, 30)).toEqual({ phase: "warning", remaining: 5 });
    expect(resolveInactivityPhase(30_000, 30)).toEqual({ phase: "locked" });
    expect(resolveInactivityPhase(1_000, 5)).toEqual({ phase: "warning", remaining: 4 });
    expect(resolveInactivityPhase(1_000_000, 0)).toEqual({ phase: "active" });
  });

  describe("useInactivityLock", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    function setup(seconds = 30, enabled = true) {
      const onLock = vi.fn();
      const hook = renderHook(() => useInactivityLock({ enabled, seconds, onLock }));
      return { ...hook, onLock };
    }

    it("warns after the quiet period, counts down and locks at the limit", () => {
      const { result, onLock } = setup();
      act(() => vi.advanceTimersByTime(19_000));
      expect(result.current.warningOpen).toBe(false);
      act(() => vi.advanceTimersByTime(1_000));
      expect(result.current.warningOpen).toBe(true);
      expect(result.current.remaining).toBe(10);
      act(() => vi.advanceTimersByTime(5_000));
      expect(result.current.remaining).toBe(5);
      act(() => vi.advanceTimersByTime(5_000));
      expect(onLock).toHaveBeenCalledTimes(1);
      expect(result.current.warningOpen).toBe(false);
    });

    it("activity resets the quiet period but is ignored once the warning is open", () => {
      const { result, onLock } = setup();
      act(() => vi.advanceTimersByTime(15_000));
      act(() => result.current.registerActivity());
      act(() => vi.advanceTimersByTime(15_000));
      expect(result.current.warningOpen).toBe(false);
      act(() => vi.advanceTimersByTime(5_000));
      expect(result.current.warningOpen).toBe(true);
      act(() => result.current.registerActivity());
      act(() => vi.advanceTimersByTime(3_000));
      expect(result.current.remaining).toBe(7);
      expect(onLock).not.toHaveBeenCalled();
    });

    it("cancel keeps the session and restarts the period; confirm locks immediately", () => {
      const { result, onLock } = setup();
      act(() => vi.advanceTimersByTime(22_000));
      act(() => result.current.cancelWarning());
      expect(result.current.warningOpen).toBe(false);
      act(() => vi.advanceTimersByTime(20_000));
      expect(result.current.warningOpen).toBe(true);
      act(() => result.current.lockNow());
      expect(onLock).toHaveBeenCalledTimes(1);
      expect(result.current.warningOpen).toBe(false);
    });

    it("never warns when disabled or when the limit is 0", () => {
      const disabled = setup(30, false);
      const zero = setup(0, true);
      act(() => vi.advanceTimersByTime(120_000));
      expect(disabled.result.current.warningOpen).toBe(false);
      expect(zero.result.current.warningOpen).toBe(false);
      expect(disabled.onLock).not.toHaveBeenCalled();
      expect(zero.onLock).not.toHaveBeenCalled();
    });
  });

  describe("InactivityLockDialog", () => {
    const DIALOG_LABELS = {
      title: "Bloqueio por inatividade",
      description: "Você não usou a IA por um tempo. O chat será bloqueado em {seconds}s.",
      confirm: "Salvar",
      cancel: "Cancelar",
    };

    function renderDialog(remaining = 12, open = true) {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      render(createElement(InactivityLockDialog, { open, remaining, labels: DIALOG_LABELS, onConfirm, onCancel }));
      return { onConfirm, onCancel };
    }

    it("renders a modal with the localized copy and a live countdown, nothing when closed", () => {
      renderDialog(12);
      expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
      expect(screen.getByText("Bloqueio por inatividade")).toBeTruthy();
      expect(screen.getByText("Você não usou a IA por um tempo. O chat será bloqueado em 12s.")).toBeTruthy();
      const countdown = screen.getByTestId("ai-lock-countdown");
      expect(countdown.textContent).toBe("12");
      expect(countdown.getAttribute("aria-live")).toBe("polite");
      cleanup();
      renderDialog(5, false);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("focuses Cancel on open and keeps Tab inside the dialog", () => {
      renderDialog();
      const cancel = screen.getByTestId("ai-lock-cancel");
      const confirm = screen.getByTestId("ai-lock-confirm");
      expect(document.activeElement).toBe(cancel);
      fireEvent.keyDown(cancel, { key: "Tab" });
      expect(document.activeElement).toBe(confirm);
      fireEvent.keyDown(confirm, { key: "Tab" });
      expect(document.activeElement).toBe(cancel);
      fireEvent.keyDown(cancel, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(confirm);
    });

    it("confirm locks, cancel keeps the session and Escape counts as cancel", () => {
      const { onConfirm, onCancel } = renderDialog();
      fireEvent.click(screen.getByTestId("ai-lock-confirm"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByTestId("ai-lock-cancel"));
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(2);
    });
  });
});
