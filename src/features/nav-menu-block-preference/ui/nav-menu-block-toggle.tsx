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

export function NavMenuBlockToggle({
  blockMenuOnNav,
  onToggle,
  activeIcon,
  inactiveIcon,
  labelActive,
  labelInactive,
  className,
}: NavMenuBlockToggleProps) {
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
      {icon.useReactIcon ? (
        <span style={icon.reactIconStyle}>
          <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} />
        </span>
      ) : icon.iconImage ? (
        <Image
          src={icon.iconImage}
          alt=""
          width={icon.iconImgWidth}
          height={icon.iconImgHeight}
          unoptimized
        />
      ) : (
        <ReactIconByTag tag={icon.reactIconTag} style={icon.reactIconStyle} />
      )}
    </button>
  );
}
