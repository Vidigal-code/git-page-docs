import type { VersionEntry } from "@/entities/docs/model/types";

interface VersionSelectorProps {
  versions: VersionEntry[];
  value: string;
  onChange: (versionId: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function VersionSelector({ versions, value, onChange, className, ariaLabel }: VersionSelectorProps) {
  return (
    <select className={className} value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel ?? "Version"}>
      {versions.map((version) => (
        <option key={version.id} value={version.id}>
          {version.id}
        </option>
      ))}
    </select>
  );
}
