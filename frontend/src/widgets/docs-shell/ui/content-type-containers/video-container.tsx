"use client";

import { useCallback, useRef } from "react";
import { getEmbedUrl, isNativeAudio, isNativeVideo, type LanguageCode } from "@/entities/docs";
import {
  isVideoExclusive,
  resolveVideoProvider,
  useVideoPlayback,
  withVideoPlaybackParams,
  type VideoPlaybackElement,
} from "@/features/video-playback";
import { usePageOrigin } from "@/shared/lib/use-page-origin";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { resolveCaptionsTrackProps } from "./captions-track";
import { CardInsideDescription, CardInsideTitle } from "./card-inside-text";
import { resolveContentHeaderText } from "./content-header-text";
import { toContainerWrapperProps, type RouteContainerFrameProps } from "./container-wrapper-props";
import styles from "../../docs-shell.module.css";

/** Stable hook for E2E: the YouTube player replaces the iframe title with the video name. */
const ROUTE_VIDEO_TEST_ID = "route-video";
const EMBED_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

interface VideoContainerProps extends RouteContainerFrameProps {
  videoType: string;
  pathVideo: string;
  language: LanguageCode;
  isDarkMode?: boolean;
  /** `site.mediaExclusivePlayback`: this video and the radio/audio tracks never sound together. */
  mediaExclusivePlayback?: boolean;
  /** When true, hide title and description - e.g. in URL fullscreen overlay */
  hideTitleDescription?: boolean;
}

interface MediaElementProps {
  type: string;
  src: string;
  muted: boolean;
  captions: ReturnType<typeof resolveCaptionsTrackProps>;
  attach: (element: VideoPlaybackElement | null) => void;
}

function MediaElement({ type, src, muted, captions, attach }: Readonly<MediaElementProps>) {
  if (isNativeAudio(type) || isNativeVideo(type)) {
    const NativeMedia = isNativeAudio(type) ? "audio" : "video";
    return (
      <NativeMedia
        ref={attach}
        data-testid={ROUTE_VIDEO_TEST_ID}
        controls
        muted={muted}
        className={styles.videoNative}
        src={src}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <track kind="captions" {...captions} />
        Your browser does not support the {NativeMedia} element.
      </NativeMedia>
    );
  }
  return (
    <iframe
      ref={attach}
      data-testid={ROUTE_VIDEO_TEST_ID}
      title="Video embed"
      className={styles.videoIframe}
      src={src}
      allow={EMBED_ALLOW}
      allowFullScreen
    />
  );
}

export function VideoContainer(props: Readonly<VideoContainerProps>) {
  const { videoType, pathVideo, language, config, isDarkMode = false, mediaExclusivePlayback, hideTitleDescription = false } = props;
  const type = String(videoType).toLowerCase();
  const provider = resolveVideoProvider(type);
  const muted = config?.video?.muted === true;
  const origin = usePageOrigin();
  const embedUrl = withVideoPlaybackParams(getEmbedUrl(videoType, pathVideo, language), { provider, muted, origin });
  const mediaRef = useRef<VideoPlaybackElement | null>(null);
  const attachMedia = useCallback((element: VideoPlaybackElement | null) => {
    mediaRef.current = element;
  }, []);
  useVideoPlayback(mediaRef, {
    provider,
    src: embedUrl,
    exclusive: isVideoExclusive({ siteExclusive: mediaExclusivePlayback, muted }),
  });
  const header = resolveContentHeaderText(hideTitleDescription ? undefined : config, language, isDarkMode);

  return (
    <ContentContainerWrapper {...toContainerWrapperProps(props)}>
      <article className={styles.card}>
        <CardInsideTitle header={header} />
        <div className={styles.videoWrapper}>
          <MediaElement
            type={type}
            src={embedUrl}
            muted={muted}
            captions={resolveCaptionsTrackProps(config?.video?.captions, language)}
            attach={attachMedia}
          />
        </div>
        <CardInsideDescription header={header} />
      </article>
    </ContentContainerWrapper>
  );
}
