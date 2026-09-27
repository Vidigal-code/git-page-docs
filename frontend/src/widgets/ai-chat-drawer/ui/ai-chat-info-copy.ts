/**
 * @file ai-chat-info-copy.ts
 * @description English copy of the AI chat "How it works" tab. It is the
 * fallback when a langmenu key is missing and the source of the `en` bundle.
 */
export interface AiChatInfoLabels {
    aiChatInfoTitle?: string;
    aiChatInfoIntro?: string;
    aiChatInfoWorksTitle?: string;
    aiChatInfoWorksItems?: string;
    aiChatInfoHowTitle?: string;
    aiChatInfoHowItems?: string;
    aiChatInfoFlowTitle?: string;
    aiChatInfoFlowItems?: string;
    aiChatInfoRisksTitle?: string;
    aiChatInfoRisksItems?: string;
    aiChatInfoBackBtn?: string;
}

export const AI_CHAT_INFO_FALLBACK: Required<AiChatInfoLabels> = {
    aiChatInfoTitle: 'How the AI Assistant works',
    aiChatInfoIntro:
        'The assistant answers questions about this documentation using an AI provider you choose (OpenAI, Anthropic Claude, Google Gemini or a local Ollama). This site has no server of its own: your browser talks directly to the provider with your own API key. Read the risks before using it.',
    aiChatInfoWorksTitle: 'How it works',
    aiChatInfoWorksItems: [
        'Local password: the first time, you create a password. It never leaves this browser and is never stored; it only derives the encryption key (PBKDF2-SHA-256, 210,000 iterations).',
        'Encrypted vault: your API keys are saved encrypted with AES-256-GCM in this browser\'s localStorage. Without the password the stored data is unreadable.',
        'Unlocking: while the chat is unlocked, the password is kept only in this page\'s memory. The API key itself is not kept decrypted.',
        'Each question: the key is decrypted at the moment you send, used for that single request and released when the answer ends.',
        'Request: the question, the recent conversation and the text of the page you are reading are sent over HTTPS directly to the chosen provider, which streams the answer back.',
        'Locking: the lock button, or the inactivity timer, removes the password from the page and brings back the password screen. The saved keys stay encrypted.',
    ].join('\n'),
    aiChatInfoHowTitle: 'How to use',
    aiChatInfoHowItems: [
        'Create a local password (at least 4 characters; a long, unique password is safer). Write it down: it cannot be recovered.',
        'Pick the provider and model, then paste your API key. For Ollama, enter the address of your local server (for example http://localhost:11434).',
        'Ask about the page you are reading; the answer appears in real time. You can attach images to providers that support them.',
        'When you finish, press the lock button. To come back, type the password again.',
        'Header buttons: gear changes provider or key; speech bubble clears the conversation; database erases the saved keys; exclamation mark opens this guide.',
    ].join('\n'),
    aiChatInfoFlowTitle: 'What can happen',
    aiChatInfoFlowItems: [
        'Wrong password: the vault does not open and nothing is erased. You can try again as many times as you want.',
        'Forgot the password: "Reset password" erases every saved key and the password; then you create a new password and paste the keys again.',
        'Inactivity: after {seconds}s without using the chat, a countdown appears. Cancel keeps the session; otherwise the chat locks and asks for the password.',
        'Temporary provider error (rate limit, busy or unavailable server): the request is retried automatically up to 3 times. If it keeps failing, a message ending in "Try again!" appears.',
        'Invalid, expired or unfunded key: the provider refuses the request and an authentication error appears. Update the key with the gear button.',
        'Model retired by the provider: the chat switches automatically to that provider\'s default model.',
        'Ollama: it must be running on your computer and allow requests from this site (CORS). Otherwise a connection error appears.',
        'No internet or a blocking network: the request fails with a connection error; nothing is lost.',
        'Clearing browser data, using a private window or another browser: the vault is not there, so you create a password and paste the key again.',
    ].join('\n'),
    aiChatInfoRisksTitle: 'Risks you take',
    aiChatInfoRisksItems: [
        'The key travels in every request. Anyone using this computer with the developer tools open (Network tab) can see it while you chat. With Google Gemini it goes in the request URL.',
        'A weak password can be guessed by someone who copies this browser\'s storage. Use a long password you do not use anywhere else.',
        'Locking removes the password from the page, but the browser frees that memory only later. Do not use the assistant on shared or public computers.',
        'Browser extensions with access to this site can read what the page sees, including the key while it is decrypted. Use a browser profile without unknown extensions.',
        'Your questions, the conversation and the text of the current page are sent to the chosen provider and fall under its privacy policy. Do not send passwords, personal data or confidential information.',
        'Usage is billed to your provider account. Set spending limits in the provider\'s dashboard and revoke the key right away if you suspect a leak.',
        'AI answers can be wrong or invented. Check important information in the documentation itself.',
    ].join('\n'),
    aiChatInfoBackBtn: 'Back to chat',
};

