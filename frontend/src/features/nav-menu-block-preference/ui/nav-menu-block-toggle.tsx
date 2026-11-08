import Image from "next/image";
import type { ReactElement, ReactNode } from "react";
import { FiUnlock } from "@react-icons/all-files/fi/FiUnlock";
import { FiLock } from "@/shared/ui/fallback-icons";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

interface NavMenuBlockToggleProps {
  blockMenuOnNav: boolean;
  onToggle: () => void;
  activeIcon: ResolvedNavMenuIconConfig;
  inactiveIcon: ResolvedNavMenuIconConfig;
  labelActive: string;
  labelInactive: string;
  className?: string;
}

function renderToggleIcon(icon: ResolvedNavMenuIconConfig, fallback: ReactNode): ReactElement {
  if (icon.useReactIcon) {
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} fallback={fallback} />
      </span>
    );
  }
  if (icon.iconImage) {
    return (
      <Image
        src={icon.iconImage}
        alt=""
        width={icon.iconImgWidth}
        height={icon.iconImgHeight}
        unoptimized
      />
    );
  }
  return <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} fallback={fallback} />;
}

export function NavMenuBlockToggle({
  blockMenuOnNav,
  onToggle,
  activeIcon,
  inactiveIcon,
  labelActive,
  labelInactive,
  className,
}: Readonly<NavMenuBlockToggleProps>): ReactElement {
  const icon = blockMenuOnNav ? activeIcon : inactiveIcon;
  const label = blockMenuOnNav ? labelActive : labelInactive;
  const FallbackIcon = blockMenuOnNav ? FiLock : FiUnlock;

  return (
    <button
      className={className}
      onClick={onToggle}
      aria-label={label}
      title={label}
      type="button"
    >
      {renderToggleIcon(icon, <FallbackIcon aria-hidden style={icon.reactIconStyle} />)}
    </button>
  );
}
