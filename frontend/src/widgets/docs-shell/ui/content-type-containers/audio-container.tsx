"use client";

import type { LanguageCode } from "@/entities/docs";
import { AudioRouteControls, type AudioRouteControlsConfig } from "./audio-route-controls";
import { getAudioRouteCaptions } from "./captions-track";
import { resolveContentHeaderText } from "./content-header-text";
import type { RouteContainerFrameProps } from "./container-wrapper-props";
import { getFullscreenAlign } from "./fullscreen-alignment";
import { MediaCard } from "./route-content-frame";

interface AudioContainerProps extends RouteContainerFrameProps {
  audioType: string;
  pathAudio: string;
  language: LanguageCode;
  isDarkMode?: boolean;
  controlsConfig?: AudioRouteControlsConfig;
}

export function AudioContainer(props: Readonly<AudioContainerProps>) {
  const { audioType, pathAudio, language, config, isDarkMode = false, controlsConfig } = props;

  return (
    <MediaCard
      frame={props}
      header={resolveContentHeaderText(config, language, isDarkMode)}
      fullscreenAlign={getFullscreenAlign("audio")}
    >
      {controlsConfig && (
        <AudioRouteControls
          audioType={audioType}
          pathAudio={pathAudio}
          language={language}
          controls={controlsConfig}
          captions={getAudioRouteCaptions(config)}
        />
      )}
    </MediaCard>
  );
}
