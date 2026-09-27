import { FaBars, IoMdClose } from "@/shared/ui/fallback-icons";
import type { NavMenuConfig } from "../model/use-docs-shell-config";
import { ConfiguredIcon, DocsShellBrandIcon } from "./docs-shell-icon";
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
}: Readonly<DocsShellHeaderProps>) {
  const menuToggleIcon = menuOpen
    ? navMenuConfig.navMenuMobileCloseIcon
    : navMenuConfig.navMenuMobileOpenIcon;
  const menuToggleLabel = menuOpen ? menuCloseLabel : menuOpenLabel;
  const menuToggleFallback = menuOpen ? <IoMdClose aria-hidden /> : <FaBars aria-hidden />;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <DocsShellBrandIcon
            useReactIcon={useReactHeaderIcon}
            reactIconTag={reactHeaderIconTag}
            reactIconStyle={headerReactIconStyle}
            activeLayoutMode={activeLayoutMode}
            iconImage={iconImage}
            iconImgWidth={iconImgWidth}
            iconImgHeight={iconImgHeight}
            alt={headerName}
            reactIconClassName={styles.headerReactIcon}
            imageClassName={styles.headerIcon}
          />
          <strong className={styles.headerTitle}>{headerName}</strong>
          <button
            className={`${styles.button} ${styles.mobileToggle}`}
            onClick={onToggleMenu}
            aria-label={menuToggleLabel}
            title={menuToggleLabel}
          >
            <ConfiguredIcon icon={menuToggleIcon} fallback={menuToggleFallback} reactIconFallback={menuToggleFallback} />
          </button>
        </div>

        <div className={styles.headerRight}>{controls}</div>
      </div>
    </header>
  );
}
