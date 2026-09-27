'use client';

import { useState } from 'react';
import type { AiProviderId } from '@gitpagedocs/tools/ports';
import { useAiConsole } from '@/features/ai-console';
import type { ConsoleMessage } from '@/features/ai-console';

const box: React.CSSProperties = {
  maxWidth: 760,
  width: '100%',
  margin: '0 auto',
  padding: '1rem',
  boxSizing: 'border-box',
};
const card: React.CSSProperties = {
  border: '1px solid #30363d',
  borderRadius: 12,
  padding: '1rem',
  background: '#0d1117',
  color: '#e6edf3',
  boxSizing: 'border-box',
};
const input: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: 8,
  border: '1px solid #30363d',
  background: '#161b22',
  color: '#e6edf3',
  boxSizing: 'border-box',
};
const button: React.CSSProperties = {
  padding: '0.6rem 1rem',
  borderRadius: 8,
  border: '1px solid #2f81f7',
  background: '#2f81f7',
  color: '#fff',
  cursor: 'pointer',
};

type AiConsole = ReturnType<typeof useAiConsole>;

interface KeyedMessage {
  key: string;
  message: ConsoleMessage;
}

/**
 * List keys that never come from the array index: the transcript is append-only,
 * so "nth message of this role" stays stable while streaming rewrites the last
 * assistant entry in place.
 */
function toKeyedMessages(messages: readonly ConsoleMessage[]): KeyedMessage[] {
  const perRole = new Map<ConsoleMessage['role'], number>();
  return messages.map((message) => {
    const ordinal = (perRole.get(message.role) ?? 0) + 1;
    perRole.set(message.role, ordinal);
    return { key: `${message.role}-${ordinal}`, message };
  });
}

function UnlockCard({ ai }: Readonly<{ ai: AiConsole }>) {
  const [pw, setPw] = useState('');
  return (
    <div style={card}>
      <p style={{ marginBottom: '0.75rem' }}>
        {ai.initialized ? 'Enter your local password to unlock.' : 'Create a local password to encrypt your API keys.'}
      </p>
      <input
        data-testid="password-input"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Local password"
        style={{ ...input, marginBottom: '0.75rem' }}
      />
      <button
        data-testid="unlock-button"
        style={button}
        onClick={() => {
          void ai.unlock(pw).then((ok) => ok && setPw(''));
        }}
      >
        {ai.initialized ? 'Unlock' : 'Create password'}
      </button>
      {ai.error && <p style={{ color: '#f85149', marginTop: '0.75rem' }}>{ai.error}</p>}
      {ai.initialized && (
        <button
          data-testid="reset-password"
          onClick={() => { void ai.reset(); setPw(''); }}
          style={{ display: 'block', marginTop: '0.75rem', background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
        >
          Forgot password? Reset (erases saved keys)
        </button>
      )}
    </div>
  );
}

function ProviderCard({ ai }: Readonly<{ ai: AiConsole }>) {
  const [apiKey, setApiKey] = useState('');
  return (
    <div style={card}>
      <label htmlFor="ai-console-provider" style={{ display: 'block', marginBottom: '0.5rem' }}>Provider</label>
      <select
        id="ai-console-provider"
        data-testid="provider-select"
        value={ai.providerId}
        onChange={(e) => ai.selectProvider(e.target.value as AiProviderId)}
        style={{ ...input, marginBottom: '0.75rem' }}
      >
        {ai.providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <label htmlFor="ai-console-model" style={{ display: 'block', marginBottom: '0.5rem' }}>Model</label>
      <input id="ai-console-model" value={ai.model} onChange={(e) => ai.setModel(e.target.value)} style={{ ...input, marginBottom: '0.75rem' }} />

      <label htmlFor="ai-console-api-key" style={{ display: 'block', marginBottom: '0.5rem' }}>API key (stored encrypted)</label>
      <input
        id="ai-console-api-key"
        data-testid="apikey-input"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-…"
        style={{ ...input, marginBottom: '0.75rem' }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          data-testid="save-key"
          style={button}
          onClick={() => {
            void ai.saveApiKey(apiKey).then(() => setApiKey(''));
          }}
        >
          Save key
        </button>
        <button data-testid="test-connection" style={{ ...button, background: '#238636', borderColor: '#238636' }} disabled={ai.busy} onClick={() => void ai.testConnection()}>
          Test connection
        </button>
      </div>
    </div>
  );
}

function MessageList({ messages }: Readonly<{ messages: readonly ConsoleMessage[] }>) {
  if (messages.length === 0) {
    return <span style={{ color: '#8b949e' }}>Ask the AI or test the connection.</span>;
  }
  return toKeyedMessages(messages).map(({ key, message }) => (
    <p key={key} style={{ margin: '0.25rem 0' }}>
      <strong style={{ color: message.role === 'user' ? '#2f81f7' : '#3fb950' }}>{message.role}: </strong>
      {message.content}
    </p>
  ));
}

function ChatCard({ ai }: Readonly<{ ai: AiConsole }>) {
  const [chatText, setChatText] = useState('');
  return (
    <div style={card}>
      <div data-testid="messages" style={{ minHeight: 120, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
        <MessageList messages={ai.messages} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          data-testid="chat-input"
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder="Message…"
          style={input}
        />
        <button
          data-testid="chat-send"
          style={button}
          disabled={ai.busy}
          onClick={() => {
            const t = chatText;
            setChatText('');
            void ai.send(t);
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function UnlockedConsole({ ai }: Readonly<{ ai: AiConsole }>) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <ProviderCard ai={ai} />
      <ChatCard ai={ai} />
      {ai.error && (
        <p data-testid="console-error" style={{ color: '#f85149' }}>
          {ai.error}
        </p>
      )}
    </div>
  );
}

function ConsoleBody({ ai }: Readonly<{ ai: AiConsole }>) {
  if (ai.initialized === null) {
    return <div style={card}>Loading…</div>;
  }
  if (!ai.unlocked) {
    return <UnlockCard ai={ai} />;
  }
  return <UnlockedConsole ai={ai} />;
}

export default function AiConsolePage() {
  const ai = useAiConsole();

  return (
    <main style={{ minHeight: '100vh', background: '#010409', padding: '1rem 0' }} data-testid="ai-console">
      <div style={box}>
        <h1 style={{ color: '#e6edf3', fontSize: '1.4rem', marginBottom: '1rem' }}>AI Console</h1>
        <ConsoleBody ai={ai} />
      </div>
    </main>
  );
}
