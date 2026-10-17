"use client";

import { useExclusivePlayback } from "@/shared/lib/media-playback";
import { useCallback, useEffect, useRef, useState } from "react";
import { readableMarkdownText, splitNarrationText } from "./readable-text";
import type { NarrationSettings } from "@/entities/docs";
import { NARRATION_RATE, NARRATION_VOLUME, normalizeNarrationSetting } from "./narration-settings";
import { useNarrationVoices } from "./use-narration-voices";

interface NarrationOptions {
  html: string;
  language: string;
  exclusivePlayback?: boolean;
  documentId?: string;
  settings?: NarrationSettings;
  enabled?: boolean;
}

export interface NarrationController {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  status: "idle" | "speaking" | "paused" | "error";
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  voiceUri: string;
  setVoiceUri: (value: string) => void;
  rate: number;
  setRate: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
}

export function useMarkdownNarration({ html, language, documentId, settings, enabled = true, exclusivePlayback = true }: NarrationOptions): NarrationController {
  const { supported, voices } = useNarrationVoices();
  const [voiceUri, setVoiceUri] = useState("");
  const [rate, setRate] = useState(() => normalizeNarrationSetting(settings?.defaultRate, NARRATION_RATE));
  const [volume, setVolume] = useState(() => normalizeNarrationSetting(settings?.defaultVolume, NARRATION_VOLUME));
  const [status, setStatus] = useState<NarrationController["status"]>("idle");
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const stop = useCallback((): void => {
    if (!currentUtterance.current) return;
    currentUtterance.current = null;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);
  useEffect(() => stop, [html, language, documentId, enabled, stop]);
  const claimPlayback = useExclusivePlayback(() => { if (exclusivePlayback) stop(); });
  function start(): void {
    if (!supported || !enabled) return;
    stop();
    const chunks = splitNarrationText(readableMarkdownText(html));
    if (!chunks.length) return;
    const voice = voices.find((candidate) => candidate.voiceURI === voiceUri) ?? null;
    function speakChunk(index: number): void {
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = voice?.lang ?? language;
      utterance.voice = voice;
      utterance.rate = rate;
      utterance.volume = volume;
      currentUtterance.current = utterance;
      utterance.addEventListener("end", () => {
        if (currentUtterance.current !== utterance) return;
        if (index + 1 < chunks.length) {
          speakChunk(index + 1);
        } else {
          currentUtterance.current = null;
          setStatus("idle");
        }
      });
      utterance.addEventListener("error", () => {
        if (currentUtterance.current !== utterance) return;
        currentUtterance.current = null;
        setStatus("error");
      });
      window.speechSynthesis.speak(utterance);
    }
    if (exclusivePlayback) claimPlayback();
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    setStatus("speaking");
    speakChunk(0);
  }
  function pause(): void {
    if (status !== "speaking") return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }
  function resume(): void {
    if (status !== "paused") return;
    if (exclusivePlayback) claimPlayback();
    window.speechSynthesis.resume();
    setStatus("speaking");
  }
  return {
    start, pause, resume, stop, status, supported, voices, voiceUri, setVoiceUri, rate, volume,
    setRate: (value) => setRate(normalizeNarrationSetting(value, NARRATION_RATE)),
    setVolume: (value) => setVolume(normalizeNarrationSetting(value, NARRATION_VOLUME)),
  };
}
