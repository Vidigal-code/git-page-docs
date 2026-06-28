export interface SourceViewerRoute {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface SourceTreeEntry {
  path: string;
  name: string;
  type: "tree" | "blob";
  size?: number;
}

export interface SourceFileContent {
  path: string;
  content: string;
}

export interface SourceViewerRepository {
  owner: string;
  repo: string;
  branch: string;
  entries: SourceTreeEntry[];
}
