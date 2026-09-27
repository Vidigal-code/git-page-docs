import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, ProviderError } from "@gitpagedocs/tools/errors";
import { PROVIDER_CATALOG } from "@gitpagedocs/tools/ai";
import { getLlmService } from "@/features/ask-ai/api/llm-factory";
import { SharedLlmService } from "@/features/ask-ai/api/providers/shared-llm-service";
import { LlmError } from "@/features/ask-ai/api/llm-error";

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

  it("uses the HTTP status carried by shared AppErrors, defaulting to 500", async () => {
    yieldsThenThrows(new ProviderError("rate limited", { details: { status: 429 } }));
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    ).rejects.toMatchObject({ name: "LlmError", statusCode: 429, message: "rate limited" });

    yieldsThenThrows(new AppError("unknown provider failure"));
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    ).rejects.toMatchObject({ name: "LlmError", statusCode: 500, message: "unknown provider failure" });
  });

  it("maps plain errors and non-Error throwables to a 500 LlmError", async () => {
    yieldsThenThrows(new Error("boom"));
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    ).rejects.toMatchObject({ name: "LlmError", statusCode: 500, message: "boom" });

    yieldsThenThrows("bad things");
    await expect(
      new SharedLlmService("openai", { apiKey: "sk" }).streamCompletion({ messages: [], onChunk: vi.fn() }),
    ).rejects.toMatchObject({ name: "LlmError", statusCode: 500, message: "bad things" });
  });
});
