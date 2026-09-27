// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROVIDER_CATALOG } from "@gitpagedocs/tools/ai";
import { useAiConsole } from "@/features/ai-console/model/use-ai-console";

const { vault, provider, create } = vi.hoisted(() => {
  const vault = { initialized: false, password: null as string | null, keys: new Map<string, string>() };
  const provider = { generate: vi.fn(), stream: vi.fn() };
  return { vault, provider, create: vi.fn(() => provider) };
});

// In-memory stand-in for the encrypted vault: same async surface, no crypto.
vi.mock("@/shared/lib/ai-secure-storage", () => ({
  AiSecureStorage: class {
    async isInitialized(): Promise<boolean> {
      return vault.initialized;
    }
    async setPassword(password: string): Promise<void> {
      vault.initialized = true;
      vault.password = password;
    }
    async unlock(password: string): Promise<boolean> {
      return password === vault.password;
    }
    async saveKey(_password: string, providerId: string, key: string): Promise<void> {
      vault.keys.set(providerId, key);
    }
    async getKey(_password: string, providerId: string): Promise<string | undefined> {
      return vault.keys.get(providerId);
    }
    async reset(): Promise<void> {
      vault.initialized = false;
      vault.password = null;
      vault.keys.clear();
    }
  },
}));

vi.mock("@gitpagedocs/tools/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gitpagedocs/tools/ai")>();
  return { ...actual, createDefaultFactory: () => ({ create }) };
});

const MISSING_KEY = "No saved key for openai. Add one above.";

beforeEach(() => {
  vault.initialized = false;
  vault.password = null;
  vault.keys.clear();
  provider.generate.mockReset();
  provider.stream.mockReset();
  create.mockClear();
});

async function unlockedConsole(password = "pw") {
  const hook = renderHook(() => useAiConsole());
  await act(async () => {
    await hook.result.current.unlock(password);
  });
  return hook;
}

afterEach(cleanup);

describe("useAiConsole", () => {
  it("reports the vault status and the provider catalog after mount", async () => {
    const { result } = renderHook(() => useAiConsole());
    await waitFor(() => expect(result.current.initialized).toBe(false));
    expect(result.current.unlocked).toBe(false);
    expect(result.current.providerId).toBe("openai");
    expect(result.current.model).toBe(PROVIDER_CATALOG.openai.defaultModel);
    expect(result.current.providers).toContainEqual({ id: "openai", label: "OpenAI" });
    expect(result.current.providers).toContainEqual({ id: "ollama", label: PROVIDER_CATALOG.ollama.label });
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("creates the vault password on the first unlock", async () => {
    const { result } = renderHook(() => useAiConsole());
    let ok = false;
    await act(async () => {
      ok = await result.current.unlock("first-pw");
    });
    expect(ok).toBe(true);
    expect(vault.password).toBe("first-pw");
    expect(result.current.unlocked).toBe(true);
    expect(result.current.initialized).toBe(true);
  });

  it("verifies the password on later runs", async () => {
    vault.initialized = true;
    vault.password = "right";
    const { result } = renderHook(() => useAiConsole());

    let ok = true;
    await act(async () => {
      ok = await result.current.unlock("wrong");
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe("Incorrect password.");
    expect(result.current.unlocked).toBe(false);

    await act(async () => {
      ok = await result.current.unlock("right");
    });
    expect(ok).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.unlocked).toBe(true);
  });

  it("switches the model with the provider and lets the user override it", () => {
    const { result } = renderHook(() => useAiConsole());
    act(() => result.current.selectProvider("gemini"));
    expect(result.current.providerId).toBe("gemini");
    expect(result.current.model).toBe(PROVIDER_CATALOG.gemini.defaultModel);
    act(() => result.current.setModel("gemini-custom"));
    expect(result.current.model).toBe("gemini-custom");
  });

  it("ignores saveApiKey while locked and stores the trimmed key once unlocked", async () => {
    const locked = renderHook(() => useAiConsole());
    await act(async () => {
      await locked.result.current.saveApiKey("  sk-locked ");
    });
    expect(vault.keys.size).toBe(0);

    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("  sk-1 ");
    });
    expect(vault.keys.get("openai")).toBe("sk-1");
  });

  it("testConnection reports a missing key without calling the provider", async () => {
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.testConnection();
    });
    expect(result.current.error).toBe(MISSING_KEY);
    expect(provider.generate).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(false);
    expect(result.current.messages).toEqual([]);
  });

  it("testConnection appends a trimmed confirmation on success", async () => {
    provider.generate.mockResolvedValue({ text: "  OK  ", model: "gpt-4o-mini" });
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("sk-1");
      await result.current.testConnection();
    });
    expect(create).toHaveBeenCalledWith("openai");
    expect(provider.generate).toHaveBeenCalledWith(
      { messages: [{ role: "user", content: "Reply with the single word: OK" }], maxTokens: 5 },
      { providerId: "openai", model: PROVIDER_CATALOG.openai.defaultModel, apiKey: "sk-1", baseUrl: undefined },
    );
    expect(result.current.messages).toEqual([{ role: "assistant", content: "Connection OK — OK" }]);
    expect(result.current.error).toBeNull();
    expect(result.current.busy).toBe(false);
  });

  it("lets ollama connect without a key and mirrors the stored value as its base URL", async () => {
    provider.generate.mockResolvedValue({ text: "OK", model: "llama3" });
    const { result } = await unlockedConsole();
    act(() => result.current.selectProvider("ollama"));
    await act(async () => {
      await result.current.testConnection();
    });
    expect(provider.generate.mock.calls[0][1]).toEqual({
      providerId: "ollama",
      model: PROVIDER_CATALOG.ollama.defaultModel,
      apiKey: undefined,
      baseUrl: undefined,
    });

    await act(async () => {
      await result.current.saveApiKey("http://localhost:11434");
      await result.current.testConnection();
    });
    expect(provider.generate.mock.calls[1][1]).toEqual({
      providerId: "ollama",
      model: PROVIDER_CATALOG.ollama.defaultModel,
      apiKey: "http://localhost:11434",
      baseUrl: "http://localhost:11434",
    });
  });

  it("testConnection surfaces browser network failures with the CORS hint", async () => {
    provider.generate.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("sk-1");
      await result.current.testConnection();
    });
    expect(result.current.error).toMatch(/Could not reach openai/);
    expect(result.current.busy).toBe(false);
  });

  it("send ignores blank text", async () => {
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.send("   ");
    });
    expect(result.current.messages).toEqual([]);
    expect(provider.stream).not.toHaveBeenCalled();
  });

  it("send streams the reply into the assistant placeholder", async () => {
    provider.stream.mockImplementation(async function* () {
      yield "He";
      yield "llo";
    });
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("sk-1");
      await result.current.send("hi");
    });
    expect(provider.stream).toHaveBeenCalledWith(
      { messages: [{ role: "user", content: "hi" }] },
      { providerId: "openai", model: PROVIDER_CATALOG.openai.defaultModel, apiKey: "sk-1", baseUrl: undefined },
    );
    expect(result.current.messages).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "Hello" },
    ]);
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("send keeps the placeholder and reports a missing key", async () => {
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.send("hi");
    });
    expect(result.current.messages).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "" },
    ]);
    expect(result.current.error).toBe(MISSING_KEY);
    expect(provider.stream).not.toHaveBeenCalled();
  });

  it("send reports mid-stream failures and keeps the partial reply", async () => {
    provider.stream.mockImplementation(async function* () {
      yield "par";
      throw new Error("stream broke");
    });
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("sk-1");
      await result.current.send("hi");
    });
    expect(result.current.messages[1]).toEqual({ role: "assistant", content: "par" });
    expect(result.current.error).toBe("stream broke");
    expect(result.current.busy).toBe(false);
  });

  it("reset wipes the vault and returns to the create-password gate", async () => {
    const { result } = await unlockedConsole();
    await act(async () => {
      await result.current.saveApiKey("sk-1");
      await result.current.reset();
    });
    expect(vault.initialized).toBe(false);
    expect(vault.keys.size).toBe(0);
    expect(result.current.unlocked).toBe(false);
    expect(result.current.initialized).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.savedProviders).toEqual([]);
  });
});
