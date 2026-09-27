import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, ProviderError } from "@gitpagedocs/tools/errors";
import { PROVIDER_CATALOG } from "@gitpagedocs/tools/ai";
import { getLlmService } from "@/features/ask-ai/api/llm-factory";
import { SharedLlmService } from "@/features/ask-ai/api/providers/shared-llm-service";
import { LlmError } from "@/features/ask-ai/api/llm-error";
import { MAX_STREAM_ATTEMPTS, isTransientStatus, retryDelayMs } from "@/features/ask-ai/api/retry-policy";
import {
  AI_MODEL_DEFAULTS,
  buildProviderModelOptions,
  isKnownModel,
  listProviderModels,
  normalizeProviderAndModel,
} from "@/shared/config/ai-config";

const { streamMock, createMock } = vi.hoisted(() => {
  const streamMock = vi.fn();
  const provider = {
    id: "openai",
    capabilities: { streaming: true, vision: false, audio: false },
    generate: vi.fn(),
    stream: streamMock,
  };
  return { streamMock, createMock: vi.fn(() => provider) };
});

vi.mock("@gitpagedocs/tools/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gitpagedocs/tools/ai")>();
  return { ...actual, createDefaultFactory: () => ({ create: createMock }) };
});

function yields(...deltas: string[]) {
  streamMock.mockImplementation(async function* () {
    for (const delta of deltas) yield delta;
  });
}

function yieldsThenThrows(error: unknown) {
  streamMock.mockImplementation(async function* () {
    yield "partial";
    throw error;
  });
}

/** The first attempt fails with `status`; later attempts stream `then` (or fail again when omitted). */
function failsFirst(status: number | undefined, then?: string[]) {
  let calls = 0;
  streamMock.mockImplementation(async function* () {
    calls += 1;
    if (calls === 1 || !then) {
      throw new ProviderError("upstream", status === undefined ? undefined : { details: { status } });
    }
    for (const delta of then) yield delta;
  });
}

async function rejection(promise: Promise<unknown>): Promise<LlmError> {
  try {
    await promise;
  } catch (error) {
    return error as LlmError;
  }
  throw new Error("expected the promise to reject");
}

const NO_DELAY = { retryDelayMs: () => 0 };

beforeEach(() => {
  streamMock.mockReset();
  createMock.mockClear();
});

describe("LlmError", () => {
  it("is a named Error carrying the HTTP status", () => {
    const error = new LlmError("nope", 429);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("LlmError");
    expect(error.statusCode).toBe(429);
    expect(new LlmError("no status").statusCode).toBeUndefined();
  });
});

describe("getLlmService", () => {
  it("returns the shared adapter for any provider string", () => {
    expect(getLlmService("openai:gpt-4o", { apiKey: "sk" })).toBeInstanceOf(SharedLlmService);
  });
});

describe("SharedLlmService.streamCompletion", () => {
  it("rejects with a 401 LlmError before calling the provider when a cloud key is missing", async () => {
    const service = new SharedLlmService("openai:gpt-4o");
    await expect(service.streamCompletion({ messages: [], onChunk: vi.fn() })).rejects.toMatchObject({
      name: "LlmError",
      statusCode: 401,
      message: "openai API key missing",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("streams deltas and maps messages + attachments to the shared AI contract", async () => {
    yields("Hel", "lo");
    const onChunk = vi.fn();
    const controller = new AbortController();
    const service = new SharedLlmService("openai:gpt-4o", { apiKey: "sk" });

    await service.streamCompletion({
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hi", attachments: [{ type: "image", mimeType: "image/png", base64: "Zm9v" }] },
      ],
      onChunk,
      signal: controller.signal,
    });

    expect(onChunk.mock.calls).toEqual([["Hel"], ["lo"]]);
    expect(createMock).toHaveBeenCalledWith("openai");
    expect(streamMock).toHaveBeenCalledWith(
      {
        messages: [
          { role: "system", content: "be brief", attachments: undefined },
          { role: "user", content: "hi", attachments: [{ kind: "image", mimeType: "image/png", data: "Zm9v" }] },
        ],
        signal: controller.signal,
      },
      { providerId: "openai", model: "gpt-4o", apiKey: "sk", baseUrl: undefined },
    );
  });

  it("falls back to the catalog default model and maps legacy provider names", async () => {
    yields();
    await new SharedLlmService("claude", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() });
    expect(streamMock.mock.calls[0][1]).toEqual({
      providerId: "anthropic",
      model: PROVIDER_CATALOG.anthropic.defaultModel,
      apiKey: "sk",
      baseUrl: undefined,
    });
  });

  it("lets ollama run without a key and forwards its base URL instead", async () => {
    yields("ok");
    const onChunk = vi.fn();
    await new SharedLlmService("ollama:llama3", { baseUrl: "http://localhost:11434" }).streamCompletion({
      messages: [{ role: "user", content: "hi" }],
      onChunk,
    });
    expect(onChunk).toHaveBeenCalledWith("ok");
    expect(streamMock.mock.calls[0][1]).toEqual({
      providerId: "ollama",
      model: "llama3",
      apiKey: undefined,
      baseUrl: "http://localhost:11434",
    });
  });

  it("re-throws an AbortError untouched so the chat can ignore it", async () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    yieldsThenThrows(abort);
    const onChunk = vi.fn();
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk }),
    ).rejects.toBe(abort);
    expect(onChunk).toHaveBeenCalledWith("partial");
  });

  it("turns browser network/CORS failures into a status-0 LlmError with an actionable hint", async () => {
    yieldsThenThrows(new TypeError("Failed to fetch"));
    const rejection = new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() });
    await expect(rejection).rejects.toBeInstanceOf(LlmError);
    await expect(rejection).rejects.toMatchObject({ statusCode: 0 });
    await expect(rejection).rejects.toThrow(/Could not reach openai/);
  });

  it("uses the HTTP status carried by shared AppErrors and keeps status-less ones status-less", async () => {
    yieldsThenThrows(new ProviderError("rate limited", { details: { status: 429 } }));
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    ).rejects.toMatchObject({ name: "LlmError", statusCode: 429, message: "rate limited" });

    // A provider error without an HTTP status (no fetch, bad frame) is not a
    // server error: the chat must not present it as one.
    yieldsThenThrows(new AppError("unknown provider failure"));
    const statusless = await rejection(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(statusless).toBeInstanceOf(LlmError);
    expect(statusless.message).toBe("unknown provider failure");
    expect(statusless.statusCode).toBeUndefined();
  });

  it("maps plain errors and non-Error throwables to a status-less LlmError", async () => {
    yieldsThenThrows(new Error("boom"));
    const plain = await rejection(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(plain).toMatchObject({ name: "LlmError", message: "boom" });
    expect(plain.statusCode).toBeUndefined();

    yieldsThenThrows("bad things");
    const thrown = await rejection(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(thrown).toMatchObject({ name: "LlmError", message: "bad things" });
    expect(thrown.statusCode).toBeUndefined();
  });
});

describe("retry policy", () => {
  it("treats timeouts, rate limits and 5xx as transient, everything else as final", () => {
    for (const status of [408, 425, 429, 500, 502, 503, 504]) expect(isTransientStatus(status)).toBe(true);
    for (const status of [400, 401, 403, 404, 422, 0, undefined]) expect(isTransientStatus(status)).toBe(false);
    expect(MAX_STREAM_ATTEMPTS).toBe(3);
    expect(retryDelayMs(1)).toBeGreaterThan(0);
    expect(retryDelayMs(2)).toBeGreaterThan(retryDelayMs(1));
  });
});

describe("SharedLlmService retries transient provider failures", () => {
  it("retries a 503 and delivers the reply from the second attempt", async () => {
    failsFirst(503, ["He", "llo"]);
    const chunks: string[] = [];
    await new SharedLlmService("openai:gpt-4o-mini", { apiKey: "sk" }, NO_DELAY).streamCompletion({
      messages: [{ role: "user", content: "hi" }],
      onChunk: (chunk) => chunks.push(chunk),
    });
    expect(chunks).toEqual(["He", "llo"]);
    expect(streamMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after the maximum attempts with the last status", async () => {
    failsFirst(503);
    const error = await rejection(
      new SharedLlmService("openai:gpt-4o-mini", { apiKey: "sk" }, NO_DELAY).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(error).toMatchObject({ name: "LlmError", statusCode: 503 });
    expect(streamMock).toHaveBeenCalledTimes(MAX_STREAM_ATTEMPTS);
  });

  it("does not retry final errors such as 401", async () => {
    failsFirst(401, ["never"]);
    const error = await rejection(
      new SharedLlmService("openai:gpt-4o-mini", { apiKey: "sk" }, NO_DELAY).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(error.statusCode).toBe(401);
    expect(streamMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry once output has already been streamed", async () => {
    yieldsThenThrows(new ProviderError("cut", { details: { status: 502 } }));
    const error = await rejection(
      new SharedLlmService("openai:gpt-4o-mini", { apiKey: "sk" }, NO_DELAY).streamCompletion({ messages: [], onChunk: vi.fn() }),
    );
    expect(error.statusCode).toBe(502);
    expect(streamMock).toHaveBeenCalledTimes(1);
  });

  it("self-heals a retired model id to the provider default before calling the provider", async () => {
    yields("ok");
    await new SharedLlmService("claude:claude-3-5-sonnet-20240620", { apiKey: "sk" }, NO_DELAY).streamCompletion({
      messages: [],
      onChunk: vi.fn(),
    });
    const config = streamMock.mock.calls[0][1] as { model: string; providerId: string };
    expect(config.providerId).toBe("anthropic");
    expect(config.model).toBe(PROVIDER_CATALOG.anthropic.defaultModel);
  });

  it("leaves Ollama model names alone (any pulled model is valid)", async () => {
    yields("ok");
    await new SharedLlmService("ollama:codellama", { baseUrl: "http://localhost:11434" }, NO_DELAY).streamCompletion({
      messages: [],
      onChunk: vi.fn(),
    });
    expect((streamMock.mock.calls[0][1] as { model: string }).model).toBe("codellama");
  });
});

describe("ai-config is driven by the shared provider catalog", () => {
  it("takes every default model from the catalog", () => {
    expect(AI_MODEL_DEFAULTS.openai).toBe(PROVIDER_CATALOG.openai.defaultModel);
    expect(AI_MODEL_DEFAULTS.claude).toBe(PROVIDER_CATALOG.anthropic.defaultModel);
    expect(AI_MODEL_DEFAULTS.gemini).toBe(PROVIDER_CATALOG.gemini.defaultModel);
    expect(AI_MODEL_DEFAULTS.ollama).toBe(PROVIDER_CATALOG.ollama.defaultModel);
  });

  it("lists only current catalog models, default first", () => {
    expect(listProviderModels("gemini")[0]).toBe(PROVIDER_CATALOG.gemini.defaultModel);
    expect(listProviderModels("gemini")).toContain("gemini-2.5-flash");
    expect(listProviderModels("gemini")).not.toContain("gemini-1.0-pro");
    expect(listProviderModels("claude")).not.toContain("claude-3-5-sonnet-20240620");
    expect(isKnownModel("openai", "gpt-4o-mini")).toBe(true);
    expect(isKnownModel("openai", "gpt-3")).toBe(false);
  });

  it("self-heals a stored provider:model whose model no longer exists", () => {
    expect(normalizeProviderAndModel("claude:claude-3-5-sonnet-20240620")).toEqual({
      provider: "claude",
      model: PROVIDER_CATALOG.anthropic.defaultModel,
    });
    expect(normalizeProviderAndModel("gemini:gemini-2.5-flash")).toEqual({ provider: "gemini", model: "gemini-2.5-flash" });
    expect(normalizeProviderAndModel(undefined)).toEqual({ provider: "openai", model: PROVIDER_CATALOG.openai.defaultModel });
    expect(normalizeProviderAndModel("nope:x")).toEqual({ provider: "openai", model: PROVIDER_CATALOG.openai.defaultModel });
  });

  it("builds the provider select options from the catalog", () => {
    const options = buildProviderModelOptions({ aiChatProviderOpenAI: "OpenAI (GPT-4o-mini)" });
    expect(options[0]).toEqual({
      provider: "openai",
      value: `openai:${PROVIDER_CATALOG.openai.defaultModel}`,
      label: "OpenAI (GPT-4o-mini)",
    });
    for (const option of options) {
      const [provider, model] = option.value.split(":");
      expect(isKnownModel(provider as "openai", model)).toBe(true);
    }
    expect(options.some((o) => o.value === "gemini:gemini-2.5-flash")).toBe(true);
    expect(options.some((o) => o.provider === "ollama")).toBe(true);
  });
});
