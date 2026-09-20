/**
 * @file terminal-stream.ts
 * @description Terminal rendering for streamed AI output, non-TTY-first:
 *   - model text goes to STDOUT (so `chat "q" > out.txt` captures clean content)
 *   - all chrome (spinner, headers, hints) goes to STDERR
 *   - colours/spinner are emitted only on a TTY; a pipe gets plain text
 * Keeps the streaming/rendering side effects in one place, apart from the pure
 * ChatSession state.
 */
const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
} as const;

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const SPINNER_INTERVAL_MS = 80;

function stdoutIsTty(): boolean {
  return Boolean(process.stdout.isTTY);
}

function stderrIsTty(): boolean {
  return Boolean(process.stderr.isTTY);
}

/** Writes model content to stdout (verbatim; the actual deliverable). */
export function writeContent(text: string): void {
  process.stdout.write(text);
}

/** Writes one chrome line to stderr, dimmed on a TTY. */
export function writeChrome(line: string): void {
  if (stderrIsTty()) {
    process.stderr.write(`${ANSI.dim}${line}${ANSI.reset}\n`);
  } else {
    process.stderr.write(`${line}\n`);
  }
}

/** Colour helpers that no-op when stderr is not a TTY. */
export function accent(text: string): string {
  return stderrIsTty() ? `${ANSI.cyan}${text}${ANSI.reset}` : text;
}

export function danger(text: string): string {
  return stderrIsTty() ? `${ANSI.red}${text}${ANSI.reset}` : text;
}

/**
 * A spinner with elapsed-time readout on stderr. On a non-TTY it prints a
 * single static line instead of animating, so logs stay clean. `stop()` clears
 * the line and is idempotent.
 */
export class ElapsedSpinner {
  private timer: ReturnType<typeof setInterval> | null = null;
  private frame = 0;
  private readonly startedAt = Date.now();

  constructor(private readonly label: string) {}

  start(): void {
    if (!stderrIsTty()) {
      process.stderr.write(`${this.label}...\n`);
      return;
    }
    this.render();
    this.timer = setInterval(() => this.render(), SPINNER_INTERVAL_MS);
  }

  private render(): void {
    const seconds = ((Date.now() - this.startedAt) / 1000).toFixed(1);
    const glyph = SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length];
    this.frame += 1;
    process.stderr.write(`\r${ANSI.cyan}${glyph}${ANSI.reset} ${ANSI.dim}${this.label} ${seconds}s${ANSI.reset}\x1b[K`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (stderrIsTty()) {
      process.stderr.write("\r\x1b[K");
    }
  }

  /** Elapsed seconds since construction. */
  elapsedSeconds(): number {
    return (Date.now() - this.startedAt) / 1000;
  }
}

export const supportsColor = stderrIsTty;
export const isInteractiveOutput = stdoutIsTty;
