"use client";

import { useId, type ReactNode } from "react";
import { FiVolume2 } from "@react-icons/all-files/fi/FiVolume2";
import { FiPlay } from "@react-icons/all-files/fi/FiPlay";
import { FiPause } from "@react-icons/all-files/fi/FiPause";
import { FiSquare } from "@react-icons/all-files/fi/FiSquare";
import type { NarrationController } from "../model/use-markdown-narration";
import type { NarrationLabels } from "../model/narration-labels";
import { NARRATION_RATE, NARRATION_VOLUME } from "../model/narration-settings";
import styles from "./narration-panel.module.css";

interface NarrationPanelProps {
  controller: NarrationController;
  labels: NarrationLabels;
}

export function NarrationPanel({ controller, labels }: Readonly<NarrationPanelProps>): ReactNode {
  const id = useId();
  const active = controller.status === "speaking" || controller.status === "paused";
  const statuses = {
    idle: labels.narrationReady,
    speaking: labels.narrationSpeaking,
    paused: labels.narrationPaused,
    error: labels.narrationError,
  };
  return (
    <details className={styles.panel}>
      <summary><FiVolume2 aria-hidden="true" /> {labels.narrationTitle}</summary>
      {controller.supported ? (
        <div className={styles.content}>
          <fieldset className={styles.settings} disabled={active} aria-describedby={`${id}-hint`}>
            <legend className={styles.legend}>{labels.narrationTitle}</legend>
            <label className={styles.voice} htmlFor={`${id}-voice`}>
              {labels.narrationVoice}
              <select id={`${id}-voice`} value={controller.voiceUri} onChange={(event) => controller.setVoiceUri(event.target.value)}>
                <option value="">{labels.narrationAutomaticVoice}</option>
                {controller.voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
              </select>
            </label>
            <label htmlFor={`${id}-rate`}>
              {labels.narrationRate} <span>{controller.rate}×</span>
              <input id={`${id}-rate`} type="range" min={NARRATION_RATE.min} max={NARRATION_RATE.max} step={NARRATION_RATE.step} value={controller.rate} onChange={(event) => controller.setRate(event.target.valueAsNumber)} />
            </label>
            <label htmlFor={`${id}-volume`}>
              {labels.narrationVolume} <span>{Math.round(controller.volume * 100)}%</span>
              <input id={`${id}-volume`} type="range" min={NARRATION_VOLUME.min} max={NARRATION_VOLUME.max} step={NARRATION_VOLUME.step} value={controller.volume} onChange={(event) => controller.setVolume(event.target.valueAsNumber)} />
            </label>
          </fieldset>
          <p id={`${id}-hint`} className={styles.hint}>{labels.narrationSettingsHint}</p>
          <div className={styles.actions}>
            {!active && <button type="button" onClick={controller.start}><FiPlay aria-hidden="true" />{labels.narrationStart}</button>}
            {controller.status === "speaking" && <button type="button" onClick={controller.pause}><FiPause aria-hidden="true" />{labels.narrationPause}</button>}
            {controller.status === "paused" && <button type="button" onClick={controller.resume}><FiPlay aria-hidden="true" />{labels.narrationResume}</button>}
            <button type="button" onClick={controller.stop} disabled={!active}><FiSquare aria-hidden="true" />{labels.narrationStop}</button>
            <output aria-live="polite" className={styles.status}>{statuses[controller.status]}</output>
          </div>
        </div>
      ) : <p className={styles.content}>{labels.narrationUnsupported}</p>}
    </details>
  );
}
