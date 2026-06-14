'use client';

import { useState } from 'react';
import type { AiProviderId } from '@gitpagedocs/tools/ports';
import { useAiConsole } from '@/features/ai-console';

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

export default function AiConsolePage() {
  const c = useAiConsole();
  const [pw, setPw] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [chatText, setChatText] = useState('');

  return (
    <main style={{ minHeight: '100vh', background: '#010409', padding: '1rem 0' }} data-testid="ai-console">
      <div style={box}>
        <h1 style={{ color: '#e6edf3', fontSize: '1.4rem', marginBottom: '1rem' }}>AI Console</h1>

        {c.initialized === null ? (
          <div style={card}>Loading…</div>
        ) : !c.unlocked ? (
          <div style={card}>
            <p style={{ marginBottom: '0.75rem' }}>
              {c.initialized ? 'Enter your local password to unlock.' : 'Create a local password to encrypt your API keys.'}
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
                void c.unlock(pw).then((ok) => ok && setPw(''));
              }}
            >
              {c.initialized ? 'Unlock' : 'Create password'}
            </button>
            {c.error && <p style={{ color: '#f85149', marginTop: '0.75rem' }}>{c.error}</p>}
            {c.initialized && (
              <button
                data-testid="reset-password"
                onClick={() => { void c.reset(); setPw(''); }}
                style={{ display: 'block', marginTop: '0.75rem', background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
              >
                Forgot password? Reset (erases saved keys)
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={card}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Provider</label>
              <select
                data-testid="provider-select"
                value={c.providerId}
                onChange={(e) => c.selectProvider(e.target.value as AiProviderId)}
                style={{ ...input, marginBottom: '0.75rem' }}
              >
                {c.providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model</label>
              <input value={c.model} onChange={(e) => c.setModel(e.target.value)} style={{ ...input, marginBottom: '0.75rem' }} />

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>API key (stored encrypted)</label>
              <input
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
                    void c.saveApiKey(apiKey).then(() => setApiKey(''));
                  }}
                >
                  Save key
                </button>
                <button data-testid="test-connection" style={{ ...button, background: '#238636', borderColor: '#238636' }} disabled={c.busy} onClick={() => void c.testConnection()}>
                  Test connection
                </button>
              </div>
            </div>

            <div style={card}>
              <div data-testid="messages" style={{ minHeight: 120, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {c.messages.length === 0 ? (
                  <span style={{ color: '#8b949e' }}>Ask the AI or test the connection.</span>
                ) : (
                  c.messages.map((m, i) => (
                    <p key={i} style={{ margin: '0.25rem 0' }}>
                      <strong style={{ color: m.role === 'user' ? '#2f81f7' : '#3fb950' }}>{m.role}: </strong>
                      {m.content}
                    </p>
                  ))
                )}
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
                  disabled={c.busy}
                  onClick={() => {
                    const t = chatText;
                    setChatText('');
                    void c.send(t);
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            {c.error && (
              <p data-testid="console-error" style={{ color: '#f85149' }}>
                {c.error}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
