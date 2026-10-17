import type { ContentMetadataLayout, ContentMetadataPlacement, ContentTypeRouteConfig } from "@/entities/docs";
import { CardInsideDescription, CardInsideTitle } from "./card-inside-text";
import { ContentHeaderTextBlock } from "./content-header-block";
import type { ContentHeaderText } from "./content-header-text";

export type MetadataSlot = Required<ContentMetadataPlacement>;
export interface ResolvedMetadataLayout {
  title: MetadataSlot;
  description: MetadataSlot;
}

export const MEDIA_METADATA_LAYOUT: ResolvedMetadataLayout = {
  title: { placement: "inside", position: "before" },
  description: { placement: "inside", position: "after" },
};
export const DOCUMENT_METADATA_LAYOUT: ResolvedMetadataLayout = {
  title: { placement: "outside", position: "before" },
  description: { placement: "outside", position: "before" },
};

function resolveSlot(value: ContentMetadataPlacement | undefined, fallback: MetadataSlot): MetadataSlot {
  return {
    placement: value?.placement === "inside" || value?.placement === "outside" ? value.placement : fallback.placement,
    position: value?.position === "before" || value?.position === "after" ? value.position : fallback.position,
  };
}

export function resolveRouteMetadataLayout(layout: ContentMetadataLayout | undefined, fallback: ResolvedMetadataLayout): ResolvedMetadataLayout {
  return { title: resolveSlot(layout?.title, fallback.title), description: resolveSlot(layout?.description, fallback.description) };
}

interface RouteMetadataProps {
  header: ContentHeaderText;
  config?: ContentTypeRouteConfig;
  layout: ResolvedMetadataLayout;
  slot: MetadataSlot;
}

export function RouteMetadata({ header, config, layout, slot }: Readonly<RouteMetadataProps>) {
  const matches = (placement: MetadataSlot): boolean => placement.placement === slot.placement && placement.position === slot.position;
  const selected = { ...header, showTitle: header.showTitle && matches(layout.title), showDescription: header.showDescription && matches(layout.description) };
  if (slot.placement === "outside") return <ContentHeaderTextBlock header={selected} config={config} />;
  return <><CardInsideTitle header={selected} config={config} /><CardInsideDescription header={selected} config={config} /></>;
}
