/**
 * Thin, cancellation-aware wrappers over @clack/prompts. Centralizes the
 * isCancel handling so prompt modules stay declarative and a Ctrl-C exits
 * cleanly (mirroring the previous inquirer behaviour).
 */
import {
  text,
  password,
  confirm,
  select,
  multiselect,
  isCancel,
  cancel,
} from "@clack/prompts";

function exitIfCancelled<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }
  return value as T;
}

export interface AskTextOptions {
  message: string;
  defaultValue?: string;
  placeholder?: string;
  validate?: (value: string) => string | undefined;
}

export async function askText(options: AskTextOptions): Promise<string> {
  const result = await text({
    message: options.message,
    placeholder: options.placeholder,
    defaultValue: options.defaultValue,
    initialValue: undefined,
    validate: options.validate
      ? (value) => options.validate?.(value ?? "")
      : undefined,
  });
  return exitIfCancelled(result);
}

export interface AskPasswordOptions {
  message: string;
  validate?: (value: string) => string | undefined;
}

/** Masked password prompt (input hidden as the user types). */
export async function askPassword(options: AskPasswordOptions): Promise<string> {
  const result = await password({
    message: options.message,
    validate: options.validate
      ? (value) => options.validate?.(value ?? "")
      : undefined,
  });
  return exitIfCancelled(result);
}

export async function askConfirm(message: string, initialValue = false): Promise<boolean> {
  const result = await confirm({ message, initialValue });
  return exitIfCancelled(result);
}

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export async function askSelect<T extends string>(
  message: string,
  options: Choice<T>[],
  initialValue?: T,
): Promise<T> {
  // clack's Option<Value> is a conditional type TS can't match against a generic
  // Choice<T> (identical shape); cast at the boundary, inference flows from initialValue.
  const result = await select<T>({ message, options: options as never, initialValue });
  return exitIfCancelled(result);
}

export async function askMultiSelect<T extends string>(
  message: string,
  options: Choice<T>[],
  initialValues?: T[],
): Promise<T[]> {
  const result = await multiselect<T>({ message, options: options as never, initialValues, required: true });
  return exitIfCancelled(result);
}

export { intro, outro, note, spinner } from "@clack/prompts";
