import type { AiMessage } from "@gitpagedocs/tools/ports";

/**
 * @file chat-session.ts
 * @description Pure conversation state for the interactive terminal chat. Holds
 * the running message history and an optional system prompt, and builds the
 * message array sent to a provider. No IO, no streaming, no terminal concerns —
 * so the conversation logic is unit-testable without a provider or a TTY.
 */
export class ChatSession {
  private readonly history: AiMessage[] = [];

  constructor(private readonly systemPrompt?: string) {}

  /** Records a user turn. */
  addUser(content: string): void {
    this.history.push({ role: "user", content });
  }

  /** Records an assistant turn (the fully streamed reply). */
  addAssistant(content: string): void {
    this.history.push({ role: "assistant", content });
  }

  /** The user/assistant messages to send for the next completion. */
  buildRequestMessages(): AiMessage[] {
    return [...this.history];
  }

  /** The system prompt for the request's dedicated `system` field, if any. */
  get system(): string | undefined {
    return this.systemPrompt?.trim() || undefined;
  }

  /** Number of recorded turns (excluding the system prompt). */
  get turnCount(): number {
    return this.history.length;
  }

  /** Drops the conversation history, keeping the system prompt. */
  clear(): void {
    this.history.length = 0;
  }
}
