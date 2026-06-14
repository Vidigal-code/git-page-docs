import Image from "next/image";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import styles from "../docs-shell.module.css";

interface DocsShellHeaderProps {
  headerName: string;
  iconImage: string | undefined;
  useReactHeaderIcon: boolean;
  reactHeaderIconTag: string | undefined;
  headerReactIconStyle: React.CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
  menuOpen: boolean;
  menuOpenLabel: string;
  menuCloseLabel: string;
  onToggleMenu: () => void;
  activeLayoutMode: "dark" | "light" | undefined;
  navMenuConfig: NavMenuConfig;
  controls: React.ReactNode;
}

export function DocsShellHeader({
  headerName,
  iconImage,
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  iconImgWidth,
  iconImgHeight,
  menuOpen,
  menuOpenLabel,
  menuCloseLabel,
  onToggleMenu,
  activeLayoutMode,
  navMenuConfig,
  controls,
}: DocsShellHeaderProps) {
  const menuToggleIcon = menuOpen
    ? navMenuConfig.navMenuMobileCloseIcon
    : navMenuConfig.navMenuMobileOpenIcon;
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          {useReactHeaderIcon ? (
            <span className={styles.headerReactIcon} style={headerReactIconStyle}>
              <ReactIconByTag
                tag={reactHeaderIconTag}
                fallback={activeLayoutMode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
              />
            </span>
          ) : iconImage ? (
            <Image
              src={iconImage}
              alt={headerName}
              width={iconImgWidth}
              height={iconImgHeight}
              className={styles.headerIcon}
              unoptimized
            />
          ) : null}
          <strong>{headerName}</strong>
          <button
            className={`${styles.button} ${styles.mobileToggle}`}
            onClick={onToggleMenu}
            aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
            title={menuOpen ? menuCloseLabel : menuOpenLabel}
          >
            {menuToggleIcon.useReactIcon ? (
              <span style={menuToggleIcon.reactIconStyle}>
                <ReactIconByTag tag={menuToggleIcon.reactIconTag} style={menuToggleIcon.reactIconStyle} />
              </span>
            ) : menuToggleIcon.iconImage ? (
              <Image
                src={menuToggleIcon.iconImage}
                alt=""
                width={menuToggleIcon.iconImgWidth}
                height={menuToggleIcon.iconImgHeight}
                unoptimized
              />
            ) : (
              menuOpen ? "✕" : "☰"
            )}
          </button>
        </div>

        <div className={styles.headerRight}>{controls}</div>
      </div>
    </header>
  );
}
