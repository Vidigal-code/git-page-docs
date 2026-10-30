"use client";

import type { ReactNode } from "react";
import { ContentContainerWrapper, type ContentContainerChildren } from "./content-container-wrapper";
import { PersistentContentFrame } from "./persistent-content-frame";
import { MEDIA_METADATA_LAYOUT, resolveRouteMetadataLayout, RouteMetadata, type MetadataSlot } from "./route-metadata";
import type { ContentHeaderText } from "./content-header-text";
import { toContainerWrapperProps, type RouteContainerFrameProps } from "./container-wrapper-props";
import type { FullscreenAlign } from "./fullscreen-alignment";
import styles from "../../docs-shell.module.css";

interface RouteContentFrameProps {
  /** The container's own props: fullscreen, labels, margins and browse navigation. */
  frame: RouteContainerFrameProps;
  header?: ReactNode;
  footer?: ReactNode;
  fullscreenAlign?: FullscreenAlign;
  fullscreenContent?: "persistent";
  children: ContentContainerChildren;
}

/** Frame shared by every route content container (fullscreen, margins, browse navigation). */
export function RouteContentFrame({ frame, header, footer, fullscreenAlign, fullscreenContent, children }: Readonly<RouteContentFrameProps>) {
  if (fullscreenContent === "persistent" && typeof children !== "function") {
    return <PersistentContentFrame header={header} footer={footer} fullscreenAlign={fullscreenAlign} {...toContainerWrapperProps(frame)}>
      {children}
    </PersistentContentFrame>;
  }
  return (
    <ContentContainerWrapper header={header} footer={footer} fullscreenAlign={fullscreenAlign} {...toContainerWrapperProps(frame)}>
      {children}
    </ContentContainerWrapper>
  );
}

interface MediaCardProps {
  frame: RouteContainerFrameProps;
  header: ContentHeaderText;
  fullscreenAlign?: FullscreenAlign;
  fullscreenContent?: "persistent";
  /** The player (video, embed or audio controls). */
  children: ReactNode;
}

/** A media route with independently positioned title and description around its content. */
export function MediaCard({ frame, header, fullscreenAlign, fullscreenContent, children }: Readonly<MediaCardProps>) {
  const layout = resolveRouteMetadataLayout(frame.config?.layout, MEDIA_METADATA_LAYOUT);
  const metadata = (slot: MetadataSlot) => <RouteMetadata header={header} config={frame.config} layout={layout} slot={slot} />;
  return (
    <RouteContentFrame frame={frame} fullscreenAlign={fullscreenAlign} fullscreenContent={fullscreenContent}
      header={metadata({ placement: "outside", position: "before" })}
      footer={metadata({ placement: "outside", position: "after" })}>
      <article className={styles.card}>
        {metadata({ placement: "inside", position: "before" })}
        {children}
        {metadata({ placement: "inside", position: "after" })}
      </article>
    </RouteContentFrame>
  );
}
