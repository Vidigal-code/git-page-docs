import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const CANCELLED = Symbol("clack:cancel");

const clackPrompts = vi.hoisted(() => ({
  text: vi.fn(),
  password: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  isCancel: vi.fn((value: unknown) => typeof value === "symbol"),
  cancel: vi.fn(),
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  spinner: vi.fn(),
}));
vi.mock("@clack/prompts", () => clackPrompts);

import {
  askConfirm,
  askMultiSelect,
  askPassword,
  askSelect,
  askText,
  intro,
  note,
  outro,
  spinner,
} from "../../presentation/ui/clack";

type Validator = ((value: string | undefined) => string | undefined) | undefined;

function firstCallOptions<T>(mock: { mock: { calls: unknown[][] } }): T {
  return mock.mock.calls[0][0] as T;
}

beforeEach(() => {
  for (const mock of Object.values(clackPrompts)) mock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("askText", () => {
  it("forwards message, placeholder and default, wrapping the validator", async () => {
    clackPrompts.text.mockResolvedValue("typed");
    const validate = vi.fn((value: string) => (value ? undefined : "Required"));

    await expect(askText({ message: "Name:", defaultValue: "d", placeholder: "p", validate })).resolves.toBe("typed");

    const options = firstCallOptions<{ message: string; placeholder: string; defaultValue: string; validate: Validator }>(
      clackPrompts.text,
    );
    expect(options).toMatchObject({ message: "Name:", placeholder: "p", defaultValue: "d" });
    expect(options.validate?.(undefined)).toBe("Required");
    expect(validate).toHaveBeenCalledWith("");
    expect(options.validate?.("x")).toBeUndefined();
  });

  it("passes no validator when none is given", async () => {
    clackPrompts.text.mockResolvedValue("v");
    await askText({ message: "Name:" });
    expect(firstCallOptions<{ validate: Validator }>(clackPrompts.text).validate).toBeUndefined();
  });
});

describe("askPassword", () => {
  it("wraps the validator like askText", async () => {
    clackPrompts.password.mockResolvedValue("secret");
    await expect(askPassword({ message: "Pw:", validate: (v) => (v.length > 2 ? undefined : "short") })).resolves.toBe(
      "secret",
    );
    const options = firstCallOptions<{ message: string; validate: Validator }>(clackPrompts.password);
    expect(options.message).toBe("Pw:");
    expect(options.validate?.(undefined)).toBe("short");
    expect(options.validate?.("long")).toBeUndefined();
  });

  it("passes no validator when none is given", async () => {
    clackPrompts.password.mockResolvedValue("secret");
    await askPassword({ message: "Pw:" });
    expect(firstCallOptions<{ validate: Validator }>(clackPrompts.password).validate).toBeUndefined();
  });
});

describe("askConfirm / askSelect / askMultiSelect", () => {
  it("forwards confirm with its initial value (false by default)", async () => {
    clackPrompts.confirm.mockResolvedValue(true);
    await expect(askConfirm("Sure?")).resolves.toBe(true);
    expect(clackPrompts.confirm).toHaveBeenCalledWith({ message: "Sure?", initialValue: false });
    await askConfirm("Sure?", true);
    expect(clackPrompts.confirm).toHaveBeenLastCalledWith({ message: "Sure?", initialValue: true });
  });

  it("forwards select choices and the initial value", async () => {
    clackPrompts.select.mockResolvedValue("b");
    const options = [
      { value: "a", label: "A" },
      { value: "b", label: "B", hint: "h" },
    ];
    await expect(askSelect("Pick", options, "a")).resolves.toBe("b");
    expect(clackPrompts.select).toHaveBeenCalledWith({ message: "Pick", options, initialValue: "a" });
  });

  it("forwards multiselect as required with initial values", async () => {
    clackPrompts.multiselect.mockResolvedValue(["a"]);
    const options = [{ value: "a", label: "A" }];
    await expect(askMultiSelect("Pick", options, ["a"])).resolves.toEqual(["a"]);
    expect(clackPrompts.multiselect).toHaveBeenCalledWith({
      message: "Pick",
      options,
      initialValues: ["a"],
      required: true,
    });
  });
});

describe("cancellation", () => {
  it("exits cleanly when a prompt is cancelled", async () => {
    clackPrompts.text.mockResolvedValue(CANCELLED);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit called");
    }) as never);

    await expect(askText({ message: "Name:" })).rejects.toThrow("exit called");

    expect(clackPrompts.cancel).toHaveBeenCalledWith("Operation cancelled.");
    expect(exit).toHaveBeenCalledWith(0);
  });
});

describe("re-exports", () => {
  it("exposes the clack helpers untouched", () => {
    expect(intro).toBe(clackPrompts.intro);
    expect(outro).toBe(clackPrompts.outro);
    expect(note).toBe(clackPrompts.note);
    expect(spinner).toBe(clackPrompts.spinner);
  });
});
