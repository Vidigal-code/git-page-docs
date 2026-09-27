import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ALL_PROVIDER_IDS, PROVIDER_CATALOG } from "@gitpagedocs/tools";
import { runProvider, runModels } from "../../presentation/commands/ai-info";
import type { CommandContext } from "../../presentation/commands/run-command";

let logged: string[];

function context(args: string[]): CommandContext {
  return { argv: ["node", "gitpagedocs", ...args], args, pkgRoot: "/pkg", cwd: "/work" };
}

function output(): string {
  return logged.join("\n");
}

beforeEach(() => {
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runProvider", () => {
  it("lists every catalog provider with its default model", async () => {
    await runProvider(context(["provider"]));

    const text = output();
    expect(text).toContain(`AI providers (${ALL_PROVIDER_IDS.length}):`);
    for (const id of ALL_PROVIDER_IDS) {
      const spec = PROVIDER_CATALOG[id];
      expect(text).toContain(`  ${id.padEnd(14)} ${spec.label.padEnd(18)} ${spec.defaultModel}`);
    }
    expect(text).toContain("Detail: gitpagedocs provider <id>");
  });

  it("shows one provider's details, including capabilities and models", async () => {
    await runProvider(context(["provider", "anthropic"]));

    const spec = PROVIDER_CATALOG.anthropic;
    const text = output();
    expect(text).toContain(`${spec.label} (anthropic)`);
    expect(text).toContain(`default model : ${spec.defaultModel}`);
    expect(text).toContain("capabilities  : stream, vision");
    expect(text).toContain(`base url      : ${spec.baseUrl}`);
    expect(text).toContain(`models        : ${spec.models.map((m) => m.id).join(", ")}`);
    expect(text).not.toContain("AI providers (");
  });

  it("marks a provider without a fixed base URL as user-provided and text-only capabilities", async () => {
    const keyless = ALL_PROVIDER_IDS.find((id) => !PROVIDER_CATALOG[id].baseUrl);
    const textOnly = ALL_PROVIDER_IDS.find((id) => {
      const caps = PROVIDER_CATALOG[id].capabilities;
      return !caps.streaming && !caps.vision && !caps.audio;
    });

    if (keyless) {
      await runProvider(context(["provider", keyless]));
      expect(output()).toContain("base url      : (user-provided)");
    }
    if (textOnly) {
      logged = [];
      await runProvider(context(["provider", textOnly]));
      expect(output()).toContain("capabilities  : text");
    }
    expect(keyless ?? textOnly ?? "none").toBeTypeOf("string");
  });

  it("falls back to the full list for an unknown provider id", async () => {
    await runProvider(context(["provider", "not-a-provider"]));
    expect(output()).toContain(`AI providers (${ALL_PROVIDER_IDS.length}):`);
  });
});

describe("runModels", () => {
  it("lists the models of one provider, flagging the default", async () => {
    await runModels(context(["models", "openai"]));

    const spec = PROVIDER_CATALOG.openai;
    const text = output();
    expect(text).toContain(`${spec.label} (openai):`);
    expect(text).toContain(`    - ${spec.defaultModel}  (default)`);
    const nonDefault = spec.models.find((m) => m.id !== spec.defaultModel);
    expect(text).toContain(`    - ${nonDefault?.id}\n`);
    expect(text).not.toContain(`${PROVIDER_CATALOG.anthropic.label} (anthropic):`);
  });

  it("lists every provider when none (or an unknown one) is given", async () => {
    await runModels(context(["models"]));
    const all = output();
    logged = [];
    await runModels(context(["models", "unknown"]));

    for (const id of ALL_PROVIDER_IDS) {
      expect(all).toContain(`${PROVIDER_CATALOG[id].label} (${id}):`);
    }
    expect(output()).toBe(all);
  });
});
