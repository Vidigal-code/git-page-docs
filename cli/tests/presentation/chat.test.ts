import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Readable } from "node:stream";
import type { GenerateRequest, ProviderConfig } from "@gitpagedocs/tools/ports";
import type { ResolvedChatCredentials } from "../../ai/application/resolve-chat-credentials";

const credentials = vi.hoisted(() => ({
  resolveChatCredentials: vi.fn<(input: unknown) => Promise<ResolvedChatCredentials | null>>(),
}));
vi.mock("../../ai/application/resolve-chat-credentials", () => credentials);

const llm = vi.hoisted(() => ({
  stream: vi.fn<(request: GenerateRequest, config: ProviderConfig) => AsyncIterable<string>>(),
}));
vi.mock("@gitpagedocs/tools/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gitpagedocs/tools/ai")>();
  return {
    ...actual,
    createDefaultFactory: () => ({ create: () => ({ stream: llm.stream }) }),
  };
});

const readline = vi.hoisted(() => ({ createInterface: vi.fn() }));
vi.mock("node:readline", () => ({ default: readline }));

import { runChat } from "../../presentation/commands/chat";
import type { CommandContext } from "../../presentation/commands/run-command";

const OPENAI: ResolvedChatCredentials = { providerId: "openai", model: "gpt-4o-mini", apiKey: "sk", baseUrl: undefined };

const stdinDescriptor = Object.getOwnPropertyDescriptor(process, "stdin") as PropertyDescriptor;
const originalStdoutTty = process.stdout.isTTY;
const originalStderrTty = process.stderr.isTTY;

let stdoutWrites: string[];
let stderrWrites: string[];

function context(...args: string[]): CommandContext {
  return { argv: ["node", "gitpagedocs", "chat", ...args], args: ["chat", ...args], pkgRoot: "/pkg", cwd: "/work" };
}

function setStdin(stream: Readable, isTTY: boolean): void {
  Object.defineProperty(stream, "isTTY", { value: isTTY, configurable: true, writable: true });
  Object.defineProperty(process, "stdin", { value: stream, configurable: true, enumerable: true });
}

function setTty(stream: NodeJS.WriteStream, isTTY: boolean): void {
  Object.defineProperty(stream, "isTTY", { value: isTTY, configurable: true, writable: true });
}

function stdout(): string {
  return stdoutWrites.join("");
}

function stderr(): string {
  return stderrWrites.join("");
}

function abortError(): Error {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

/** Streams `deltas`, running `between` after the first one, and stops if the request is aborted. */
function streamDeltas(deltas: string[], between?: () => void): void {
  llm.stream.mockImplementation((request) => {
    async function* generate(): AsyncGenerator<string> {
      for (const [index, delta] of deltas.entries()) {
        if (request.signal?.aborted) throw abortError();
        yield delta;
        if (index === 0) between?.();
      }
    }
    return generate();
  });
}

interface FakeReadline {
  on: ReturnType<typeof vi.fn>;
  prompt: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  sigint: () => void;
  [Symbol.asyncIterator]: () => AsyncGenerator<string>;
}

/** A readline stand-in fed from a script of lines; `beforeLine` can inject Ctrl+C between them. */
function fakeReadline(lines: string[], beforeLine?: (index: number, rl: FakeReadline) => void): FakeReadline {
  const handlers = new Map<string, () => void>();
  let closed = false;
  const rl: FakeReadline = {
    on: vi.fn((event: string, handler: () => void) => {
      handlers.set(event, handler);
      return rl;
    }),
    prompt: vi.fn(),
    close: vi.fn(() => {
      closed = true;
    }),
    sigint: () => handlers.get("SIGINT")?.(),
    async *[Symbol.asyncIterator]() {
      for (const [index, line] of lines.entries()) {
        beforeLine?.(index, rl);
        if (closed) return;
        yield line;
      }
    },
  };
  readline.createInterface.mockReturnValue(rl);
  return rl;
}

beforeEach(() => {
  stdoutWrites = [];
  stderrWrites = [];
  vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
    stdoutWrites.push(String(chunk));
    return true;
  }) as typeof process.stdout.write);
  vi.spyOn(process.stderr, "write").mockImplementation(((chunk: unknown) => {
    stderrWrites.push(String(chunk));
    return true;
  }) as typeof process.stderr.write);
  credentials.resolveChatCredentials.mockReset();
  credentials.resolveChatCredentials.mockResolvedValue(OPENAI);
  llm.stream.mockReset();
  readline.createInterface.mockReset();
  setTty(process.stderr, false);
  setTty(process.stdout, false);
  setStdin(Readable.from([]), true);
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Object.defineProperty(process, "stdin", stdinDescriptor);
  setTty(process.stdout, originalStdoutTty);
  setTty(process.stderr, originalStderrTty);
  process.exitCode = undefined;
});

describe("runChat setup guidance", () => {
  it("prints the env var hint for the requested provider when no credentials resolve", async () => {
    credentials.resolveChatCredentials.mockResolvedValue(null);

    await runChat(context("--provider", "anthropic", "hello"));

    expect(credentials.resolveChatCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        cwd: "/work",
        providerOverride: "anthropic",
        modelOverride: undefined,
        unlockStoredKey: expect.any(Function),
      }),
    );
    expect(stderr()).toContain("No AI credentials found.");
    expect(stderr()).toContain("ANTHROPIC_API_KEY");
    expect(process.exitCode).toBe(1);
    expect(llm.stream).not.toHaveBeenCalled();
  });

  it("falls back to the OpenAI hint for an unknown or absent provider", async () => {
    credentials.resolveChatCredentials.mockResolvedValue(null);
    await runChat(context("--provider", "nope"));
    expect(stderr()).toContain("OPENAI_API_KEY");
    stderrWrites = [];
    await runChat(context());
    expect(stderr()).toContain("OPENAI_API_KEY");
  });

  it("refuses to start a REPL without an interactive terminal", async () => {
    setStdin(Readable.from([]), false);

    await runChat(context());

    expect(stderr()).toContain("No question given and no interactive terminal available.");
    expect(stderr()).toContain('Usage: gitpagedocs chat "your question"');
    expect(process.exitCode).toBe(1);
  });
});

describe("runChat one-shot", () => {
  it("streams the answer to stdout and the chrome to stderr", async () => {
    streamDeltas(["Hello", " world"]);

    await runChat(context("--model", "gpt-4o", "--system", "be terse", "What", "is", "up?"));

    expect(credentials.resolveChatCredentials).toHaveBeenCalledWith(
      expect.objectContaining({ providerOverride: undefined, modelOverride: "gpt-4o" }),
    );
    expect(stdout()).toBe("Hello world\n");
    expect(stderr()).toContain("Thinking...\n");
    expect(stderr()).toMatch(/OpenAI · gpt-4o-mini · \d+\.\ds\n/);
    const [request, config] = llm.stream.mock.calls[0];
    expect(request.system).toBe("be terse");
    expect(request.messages).toEqual([{ role: "user", content: "What is up?" }]);
    expect(config).toEqual({ providerId: "openai", model: "gpt-4o-mini", apiKey: "sk", baseUrl: undefined });
    expect(process.exitCode).toBeUndefined();
  });

  it("uses the built-in system prompt, ignores unknown flags and a dangling value flag", async () => {
    streamDeltas(["ok"]);

    await runChat(context("--verbose", "question", "--model"));

    const [request] = llm.stream.mock.calls[0];
    expect(request.system).toContain("documentation and coding assistant");
    expect(request.messages).toEqual([{ role: "user", content: "question" }]);
  });

  it("appends piped stdin to the question", async () => {
    streamDeltas(["ok"]);
    setStdin(Readable.from([Buffer.from("piped "), "text\n"]), false);

    await runChat(context("Explain:"));

    expect(llm.stream.mock.calls[0][0].messages).toEqual([{ role: "user", content: "Explain:\n\npiped text" }]);
  });

  it("reports a provider failure and exits non-zero", async () => {
    llm.stream.mockImplementation(() => {
      async function* failing(): AsyncGenerator<string> {
        yield "partial";
        throw new Error("boom");
      }
      return failing();
    });

    await runChat(context("q"));

    expect(stdout()).toBe("partial");
    expect(stderr()).toContain("Error: boom");
    expect(process.exitCode).toBe(1);
  });

  it("treats a provider abort as an interruption", async () => {
    llm.stream.mockImplementation(() => {
      async function* aborted(): AsyncGenerator<string> {
        throw abortError();
      }
      return aborted();
    });

    await runChat(context("q"));

    expect(stdout()).toBe("");
    expect(stderr()).toContain("Interrupted.");
    expect(process.exitCode).toBe(1);
  });

  it("stops streaming when Ctrl+C is received", async () => {
    const before = new Set(process.listeners("SIGINT"));
    streamDeltas(["first", "second"], () => {
      const added = process.listeners("SIGINT").find((listener) => !before.has(listener));
      expect(added).toBeTypeOf("function");
      (added as () => void)();
    });

    await runChat(context("q"));

    expect(stdout()).toBe("first\n");
    expect(stderr()).toContain("Interrupted.");
    expect(process.exitCode).toBe(1);
    expect(process.listeners("SIGINT").filter((listener) => !before.has(listener))).toEqual([]);
  });
});

describe("runChat REPL", () => {
  beforeEach(() => {
    setStdin(Readable.from([]), true);
    setTty(process.stdout, true);
  });

  it("handles the slash commands and chats on plain input", async () => {
    streamDeltas(["reply"]);
    const rl = fakeReadline(["", "/help", "hello", "/clear", "/exit", "never sent"]);

    await runChat(context());

    expect(readline.createInterface).toHaveBeenCalledWith(
      expect.objectContaining({ input: process.stdin, output: process.stderr }),
    );
    expect(stderr()).toContain("Chat — OpenAI · gpt-4o-mini");
    expect(stderr()).toContain("Commands: /clear reset · /help · /exit (or Ctrl+C twice)");
    expect(stderr()).toContain("Type a message to chat.");
    expect(stderr()).toContain("Conversation cleared.");
    expect(stderr()).toContain("Bye.");
    expect(stdout()).toBe("reply\n");
    expect(llm.stream).toHaveBeenCalledTimes(1);
    expect(llm.stream.mock.calls[0][0].messages).toEqual([{ role: "user", content: "hello" }]);
    expect(rl.close).toHaveBeenCalledTimes(1);
    expect(rl.prompt.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps history across turns and accepts /quit", async () => {
    streamDeltas(["a1"]);
    fakeReadline(["first", "second", "/quit"]);

    await runChat(context());

    expect(llm.stream).toHaveBeenCalledTimes(2);
    expect(llm.stream.mock.calls[1][0].messages).toEqual([
      { role: "user", content: "first" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "second" },
    ]);
  });

  it("interrupts a reply on Ctrl+C and keeps the partial answer", async () => {
    let rl: FakeReadline | undefined;
    let turns = 0;
    streamDeltas(["partial", "rest"], () => {
      turns += 1;
      if (turns === 1) rl?.sigint();
    });
    rl = fakeReadline(["question", "next", "/exit"]);

    await runChat(context());

    expect(stdout()).toBe("partial\npartialrest\n");
    expect(stderr()).toContain("Interrupted.");
    expect(llm.stream.mock.calls[1][0].messages).toEqual([
      { role: "user", content: "question" },
      { role: "assistant", content: "partial" },
      { role: "user", content: "next" },
    ]);
  });

  it("exits on a double Ctrl+C while idle", async () => {
    streamDeltas(["x"]);
    const rl = fakeReadline(["hello", "unreachable"], (index, current) => {
      if (index === 1) {
        current.sigint();
        current.sigint();
      }
    });

    await runChat(context());

    expect(stderr()).toContain("Press Ctrl+C again to exit.");
    expect(rl.close).toHaveBeenCalled();
    expect(llm.stream).toHaveBeenCalledTimes(1);
    expect(stderr()).toContain("Bye.");
  });

  it("re-arms the exit guard after the grace period", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    streamDeltas(["x"]);
    fakeReadline(["hello", "/exit"], (index, current) => {
      if (index === 1) {
        current.sigint();
        vi.advanceTimersByTime(3000);
        current.sigint();
      }
    });

    await runChat(context());

    expect(stderrWrites.filter((line) => line.includes("Press Ctrl+C again to exit."))).toHaveLength(2);
    expect(stderr()).toContain("Bye.");
  });
});
