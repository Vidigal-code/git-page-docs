"use client";

import type { ReactNode } from "react";
import { ContentContainerWrapper, type ContentContainerChildren } from "./content-container-wrapper";
import { CardInsideDescription, CardInsideTitle } from "./card-inside-text";
import type { ContentHeaderText } from "./content-header-text";
import { toContainerWrapperProps, type RouteContainerFrameProps } from "./container-wrapper-props";
import type { FullscreenAlign } from "./fullscreen-alignment";
import styles from "../../docs-shell.module.css";

interface RouteContentFrameProps {
  /** The container's own props: fullscreen, labels, margins and browse navigation. */
  frame: RouteContainerFrameProps;
  header?: ReactNode;
  fullscreenAlign?: FullscreenAlign;
  children: ContentContainerChildren;
}

/** Frame shared by every route content container (fullscreen, margins, browse navigation). */
export function RouteContentFrame({ frame, header, fullscreenAlign, children }: Readonly<RouteContentFrameProps>) {
  return (
    <ContentContainerWrapper header={header} fullscreenAlign={fullscreenAlign} {...toContainerWrapperProps(frame)}>
      {children}
    </ContentContainerWrapper>
  );
}

interface MediaCardProps {
  frame: RouteContainerFrameProps;
  header: ContentHeaderText;
  fullscreenAlign?: FullscreenAlign;
  /** The player (video, embed or audio controls). */
  children: ReactNode;
}

/** A media route (video, audio): the player in a card, between the route title and description. */
export function MediaCard({ frame, header, fullscreenAlign, children }: Readonly<MediaCardProps>) {
  return (
    <RouteContentFrame frame={frame} fullscreenAlign={fullscreenAlign}>
      <article className={styles.card}>
        <CardInsideTitle header={header} />
        {children}
        <CardInsideDescription header={header} />
      </article>
    </RouteContentFrame>
  );
}
