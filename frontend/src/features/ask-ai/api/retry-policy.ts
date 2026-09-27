/**
 * @file retry-policy.ts
 * @description When a provider answers with a transient failure (rate limit,
 * overloaded or crashed upstream) the chat retries the request a couple of
 * times before showing an error, so a momentary 503 does not surface to the
 * reader as "internal server error".
 */

/** Total attempts per message, including the first one. */
export const MAX_STREAM_ATTEMPTS = 3;

const TRANSIENT_STATUSES: ReadonlySet<number> = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Timeouts, rate limits and 5xx are worth retrying; auth, quota and bad-request errors are final. */
export function isTransientStatus(status: number | undefined): boolean {
  return status !== undefined && TRANSIENT_STATUSES.has(status);
}

/** Exponential backoff between attempts: 600ms, then 1.2s. */
export function retryDelayMs(attempt: number): number {
  return 600 * 2 ** Math.max(attempt - 1, 0);
}

function abortError(): Error {
  return Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' });
}

/** Waits `ms`, rejecting with an AbortError as soon as `signal` aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
