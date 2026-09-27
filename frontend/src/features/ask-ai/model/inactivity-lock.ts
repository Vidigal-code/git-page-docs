/**
 * @file inactivity-lock.ts
 * @description Auto-lock of the AI chat: after `AiChatAutoLockSeconds` without
 * any interaction the session password is dropped again, leaving the stored
 * keys encrypted at rest. The last seconds are announced by a countdown the
 * reader can cancel (keep the session) or confirm (lock right away).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** `site.AiChatAutoLockSeconds` default; 0 disables the auto-lock. */
export const DEFAULT_AUTO_LOCK_SECONDS = 30;

/** How long before the limit the countdown dialog appears. */
export const AUTO_LOCK_WARNING_SECONDS = 10;

/** Config values are untrusted: anything that is not a finite number >= 0 means the default. */
export function normalizeAutoLockSeconds(value: unknown): number {
    const candidate = typeof value === 'string' ? Number(value) : value;
    if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < 0) {
        return DEFAULT_AUTO_LOCK_SECONDS;
    }
    return Math.round(candidate);
}

export type InactivityPhase =
    | { phase: 'active' }
    | { phase: 'warning'; remaining: number }
    | { phase: 'locked' };

/** Where an idle session of `idleMs` stands against a limit of `totalSeconds`. */
export function resolveInactivityPhase(
    idleMs: number,
    totalSeconds: number,
    warningSeconds: number = AUTO_LOCK_WARNING_SECONDS,
): InactivityPhase {
    if (totalSeconds <= 0) return { phase: 'active' };
    const totalMs = totalSeconds * 1000;
    if (idleMs >= totalMs) return { phase: 'locked' };
    const warningStartMs = Math.max(totalMs - warningSeconds * 1000, 0);
    if (idleMs < warningStartMs) return { phase: 'active' };
    return { phase: 'warning', remaining: Math.ceil((totalMs - idleMs) / 1000) };
}

function samePhase(a: InactivityPhase, b: InactivityPhase): boolean {
    if (a.phase !== b.phase) return false;
    return a.phase !== 'warning' || b.phase !== 'warning' || a.remaining === b.remaining;
}

export interface UseInactivityLockOptions {
    /** Only an open, unlocked chat is watched. */
    enabled: boolean;
    /** Seconds of inactivity before locking; 0 disables. */
    seconds: number;
    onLock: () => void;
    warningSeconds?: number;
    /** Clock resolution of the idle check. */
    tickMs?: number;
}

export interface InactivityLockState {
    warningOpen: boolean;
    /** Seconds left while the warning is open, else 0. */
    remaining: number;
    /** Call on any interaction; ignored while the warning is open (only Cancel keeps the session then). */
    registerActivity: () => void;
    /** Cancel button: closes the warning and restarts the quiet period. */
    cancelWarning: () => void;
    /** Confirm button: locks immediately. */
    lockNow: () => void;
}

export function useInactivityLock({
    enabled,
    seconds,
    onLock,
    warningSeconds = AUTO_LOCK_WARNING_SECONDS,
    tickMs = 1000,
}: UseInactivityLockOptions): InactivityLockState {
    const [phase, setPhase] = useState<InactivityPhase>({ phase: 'active' });
    const lastActivityRef = useRef(Date.now());
    const warningRef = useRef(false);
    const onLockRef = useRef(onLock);
    onLockRef.current = onLock;

    const lockNow = useCallback(() => {
        warningRef.current = false;
        lastActivityRef.current = Date.now();
        setPhase({ phase: 'active' });
        onLockRef.current();
    }, []);

    const registerActivity = useCallback(() => {
        if (warningRef.current) return;
        lastActivityRef.current = Date.now();
    }, []);

    const cancelWarning = useCallback(() => {
        warningRef.current = false;
        lastActivityRef.current = Date.now();
        setPhase({ phase: 'active' });
    }, []);

    useEffect(() => {
        if (!enabled || seconds <= 0) {
            warningRef.current = false;
            setPhase({ phase: 'active' });
            return undefined;
        }
        lastActivityRef.current = Date.now();
        const timer = setInterval(() => {
            const next = resolveInactivityPhase(Date.now() - lastActivityRef.current, seconds, warningSeconds);
            if (next.phase === 'locked') {
                lockNow();
                return;
            }
            warningRef.current = next.phase === 'warning';
            setPhase((previous) => (samePhase(previous, next) ? previous : next));
        }, tickMs);
        return () => clearInterval(timer);
    }, [enabled, seconds, warningSeconds, tickMs, lockNow]);

    return {
        warningOpen: phase.phase === 'warning',
        remaining: phase.phase === 'warning' ? phase.remaining : 0,
        registerActivity,
        cancelWarning,
        lockNow,
    };
}
