import readline from "node:readline";
import { createDefaultFactory } from "@gitpagedocs/tools/ai";
import { PROVIDER_CATALOG } from "@gitpagedocs/tools";
import type { AIProvider, ProviderConfig } from "@gitpagedocs/tools/ports";
import { ChatSession } from "../../ai/core/chat-session";
import { resolveChatCredentials, type ResolvedChatCredentials } from "../../ai/application/resolve-chat-credentials";
import {
  ElapsedSpinner,
  accent,
  danger,
  writeChrome,
  writeContent,
} from "../ui/terminal-stream";
import type { CommandContext } from "./run-command";

/** Positions the model as a documentation assistant for the current project. */
const DEFAULT_CHAT_SYSTEM_PROMPT = [
  "You are a concise documentation and coding assistant embedded in the gitpagedocs CLI.",
  "Answer questions about the user's project, source code and documentation.",
  "Prefer short, correct, actionable answers; use GitHub-flavored markdown for code.",
].join(" ");

const EXIT_REARM_MS = 3000;

interface ChatFlags {
  provider?: string;
  model?: string;
  system?: string;
  question?: string;
}

function parseChatArgs(args: readonly string[]): ChatFlags {
  // args[0] is the verb ("chat"); parse flags and collect the free-text question.
  const flags: ChatFlags = {};
  const positional: string[] = [];
  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--provider" || arg === "--model" || arg === "--system") {
      const value = args[i + 1];
      if (value !== undefined) {
        if (arg === "--provider") flags.provider = value;
        else if (arg === "--model") flags.model = value;
        else flags.system = value;
        i += 1;
      }
      continue;
    }
    if (arg.startsWith("--")) continue;
    positional.push(arg);
  }
  const question = positional.join(" ").trim();
  if (question) flags.question = question;
  return flags;
}

async function readPipedStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8").trim();
}

/**
 * Streams one assistant turn to stdout. Cancellation is a scoped concern: the
 * caller owns the AbortController and the stream stops the moment it aborts
 * (the async generator's cleanup tears down the HTTP request). Returns whether
 * the turn completed (false = aborted or errored).
 */
async function streamTurn(
  provider: AIProvider,
  config: ProviderConfig,
  session: ChatSession,
  userText: string,
  signal: AbortSignal,
): Promise<boolean> {
  session.addUser(userText);
  const spinner = new ElapsedSpinner("Thinking");
  spinner.start();
  let full = "";
  let started = false;
  try {
    for await (const delta of provider.stream(
      { messages: session.buildRequestMessages(), system: session.system, signal },
      config,
    )) {
      if (!started) {
        spinner.stop();
        started = true;
      }
      full += delta;
      writeContent(delta);
    }
    if (started) writeContent("\n");
    session.addAssistant(full);
    writeChrome(
      `${PROVIDER_CATALOG[config.providerId].label} · ${config.model} · ${spinner.elapsedSeconds().toFixed(1)}s`,
    );
    return true;
  } catch (error) {
    spinner.stop();
    if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      if (started) writeContent("\n");
      writeChrome(danger("Interrupted."));
      // Keep the partial reply in history so follow-ups have context.
      session.addAssistant(full);
      return false;
    }
    writeChrome(danger(`Error: ${error instanceof Error ? error.message : String(error)}`));
    return false;
  } finally {
    spinner.stop();
  }
}

/** One-shot mode: a single question in, the answer out, then exit. */
async function runOneShot(
  provider: AIProvider,
  config: ProviderConfig,
  session: ChatSession,
  question: string,
): Promise<void> {
  const controller = new AbortController();
  const onSigint = () => controller.abort();
  process.on("SIGINT", onSigint);
  try {
    const ok = await streamTurn(provider, config, session, question, controller.signal);
    if (!ok) process.exitCode = 1;
  } finally {
    process.off("SIGINT", onSigint);
  }
}

/** Interactive REPL: requires a TTY on both ends. */
async function runRepl(
  provider: AIProvider,
  config: ProviderConfig,
  session: ChatSession,
): Promise<void> {
  const spec = PROVIDER_CATALOG[config.providerId];
  writeChrome(`Chat — ${spec.label} · ${config.model}`);
  writeChrome("Commands: /clear reset · /help · /exit (or Ctrl+C twice)");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
    prompt: accent("› "),
  });

  let generating: AbortController | null = null;
  let exitArmed = false;
  let exitTimer: ReturnType<typeof setTimeout> | null = null;

  rl.on("SIGINT", () => {
    if (generating) {
      generating.abort();
      return;
    }
    if (exitArmed) {
      rl.close();
      return;
    }
    exitArmed = true;
    writeChrome("Press Ctrl+C again to exit.");
    exitTimer = setTimeout(() => {
      exitArmed = false;
    }, EXIT_REARM_MS);
    rl.prompt();
  });

  rl.prompt();
  for await (const line of rl) {
    if (exitTimer) {
      clearTimeout(exitTimer);
      exitTimer = null;
    }
    exitArmed = false;
    const input = line.trim();
    if (!input) {
      rl.prompt();
      continue;
    }
    if (input === "/exit" || input === "/quit") break;
    if (input === "/clear") {
      session.clear();
      writeChrome("Conversation cleared.");
      rl.prompt();
      continue;
    }
    if (input === "/help") {
      writeChrome("Type a message to chat. /clear resets history, /exit quits, Ctrl+C interrupts a reply.");
      rl.prompt();
      continue;
    }
    generating = new AbortController();
    await streamTurn(provider, config, session, input, generating.signal);
    generating = null;
    rl.prompt();
  }
  rl.close();
  writeChrome("Bye.");
}

function printSetupHelp(providerHint: string): void {
  writeChrome(danger("No AI credentials found."));
  writeChrome(`Set an API key via environment variable (e.g. ${providerHint}) or run: gitpagedocs ai`);
  writeChrome("Then: gitpagedocs chat \"your question\"  ·  or just: gitpagedocs chat");
}

/**
 * `gitpagedocs chat [question]` — interactive AI chat in the terminal.
 * Flags: --provider <id>, --model <id>, --system <prompt>.
 * One-shot when a question is given or stdin is piped; a REPL on a TTY.
 */
export async function runChat(ctx: CommandContext): Promise<void> {
  const flags = parseChatArgs(ctx.args);
  const creds: ResolvedChatCredentials | null = await resolveChatCredentials({
    cwd: ctx.cwd,
    providerOverride: flags.provider,
    modelOverride: flags.model,
  });

  if (!creds) {
    const hintProvider = flags.provider ?? "openai";
    const hint = PROVIDER_CATALOG[
      (hintProvider in PROVIDER_CATALOG ? hintProvider : "openai") as keyof typeof PROVIDER_CATALOG
    ].envVars[0] ?? "OPENAI_API_KEY";
    printSetupHelp(hint);
    process.exitCode = 1;
    return;
  }

  const provider = createDefaultFactory().create(creds.providerId);
  const config: ProviderConfig = {
    providerId: creds.providerId,
    model: creds.model,
    apiKey: creds.apiKey,
    baseUrl: creds.baseUrl,
  };
  const session = new ChatSession(flags.system ?? DEFAULT_CHAT_SYSTEM_PROMPT);

  const piped = await readPipedStdin();
  const oneShot = [flags.question, piped].filter(Boolean).join("\n\n").trim();

  if (oneShot) {
    await runOneShot(provider, config, session, oneShot);
    return;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    writeChrome(danger("No question given and no interactive terminal available."));
    writeChrome('Usage: gitpagedocs chat "your question"');
    process.exitCode = 1;
    return;
  }

  await runRepl(provider, config, session);
}
