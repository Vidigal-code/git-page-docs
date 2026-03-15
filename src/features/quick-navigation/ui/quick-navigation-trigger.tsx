interface QuickNavigationTriggerProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function QuickNavigationTrigger({ label, onClick, className }: QuickNavigationTriggerProps) {
  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
}
