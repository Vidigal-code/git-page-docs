import { ControlIcon, type ControlIconConfig } from "@/shared/ui/control-icon";
import { FiSearch } from "@/shared/ui/fallback-icons";

interface QuickNavigationTriggerProps {
  icon?: ControlIconConfig;
  label: string;
  onClick: () => void;
  className?: string;
}

export function QuickNavigationTrigger({ label, onClick, className, icon }: Readonly<QuickNavigationTriggerProps>) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label} title={label} aria-keyshortcuts="Control+k Meta+k">
      {icon ? <ControlIcon icon={icon} fallback={<FiSearch aria-hidden />} /> : label}
    </button>
  );
}
