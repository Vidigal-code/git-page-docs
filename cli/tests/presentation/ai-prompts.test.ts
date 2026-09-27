import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AiCliConfig } from "../../ai/core/models/ai-cli-config";
import { AI_MODEL_DEFAULTS, OLLAMA_DEFAULT_BASE_URL } from "../../ai/config";

interface TextOptions {
  message: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}

interface Choice {
  value: string;
  label: string;
}

const clack = vi.hoisted(() => ({
  askText: vi.fn<(options: { message: string; defaultValue?: string; validate?: (v: string) => string | undefined }) => Promise<string>>(),
  askConfirm: vi.fn<(message: string, initial?: boolean) => Promise<boolean>>(),
  askSelect: vi.fn<(message: string, options: unknown[], initial?: string) => Promise<string>>(),
  askMultiSelect: vi.fn<(message: string, options: unknown[], initial?: string[]) => Promise<string[]>>(),
  intro: vi.fn<(message: string) => void>(),
}));
vi.mock("../../presentation/ui/clack", () => clack);

// Ollama is given an empty model list so the free-text model fallback is reachable.
vi.mock("@gitpagedocs/tools/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gitpagedocs/tools/ai")>();
  return {
    ...actual,
    PROVIDER_CATALOG: { ...actual.PROVIDER_CATALOG, ollama: { ...actual.PROVIDER_CATALOG.ollama, models: [] } },
  };
});

import { PROVIDER_CATALOG } from "@gitpagedocs/tools/ai";
import {
  promptMissingDirectories,
  promptUseExistingConfig,
  runAiInteractivePrompt,
} from "../../ai/presentation/ai-prompts";

const EXISTING: AiCliConfig = {
  version: 1,
  ai: {
    provider: "claude",
    model: "claude-3-5-sonnet-20240620",
    apiKey: "stored",
    paths: ["src"],
    languages: ["en"],
    outputDir: "gitpagedocs/docs",
    filePrefix: "ai",
    contextPrompt: "ctx",
  },
};

function textCall(index: number): TextOptions {
  return clack.askText.mock.calls[index][0];
}

function selectCall(index: number): { message: string; options: Choice[]; initial?: string } {
  const [message, options, initial] = clack.askSelect.mock.calls[index];
  return { message, options: options as Choice[], initial };
}

beforeEach(() => {
  for (const mock of Object.values(clack)) mock.mockReset();
});

describe("promptMissingDirectories", () => {
  it("aborts when asked to", async () => {
    clack.askSelect.mockResolvedValue("abort");
    await expect(promptMissingDirectories(["a", "b"])).resolves.toEqual({ replacementPaths: [], abort: true });
    expect(selectCall(0).message).toBe("I couldn't find 2 directory(ies): a, b");
    expect(selectCall(0).initial).toBe("fix");
    expect(clack.askText).not.toHaveBeenCalled();
  });

  it("skips the missing paths without aborting", async () => {
    clack.askSelect.mockResolvedValue("skip");
    await expect(promptMissingDirectories(["a"])).resolves.toEqual({ replacementPaths: [], abort: false });
  });

  it("collects replacement paths from a comma-separated answer", async () => {
    clack.askSelect.mockResolvedValue("fix");
    clack.askText.mockResolvedValue(" src , cli ,, ../other/src ");

    await expect(promptMissingDirectories(["a"])).resolves.toEqual({
      replacementPaths: ["src", "cli", "../other/src"],
      abort: false,
    });
    expect(textCall(0).message).toBe("Enter new paths (comma-separated):");
    expect(textCall(0).validate?.(" , ")).toBe("Provide at least one path.");
    expect(textCall(0).validate?.("src")).toBeUndefined();
  });

  it("treats an empty fix answer as no replacements", async () => {
    clack.askSelect.mockResolvedValue("fix");
    clack.askText.mockResolvedValue(undefined as unknown as string);
    await expect(promptMissingDirectories(["a"])).resolves.toEqual({ replacementPaths: [], abort: false });
  });
});

describe("promptUseExistingConfig", () => {
  it("returns null when the stored config is declined", async () => {
    clack.askConfirm.mockResolvedValue(false);
    await expect(promptUseExistingConfig(EXISTING)).resolves.toBeNull();
    expect(clack.askConfirm).toHaveBeenCalledTimes(1);
  });

  it("reuses the stored config and asks about the scaffold", async () => {
    clack.askConfirm.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(promptUseExistingConfig(EXISTING)).resolves.toEqual({
      config: EXISTING,
      saveConfig: false,
      runConfigScaffold: false,
    });
  });
});

describe("runAiInteractivePrompt", () => {
  it("short-circuits to the stored config when accepted", async () => {
    clack.askConfirm.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    const plan = await runAiInteractivePrompt(EXISTING);

    expect(clack.intro).toHaveBeenCalledWith("GitPageDocs AI CLI - interactive mode");
    expect(plan).toEqual({ config: EXISTING, saveConfig: false, runConfigScaffold: true });
    expect(clack.askSelect).not.toHaveBeenCalled();
  });

  it("walks the full questionnaire for a keyed provider with a catalog model", async () => {
    clack.askConfirm
      .mockResolvedValueOnce(false) // decline stored config
      .mockResolvedValueOnce(true) // save
      .mockResolvedValueOnce(false); // scaffold
    clack.askSelect.mockResolvedValueOnce("openai").mockResolvedValueOnce("gpt-4o");
    clack.askText
      .mockResolvedValueOnce("sk-key")
      .mockResolvedValueOnce("src, cli")
      .mockResolvedValueOnce("out/docs")
      .mockResolvedValueOnce("prefix")
      .mockResolvedValueOnce("Be brief.");
    clack.askMultiSelect.mockResolvedValue(["en", "es"]);

    const plan = await runAiInteractivePrompt(EXISTING);

    expect(plan).toEqual({
      config: {
        version: 1,
        ai: {
          provider: "openai",
          model: "gpt-4o",
          apiKey: "sk-key",
          baseUrl: undefined,
          paths: ["src", "cli"],
          languages: ["en", "es"],
          outputDir: "out/docs",
          filePrefix: "prefix",
          contextPrompt: "Be brief.",
        },
      },
      saveConfig: true,
      runConfigScaffold: false,
    });

    expect(selectCall(0).initial).toBe("openai");
    const modelSelect = selectCall(1);
    expect(modelSelect.message).toBe("Which model do you want to use?");
    expect(modelSelect.initial).toBe(PROVIDER_CATALOG.openai.defaultModel);
    expect(modelSelect.options.find((o) => o.value === PROVIDER_CATALOG.openai.defaultModel)?.label).toBe(
      `${PROVIDER_CATALOG.openai.defaultModel} (default)`,
    );
    expect(modelSelect.options.at(-1)).toEqual({ value: "__custom_model__", label: "Custom — enter a model id manually" });

    expect(textCall(0)).toMatchObject({ message: "Provider API key:", defaultValue: undefined });
    expect(textCall(0).validate?.("")).toBe("Required field");
    expect(textCall(0).validate?.("k")).toBeUndefined();
    expect(textCall(1).validate?.("")).toBe("Provide at least one path.");
    expect(textCall(2).validate?.(" ")).toBe("Provide an output directory");
    expect(textCall(2).validate?.("d")).toBeUndefined();
    expect(textCall(3).validate?.(" ")).toBe("Provide a prefix");
    expect(textCall(3).validate?.("p")).toBeUndefined();
    expect(clack.askMultiSelect).toHaveBeenCalledWith(
      "Documentation languages to generate:",
      expect.any(Array),
      ["en", "pt", "es"],
    );
  });

  it("lets the user type a custom model id", async () => {
    clack.askConfirm.mockResolvedValue(true);
    clack.askSelect.mockResolvedValueOnce("claude").mockResolvedValueOnce("__custom_model__");
    clack.askText
      .mockResolvedValueOnce("key")
      .mockResolvedValueOnce("my-model")
      .mockResolvedValueOnce("src")
      .mockResolvedValueOnce("out")
      .mockResolvedValueOnce("p")
      .mockResolvedValueOnce("");
    clack.askMultiSelect.mockResolvedValue(["pt"]);

    const plan = await runAiInteractivePrompt(null);

    expect(plan.config.ai).toMatchObject({ provider: "claude", model: "my-model", apiKey: "key" });
    expect(textCall(1)).toMatchObject({ message: "Enter the model id:", defaultValue: PROVIDER_CATALOG.anthropic.defaultModel });
    expect(textCall(1).validate?.(" ")).toBe("Provide a model id");
    expect(textCall(1).validate?.("m")).toBeUndefined();
  });

  it("asks for a host instead of a key for Ollama and falls back to a free-text model", async () => {
    clack.askConfirm.mockResolvedValue(false);
    clack.askSelect.mockResolvedValueOnce("ollama");
    clack.askText
      .mockResolvedValueOnce("http://ollama.local:11434")
      .mockResolvedValueOnce("llama3.1")
      .mockResolvedValueOnce("src")
      .mockResolvedValueOnce("out")
      .mockResolvedValueOnce("p")
      .mockResolvedValueOnce("");
    clack.askMultiSelect.mockResolvedValue(["en"]);

    const plan = await runAiInteractivePrompt(undefined);

    expect(clack.askSelect).toHaveBeenCalledTimes(1);
    expect(textCall(0)).toMatchObject({ message: "Ollama host URL:", defaultValue: OLLAMA_DEFAULT_BASE_URL });
    expect(textCall(1)).toMatchObject({ message: "Which model do you want to use?", defaultValue: AI_MODEL_DEFAULTS.ollama });
    expect(plan.config.ai).toMatchObject({
      provider: "ollama",
      model: "llama3.1",
      apiKey: undefined,
      baseUrl: "http://ollama.local:11434",
    });
    expect(plan.saveConfig).toBe(false);
    expect(plan.runConfigScaffold).toBe(false);
  });
});
