export { DocumentationService } from "./doc-generator";
export type { DocKind, GenerateDocInput } from "./doc-generator";
export {
  patchManagedRegion,
  START_MARKER,
  END_MARKER,
} from "./marker-patcher";
export type { PatchResult } from "./marker-patcher";
export { DocUpdater } from "./doc-updater";
export type { ManagedUpdate, UpdateResult } from "./doc-updater";
export {
  providersSection,
  cliCommandsSection,
  devWorkflowSection,
  securityNoteSection,
  CLI_COMMANDS,
} from "./sections";
export type { CommandDoc } from "./sections";
