'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDefaultFactory, PROVIDER_CATALOG, ALL_PROVIDER_IDS } from '@gitpagedocs/tools/ai';
import type { AiProviderId, ProviderConfig } from '@gitpagedocs/tools/ports';
import { AiSecureStorage } from '@/shared/lib/ai-secure-storage';
import { describeAiBrowserError } from '@/shared/lib/ai-error';

export interface ConsoleMessage {
  role: 'user' | 'assistant';
  content: string;
}

const factory = createDefaultFactory();

/**
 * Secure AI console state machine. Credentials live encrypted in the vault
 * (AiSecureStorage); the password is held only in memory for the session and
 * is required before any provider call (the password gate).
 */
export function useAiConsole() {
  const storage = useMemo(() => new AiSecureStorage(), []);
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<AiProviderId>('openai');
  const [model, setModel] = useState<string>(PROVIDER_CATALOG.openai.defaultModel);
  const [savedProviders, setSavedProviders] = useState<string[]>([]);
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void storage.isInitialized().then(setInitialized);
  }, [storage]);

  const providers = ALL_PROVIDER_IDS.map((id) => ({ id, label: PROVIDER_CATALOG[id].label }));

  const selectProvider = useCallback((id: AiProviderId) => {
    setProviderId(id);
    setModel(PROVIDER_CATALOG[id].defaultModel);
  }, []);

  /** First run sets the local password; later runs verify it (the gate). */
  const unlock = useCallback(
    async (pw: string): Promise<boolean> => {
      setError(null);
      const isInit = await storage.isInitialized();
      if (!isInit) await storage.setPassword(pw);
      else if (!(await storage.unlock(pw))) {
        setError('Incorrect password.');
        return false;
      }
      setPassword(pw);
      setInitialized(true);
      return true;
    },
    [storage],
  );

  const saveApiKey = useCallback(
    async (apiKey: string): Promise<void> => {
      if (!password) return;
      await storage.saveKey(password, providerId, apiKey.trim());
    },
    [password, providerId, storage],
  );

  const config = useCallback(
    async (): Promise<ProviderConfig | null> => {
      if (!password) return null;
      const apiKey = await storage.getKey(password, providerId);
      if (!apiKey && providerId !== 'ollama') {
        setError(`No saved key for ${providerId}. Add one above.`);
        return null;
      }
      return { providerId, model, apiKey, baseUrl: providerId === 'ollama' ? apiKey : undefined };
    },
    [password, providerId, model, storage],
  );

  const testConnection = useCallback(async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const cfg = await config();
      if (!cfg) return;
      const res = await factory.create(providerId).generate(
        { messages: [{ role: 'user', content: 'Reply with the single word: OK' }], maxTokens: 5 },
        cfg,
      );
      setMessages((m) => [...m, { role: 'assistant', content: `Connection OK — ${res.text.trim().slice(0, 40)}` }]);
    } catch (e) {
      setError(describeAiBrowserError(providerId, e));
    } finally {
      setBusy(false);
    }
  }, [config, providerId]);

  const send = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;
      setBusy(true);
      setError(null);
      setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
      try {
        const cfg = await config();
        if (!cfg) return;
        for await (const delta of factory.create(providerId).stream({ messages: [{ role: 'user', content: text }] }, cfg)) {
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + delta };
            return next;
          });
        }
      } catch (e) {
        setError(describeAiBrowserError(providerId, e));
      } finally {
        setBusy(false);
      }
    },
    [config, providerId],
  );

  useEffect(() => {
    if (!password) return;
    void storage
      .isInitialized()
      .then(() => setSavedProviders([]))
      .catch(() => {});
  }, [password, storage]);

  return {
    initialized,
    unlocked: Boolean(password),
    providers,
    providerId,
    model,
    setModel,
    selectProvider,
    savedProviders,
    messages,
    busy,
    error,
    unlock,
    saveApiKey,
    testConnection,
    send,
  };
}
