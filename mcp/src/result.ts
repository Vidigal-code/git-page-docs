import { isAppError } from "@gitpagedocs/tools";

export interface TextResult {
  // Index signature matches the MCP SDK CallToolResult shape.
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function text(value: string): TextResult {
  return { content: [{ type: "text", text: value }] };
}

export function json(value: unknown): TextResult {
  return text(JSON.stringify(value, null, 2));
}

export function errorResult(error: unknown): TextResult {
  const message = isAppError(error) ? `${error.code}: ${error.message}` : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

/** Wrap a tool handler so thrown errors become structured isError results. */
export function safe<TArgs>(
  handler: (args: TArgs) => Promise<TextResult>,
): (args: TArgs) => Promise<TextResult> {
  return async (args: TArgs) => {
    try {
      return await handler(args);
    } catch (error) {
      return errorResult(error);
    }
  };
}
