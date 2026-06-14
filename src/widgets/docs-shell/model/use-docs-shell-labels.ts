import { useMemo } from "react";
import { getLangMenuLabelFromMenu, resolveTranslation, type LoadedDocsData } from "@/entities/docs";

export interface DocsShellLabels {
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel: string;
  browseNextLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  quickNavPlaceholder: string;
  noNavigationResults: string;
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  fullscreenExpandLabel: string;
  aiChatTitle: string;
  aiChatPlaceholder: string;
  aiChatConfigTitle: string;
  aiChatConfigDesc: string;
  aiChatClearDataBtn: string;
  aiChatSendBtn: string;
  aiChatAttachAriaLabel: string;
  aiChatOpenBtnAriaLabel: string;
  aiChatCloseBtnAriaLabel: string;
  aiChatSystemPrompt: string;
  aiChatEmptyStateGreeting: string;
  aiChatDisclaimer: string;
  aiChatProviderLabel: string;
  aiChatApiKeyLabel: string;
  aiChatProviderOpenAI: string;
  aiChatProviderClaude: string;
  aiChatProviderGemini: string;
  aiChatProviderOllama: string;
  aiChatEmptyPageContent: string;
  aiChatNoPageId: string;
  aiChatOllamaUrlLabel: string;
  aiChatClearChatPopupTitle: string;
  aiChatClearChatPopupDesc: string;
  aiChatClearChatConfirmBtn: string;
  aiChatClearChatCancelBtn: string;
  aiChatClearDataPopupTitle: string;
  aiChatClearDataPopupDesc: string;
  aiChatClearDataConfirmBtn: string;
  aiChatClearDataCancelBtn: string;
  aiChatUserLabel: string;
  aiChatApiError: string;
  aiChatError401: string;
  aiChatError429: string;
  aiChatError500: string;
  aiChatErrorGeneric: string;
}

export function useDocsShellLabels(data: LoadedDocsData, language: string): DocsShellLabels {
  return useMemo(() => {
    const previousLabel = resolveTranslation(
      data.config.translations?.navigation?.previous,
      language,
      "Previous",
    );
    const nextLabel = resolveTranslation(data.config.translations?.navigation?.next, language, "Next");
    const browsePrevLabel = resolveTranslation(
      data.config.translations?.navigation?.browsePrev,
      language,
      previousLabel,
    );
    const browseNextLabel = resolveTranslation(
      data.config.translations?.navigation?.browseNext,
      language,
      nextLabel,
    );
    const menuCloseLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "menuClose",
      resolveTranslation(data.config.translations?.navigation?.menuClose, language, "Close"),
    );
    const menuOpenLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "menuOpen",
      resolveTranslation(data.config.translations?.navigation?.menuOpen, language, "Menu"),
    );
    const quickNavPlaceholder = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "typeToNavigate",
      "Type to navigate...",
    );
    const noNavigationResults = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "noNavigationResults",
      "No navigation results.",
    );
    const navigateHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "navigateHint",
      "Navigate",
    );
    const selectHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "selectHint",
      "Select",
    );
    const escHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "escHint",
      "ESC",
    );
    const closeHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "closeHint",
      menuCloseLabel,
    );
    const fullscreenExpandLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "showMenu",
      "Fullscreen",
    );
    const aiChatTitle = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatTitle", "AI Assistant");
    const aiChatPlaceholder = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatPlaceholder", "Ask about the documentation...");
    const aiChatConfigTitle = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatConfigTitle", "Configure AI");
    const aiChatConfigDesc = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatConfigDesc", "Enter your API key to enable the chat.");
    const aiChatClearDataBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearDataBtn", "Clear local data");
    const aiChatSendBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatSendBtn", "Send");
    const aiChatAttachAriaLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatAttachAriaLabel", "Attach audio or image file");
    const aiChatOpenBtnAriaLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatOpenBtnAriaLabel", "Open AI Chat");
    const aiChatCloseBtnAriaLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatCloseBtnAriaLabel", "Close chat");
    const aiChatSystemPrompt = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatSystemPrompt", "You are the official AI documentation assistant for the '{headerName}' project. Your primary role is to answer questions strictly related to the project's documentation, configurations (like config.json), and markdown files located in the 'gitpagedocs' directory. Be highly professional and helpful.\n\nIMPORTANT: You MUST address the user and respond EXCLUSIVELY in the following language: {language}.\n\nHere is the raw content of the active page the user is currently looking at:\n[Page ID]: {pageId}\n[Hidden Current Context Content]:\n{rawContent}");
    const aiChatEmptyStateGreeting = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatEmptyStateGreeting", "Hello! I am the artificial intelligence assistant of this documentation. You can ask me questions about the content or search for a term across the documentation. How can I help you today?");
    const aiChatDisclaimer = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatDisclaimer", "AI can make mistakes. Always verify the information.");

    // Auth and API Key texts
    const aiChatProviderLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatProviderLabel", "Provider:");
    const aiChatApiKeyLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatApiKeyLabel", "API Key (leave blank for Local AI):");
    const aiChatProviderOpenAI = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatProviderOpenAI", "OpenAI (GPT-4o-mini)");
    const aiChatProviderClaude = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatProviderClaude", "Anthropic Claude (3.5 Sonnet)");
    const aiChatProviderGemini = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatProviderGemini", "Google Gemini (1.5 Flash)");
    const aiChatProviderOllama = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatProviderOllama", "Ollama Network (Local LLMs)");

    // Content states
    const aiChatEmptyPageContent = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatEmptyPageContent", "No compatible active page.");
    const aiChatNoPageId = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatNoPageId", "No page");
    const aiChatOllamaUrlLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatOllamaUrlLabel", "Ollama API URL (leave blank for local)");

    // Popups
    const aiChatClearChatPopupTitle = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearChatPopupTitle", "Clear conversation?");
    const aiChatClearChatPopupDesc = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearChatPopupDesc", "This will delete all current chat history. This action cannot be undone.");
    const aiChatClearChatConfirmBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearChatConfirmBtn", "Yes, delete");
    const aiChatClearChatCancelBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearChatCancelBtn", "Cancel");
    const aiChatClearDataPopupTitle = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearDataPopupTitle", "Erase all data?");
    const aiChatClearDataPopupDesc = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearDataPopupDesc", "This will delete all chats and local API keys. The AI chat will be closed.");
    const aiChatClearDataConfirmBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearDataConfirmBtn", "Yes, erase everything");
    const aiChatClearDataCancelBtn = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatClearDataCancelBtn", "Cancel");
    const aiChatUserLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatUserLabel", "You");
    const aiChatApiError = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatApiError", "An API connection error occurred.");
    const aiChatError401 = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatError401", "Invalid access key or unauthorized provider.");
    const aiChatError429 = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatError429", "Rate limit exceeded. Please try again later.");
    const aiChatError500 = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatError500", "An internal server error occurred on the AI model.");
    const aiChatErrorGeneric = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "aiChatErrorGeneric", "An unexpected error occurred while communicating with the AI.");

    return {
      previousLabel,
      nextLabel,
      browsePrevLabel,
      browseNextLabel,
      menuOpenLabel,
      menuCloseLabel,
      quickNavPlaceholder,
      noNavigationResults,
      navigateHintLabel,
      selectHintLabel,
      escHintLabel,
      closeHintLabel,
      fullscreenExpandLabel,
      aiChatTitle,
      aiChatPlaceholder,
      aiChatConfigTitle,
      aiChatConfigDesc,
      aiChatClearDataBtn,
      aiChatSendBtn,
      aiChatAttachAriaLabel,
      aiChatOpenBtnAriaLabel,
      aiChatCloseBtnAriaLabel,
      aiChatSystemPrompt,
      aiChatEmptyStateGreeting,
      aiChatDisclaimer,
      aiChatProviderLabel,
      aiChatApiKeyLabel,
      aiChatProviderOpenAI,
      aiChatProviderClaude,
      aiChatProviderGemini,
      aiChatProviderOllama,
      aiChatEmptyPageContent,
      aiChatNoPageId,
      aiChatOllamaUrlLabel,
      aiChatClearChatPopupTitle,
      aiChatClearChatPopupDesc,
      aiChatClearChatConfirmBtn,
      aiChatClearChatCancelBtn,
      aiChatClearDataPopupTitle,
      aiChatClearDataPopupDesc,
      aiChatClearDataConfirmBtn,
      aiChatClearDataCancelBtn,
      aiChatUserLabel,
      aiChatApiError,
      aiChatError401,
      aiChatError429,
      aiChatError500,
      aiChatErrorGeneric,
    };
  }, [data.config.site.langmenu, data.config.translations, language]);
}
