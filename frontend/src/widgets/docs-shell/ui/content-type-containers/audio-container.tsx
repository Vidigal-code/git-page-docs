"use client";

import type { LanguageCode } from "@/entities/docs";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { AudioRouteControls, type AudioRouteControlsConfig } from "./audio-route-controls";
import { getAudioRouteCaptions } from "./captions-track";
import { CardInsideDescription, CardInsideTitle } from "./card-inside-text";
import { resolveContentHeaderText } from "./content-header-text";
import { toContainerWrapperProps, type RouteContainerFrameProps } from "./container-wrapper-props";
import { getFullscreenAlign } from "./fullscreen-alignment";
import styles from "../../docs-shell.module.css";

interface AudioContainerProps extends RouteContainerFrameProps {
  audioType: string;
  pathAudio: string;
  language: LanguageCode;
  isDarkMode?: boolean;
  controlsConfig?: AudioRouteControlsConfig;
}

export function AudioContainer(props: Readonly<AudioContainerProps>) {
  const { audioType, pathAudio, language, config, isDarkMode = false, controlsConfig } = props;
  const header = resolveContentHeaderText(config, language, isDarkMode);

  return (
    <ContentContainerWrapper {...toContainerWrapperProps(props)} fullscreenAlign={getFullscreenAlign("audio")}>
      <article className={styles.card}>
        <CardInsideTitle header={header} />
        {controlsConfig && (
          <AudioRouteControls
            audioType={audioType}
            pathAudio={pathAudio}
            language={language}
            controls={controlsConfig}
            captions={getAudioRouteCaptions(config)}
          />
        )}
        <CardInsideDescription header={header} />
      </article>
    </ContentContainerWrapper>
  );
}
