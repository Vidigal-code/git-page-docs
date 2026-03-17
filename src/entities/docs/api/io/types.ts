export interface ConfigLoader {
  loadRootConfig<T>(cwd?: string): Promise<T>;
  resolveConfigPath(cwd?: string): string | null;
}

export interface RemoteFetcher {
  readRemoteText(owner: string, repo: string, relativePath: string): Promise<string | null>;
  readRemoteJsonFromRepo<T>(owner: string, repo: string, relativePath: string): Promise<T | null>;
}

export interface FileReader {
  readLocalText(filePath: string): Promise<string | null>;
}
