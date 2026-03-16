export interface VersionEntry {
  id: string;
  path: string;
  PathConfig?: string;
  ProjectLink?: string;
  PreviewProject?: string;
  UpdateDate?: string;
  branch?: string;
  release?: string;
  commit?: string;
}

export interface VersionControlConfig {
  versions: VersionEntry[];
}
