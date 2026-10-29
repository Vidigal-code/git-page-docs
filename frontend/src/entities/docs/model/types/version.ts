export interface VersionRepositoryLink {
  name: string;
  url: string;
}

export interface VersionEntry {
  id: string;
  path: string;
  PathConfig?: string;
  ProjectLink?: string;
  PreviewProject?: string;
  UpdateDate?: string;
  branch?: string | VersionRepositoryLink[];
  release?: string | VersionRepositoryLink[];
  commit?: string | VersionRepositoryLink[];
  "source-viewer"?: boolean;
  "source-viewer-path"?: string;
}

export interface VersionControlConfig {
  versions: VersionEntry[];
}
