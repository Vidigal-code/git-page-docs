import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";

interface ThemeModeToggleProps {
  isDarkMode: boolean;
  canToggle: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
}

export function ThemeModeToggle({ isDarkMode, canToggle, label, onToggle, className }: ThemeModeToggleProps) {
  if (!canToggle) {
    return null;
  }
  return (
    <button className={className} onClick={onToggle} aria-label={label} title={label}>
      {isDarkMode ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
    </button>
  );
}
