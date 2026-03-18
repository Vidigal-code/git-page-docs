import path from "node:path";
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { writeConfigOnlyOutput, writeText } from "../../runtime/output.mjs";
import { writeHomeFiles } from "../../home/home-file-writer.mjs";
import { logInfo, logSuccess } from "../../ui/logger.mjs";

function ensureDirEmpty(root, relativeDir) {
  const target = path.join(root, relativeDir);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  cpSync(src, dest, { recursive: true, force: true });
}

function runNextBuild(root, env) {
  execSync("npx next build", { cwd: root, env, stdio: "inherit" });
}

export function createHomeRuntime() {
  return {
    joinPath: (...parts) => path.join(...parts),
    ensureDirEmpty,
    copyRecursive,
    readDirNames: (absolutePath) => readdirSync(absolutePath),
    existsPath: existsSync,
    runNextBuild,
    writeConfigOnlyOutput,
    writeHomeFiles,
    writeText,
    logSuccess,
    logInfo,
  };
}
