import Image from "next/image";
import type { VersionLinkOption } from "@/entities/docs";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import styles from "../docs-shell.module.css";

export interface DocsShellControlsIconsProps {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  versionLinkOptionsWithLabels: VersionLinkOption[];
  versionLinksLabel: string;
  useReactVersionLinksIcon: boolean;
  versionLinksIconTag: string | undefined;
  versionLinksIconStyle: React.CSSProperties;
  versionLinksIconImage: string | undefined;
  versionLinksIconImgWidth: number;
  versionLinksIconImgHeight: number;
  infoIconImgWidth: number;
  infoIconImgHeight: number;
  previewIconImgWidth: number;
  previewIconImgHeight: number;
  showInfoButton: boolean;
  lastUpdateLabel: string;
  useReactInfoIcon: boolean;
  infoIconTag: string | undefined;
  infoIconStyle: React.CSSProperties;
  infoIconImage: string | undefined;
  showPreviewButton: boolean;
  previewProjectUrl: string;
  useReactPreviewIcon: boolean;
  previewIconTag: string | undefined;
  previewIconStyle: React.CSSProperties;
  previewIconImage: string | undefined;
  onOpenVersionLinksPopup: () => void;
  onOpenInfoPopup: () => void;
}

interface ControlIconSource {
  useReactIcon: boolean;
  tag: string | undefined;
  style: React.CSSProperties;
  image: string | undefined;
  imgWidth: number;
  imgHeight: number;
}

/** The configured image when no react icon is requested, else the react icon slot (which also renders the default tag). */
function renderControlIcon({ useReactIcon, tag, style, image, imgWidth, imgHeight }: ControlIconSource) {
  if (!useReactIcon && image) {
    return <Image src={image} alt="" width={imgWidth} height={imgHeight} className={styles.headerIcon} unoptimized />;
  }
  return <ReactIconByTag tag={tag} style={style} />;
}

export function DocsShellControlsIcons({
  fallbackProjectLink,
  projectLabel,
  useReactProjectLinkIcon,
  projectLinkReactIconTag,
  projectLinkReactIconStyle,
  versionLinkOptionsWithLabels,
  versionLinksLabel,
  useReactVersionLinksIcon,
  versionLinksIconTag,
  versionLinksIconStyle,
  versionLinksIconImage,
  versionLinksIconImgWidth,
  versionLinksIconImgHeight,
  infoIconImgWidth,
  infoIconImgHeight,
  previewIconImgWidth,
  previewIconImgHeight,
  showInfoButton,
  lastUpdateLabel,
  useReactInfoIcon,
  infoIconTag,
  infoIconStyle,
  infoIconImage,
  showPreviewButton,
  previewProjectUrl,
  useReactPreviewIcon,
  previewIconTag,
  previewIconStyle,
  previewIconImage,
  onOpenVersionLinksPopup,
  onOpenInfoPopup,
}: Readonly<DocsShellControlsIconsProps>) {
  return (
    <>
      {fallbackProjectLink && (
        <a
          href={fallbackProjectLink}
          target="_blank"
          rel="noreferrer"
          className={`${styles.button} ${styles.githubLinkButton}`}
          aria-label={projectLabel}
          title={projectLabel}
        >
          {useReactProjectLinkIcon ? (
            <ReactIconByTag tag={projectLinkReactIconTag} style={projectLinkReactIconStyle} />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden className={styles.githubIcon}>
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.72.5.1.68-.22.68-.5 0-.24-.01-.9-.01-1.77-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.93.85.09-.67.35-1.12.64-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.88a9.3 9.3 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.54 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.94-2.33 4.8-4.56 5.06.36.31.68.92.68 1.86 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          )}
        </a>
      )}
      {!!versionLinkOptionsWithLabels.length && (
        <button className={`${styles.button} ${styles.headerIconButton}`} onClick={onOpenVersionLinksPopup} aria-label={versionLinksLabel} title={versionLinksLabel}>
          {renderControlIcon({
            useReactIcon: useReactVersionLinksIcon,
            tag: versionLinksIconTag,
            style: versionLinksIconStyle,
            image: versionLinksIconImage,
            imgWidth: versionLinksIconImgWidth,
            imgHeight: versionLinksIconImgHeight,
          })}
        </button>
      )}
      {showInfoButton && (
        <button className={`${styles.button} ${styles.headerIconButton}`} onClick={onOpenInfoPopup} aria-label={lastUpdateLabel} title={lastUpdateLabel}>
          {renderControlIcon({
            useReactIcon: useReactInfoIcon,
            tag: infoIconTag,
            style: infoIconStyle,
            image: infoIconImage,
            imgWidth: infoIconImgWidth,
            imgHeight: infoIconImgHeight,
          })}
        </button>
      )}
      {showPreviewButton && previewProjectUrl && (
        <a
          href={previewProjectUrl}
          target="_blank"
          rel="noreferrer"
          className={`${styles.button} ${styles.githubLinkButton}`}
          aria-label="Preview"
          title="Preview"
        >
          {renderControlIcon({
            useReactIcon: useReactPreviewIcon,
            tag: previewIconTag,
            style: previewIconStyle,
            image: previewIconImage,
            imgWidth: previewIconImgWidth,
            imgHeight: previewIconImgHeight,
          })}
        </a>
      )}
    </>
  );
}
