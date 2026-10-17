export const DEFAULT_NARRATION_LABELS = {
  narrationTitle: "Accessibility and reading",
  narrationStart: "Read document",
  narrationPause: "Pause reading",
  narrationResume: "Resume reading",
  narrationStop: "Stop reading",
  narrationVoice: "Browser voice",
  narrationAutomaticVoice: "Automatic for the document language",
  narrationRate: "Speed",
  narrationVolume: "Volume",
  narrationUnsupported: "This browser does not support text narration.",
  narrationError: "Could not read aloud. Choose another voice or try again.",
  narrationReady: "Ready to read",
  narrationSpeaking: "Reading document",
  narrationPaused: "Reading paused",
  narrationSettingsHint: "Voices are supplied by your browser. Stop reading to change preferences.",
};

export type NarrationLabels = typeof DEFAULT_NARRATION_LABELS;

export function resolveNarrationLabels(langmenu: Record<string, Record<string, string>>, language: string): NarrationLabels {
  const labels = { ...DEFAULT_NARRATION_LABELS };
  for (const key of Object.keys(labels) as Array<keyof NarrationLabels>) {
    labels[key] = langmenu[language]?.[key]?.trim() || langmenu.en?.[key]?.trim() || labels[key];
  }
  return labels;
}
