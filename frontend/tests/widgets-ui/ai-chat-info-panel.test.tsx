// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AiChatInfoPanel } from "@/widgets/ai-chat-drawer/ui/ai-chat-info-panel";

afterEach(cleanup);

const labels = {
  aiChatInfoTitle: "Como funciona",
  aiChatInfoIntro: "Intro",
  aiChatInfoHowTitle: "Como usar",
  aiChatInfoHowItems: "Passo um\nPasso dois\n",
  aiChatInfoFlowTitle: "O que pode acontecer",
  aiChatInfoFlowItems: "Bloqueia após {seconds}s",
  aiChatInfoRisksTitle: "Riscos",
  aiChatInfoRisksItems: "Risco A\nRisco B\nRisco C",
  aiChatInfoBackBtn: "Voltar",
};

describe("AiChatInfoPanel", () => {
  it("renders the sections, one list item per line, with the lock time filled in", () => {
    render(<AiChatInfoPanel labels={labels} autoLockSeconds={45} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Como funciona" })).toBeTruthy();
    expect(screen.getByTestId("ai-chat-info-how").querySelectorAll("ol li")).toHaveLength(2);
    expect(screen.getByText("Bloqueia após 45s")).toBeTruthy();
    expect(screen.getByTestId("ai-chat-info-risks").querySelectorAll("li")).toHaveLength(3);
  });

  it("falls back to English copy and the default lock time", () => {
    render(<AiChatInfoPanel labels={{}} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "How the AI Assistant works" })).toBeTruthy();
    expect(screen.getByTestId("ai-chat-info-panel").textContent).toContain("30s");
    expect(screen.getByTestId("ai-chat-info-risks").querySelectorAll("li").length).toBeGreaterThan(3);
  });

  it("returns to the chat from the back button", () => {
    const onClose = vi.fn();
    render(<AiChatInfoPanel labels={labels} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
