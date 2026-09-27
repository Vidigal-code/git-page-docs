import Image from "next/image";
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

/** Configured react icon, then image, then the react icon resolver's own fallback. */
function renderToggleIcon(icon: ResolvedNavMenuIconConfig) {
  if (icon.useReactIcon) {
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} />
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
  return <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} />;
}

export function NavMenuBlockToggle({
  blockMenuOnNav,
  onToggle,
  activeIcon,
  inactiveIcon,
  labelActive,
  labelInactive,
  className,
}: Readonly<NavMenuBlockToggleProps>) {
  const icon = blockMenuOnNav ? activeIcon : inactiveIcon;
  const label = blockMenuOnNav ? labelActive : labelInactive;

  return (
    <button
      className={className}
      onClick={onToggle}
      aria-label={label}
      title={label}
      type="button"
    >
      {renderToggleIcon(icon)}
    </button>
  );
}
