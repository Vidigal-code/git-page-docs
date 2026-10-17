"use client";

import { useId, type ReactNode } from "react";
import { FiVolume2 } from "@react-icons/all-files/fi/FiVolume2";
import { FiPlay } from "@react-icons/all-files/fi/FiPlay";
import { FiPause } from "@react-icons/all-files/fi/FiPause";
import { FiSquare } from "@react-icons/all-files/fi/FiSquare";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";
import { NativeSelect } from "@/shared/ui/native-select";
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
  const startAction = { run: controller.start, label: labels.narrationStart, Icon: FiPlay };
  const actions = {
    idle: startAction,
    error: startAction,
    speaking: { run: controller.pause, label: labels.narrationPause, Icon: FiPause },
    paused: { run: controller.resume, label: labels.narrationResume, Icon: FiPlay },
  };
  const primaryAction = actions[controller.status];
  return (
    <details className={styles.panel}>
      <summary>
        <FiVolume2 aria-hidden="true" focusable="false" />
        {labels.narrationTitle}
        <FiChevronDown className={styles.disclosureArrow} aria-hidden="true" focusable="false" />
      </summary>
      {controller.supported ? (
        <div className={styles.content}>
          <fieldset className={styles.settings} disabled={active} aria-describedby={`${id}-hint`}>
            <legend className={styles.legend}>{labels.narrationTitle}</legend>
            <label className={styles.voice} htmlFor={`${id}-voice`}>
              <span className={styles.labelText}>{labels.narrationVoice}</span>
                <NativeSelect id={`${id}-voice`} value={controller.voiceUri} onChange={(event) => controller.setVoiceUri(event.target.value)}>
                  <option value="">{labels.narrationAutomaticVoice}</option>
                  {controller.voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                </NativeSelect>
            </label>
            <label htmlFor={`${id}-rate`}>
              <span className={styles.labelText}>{labels.narrationRate} <span className={styles.value}>{controller.rate}×</span></span>
              <span className={styles.rangeControl}>
                <input id={`${id}-rate`} type="range" min={NARRATION_RATE.min} max={NARRATION_RATE.max} step={NARRATION_RATE.step} value={controller.rate} onChange={(event) => controller.setRate(event.target.valueAsNumber)} />
              </span>
            </label>
            <label htmlFor={`${id}-volume`}>
              <span className={styles.labelText}>{labels.narrationVolume} <span className={styles.value}>{Math.round(controller.volume * 100)}%</span></span>
              <span className={styles.rangeControl}>
                <input id={`${id}-volume`} type="range" min={NARRATION_VOLUME.min} max={NARRATION_VOLUME.max} step={NARRATION_VOLUME.step} value={controller.volume} onChange={(event) => controller.setVolume(event.target.valueAsNumber)} />
              </span>
            </label>
          </fieldset>
          <p id={`${id}-hint`} className={styles.hint}>{labels.narrationSettingsHint}</p>
          <div className={styles.actions}>
            <button type="button" onClick={primaryAction.run}><primaryAction.Icon aria-hidden="true" />{primaryAction.label}</button>
            <button type="button" onClick={controller.stop} disabled={!active}><FiSquare aria-hidden="true" />{labels.narrationStop}</button>
            <output aria-live="polite" className={styles.status}>{statuses[controller.status]}</output>
          </div>
        </div>
      ) : <p className={styles.content}>{labels.narrationUnsupported}</p>}
    </details>
  );
}
