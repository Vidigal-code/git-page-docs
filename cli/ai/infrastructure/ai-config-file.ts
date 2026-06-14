import fs from "node:fs/promises";
import path from "node:path";
import {
  AI_CLI_CONFIG_FILENAME,
  type AiCliConfig,
} from "../core/models/ai-cli-config";

export class AiConfigFileRepository {
  constructor(private readonly cwd: string = process.cwd()) {}

  getConfigPath(): string {
    return path.join(this.cwd, AI_CLI_CONFIG_FILENAME);
  }

  async read(): Promise<AiCliConfig | null> {
    const configPath = this.getConfigPath();
    try {
      const content = await fs.readFile(configPath, "utf-8");
      const parsed = JSON.parse(content) as Partial<AiCliConfig>;
      if (!parsed || parsed.version !== 1 || !parsed.ai) return null;
      return parsed as AiCliConfig;
    } catch {
      return null;
    }
  }

  async write(config: AiCliConfig): Promise<void> {
    const configPath = this.getConfigPath();
    const data = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, `${data}\n`, "utf-8");
  }
}
