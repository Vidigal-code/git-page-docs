// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAiChat } from "@/features/ask-ai/model/use-ai-chat";
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
    expect(result.current.messages[1].content).toBe("[Auth error]");
    expect(result.current.isLoading).toBe(false);
  });

  it("falls back to the generic then hard-coded label when the vault is locked", async () => {
    const generic = renderHook(() => useAiChat(undefined, { aiChatErrorGeneric: "Generic" }, async () => null));
    await act(async () => {
      await generic.result.current.sendMessage("Hi");
    });
    expect(generic.result.current.messages[1].content).toBe("[Generic]");

    const bare = renderHook(() => useAiChat(undefined, undefined, async () => null));
    await act(async () => {
      await bare.result.current.sendMessage("Hi");
    });
    expect(bare.result.current.messages[1].content).toBe("[Authentication error]");
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
      expect(result.current.messages[1].content).toBe(`\n\n[${label}]`);
      expect(result.current.isLoading).toBe(false);
    });

    it("shows the raw message for status-less (network/CORS) LlmErrors", async () => {
      streamCompletion.mockRejectedValue(new LlmError("Could not reach openai.", 0));
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe("\n\n[Could not reach openai.]");
    });

    it("keeps the generic label for LlmErrors without a status code", async () => {
      streamCompletion.mockRejectedValue(new LlmError("unknown"));
      const { result } = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await result.current.sendMessage("Hi");
      });
      expect(result.current.messages[1].content).toBe("\n\n[Generic]");
    });

    it("uses the generic label for non-LlmError failures and a hard-coded default without labels", async () => {
      streamCompletion.mockRejectedValue(new Error("boom"));
      const labelled = renderHook(() => useAiChat(undefined, LABELS, CLOUD_CREDS));
      await act(async () => {
        await labelled.result.current.sendMessage("Hi");
      });
      expect(labelled.result.current.messages[1].content).toBe("\n\n[Generic]");

      const bare = renderHook(() => useAiChat(undefined, undefined, CLOUD_CREDS));
      await act(async () => {
        await bare.result.current.sendMessage("Hi");
      });
      expect(bare.result.current.messages[1].content).toBe("\n\n[Generic Error]");
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
});
