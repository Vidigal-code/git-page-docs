import { isNativeAudio, isNativeVideo } from "@/shared/lib/media-types";
import type { LanguageCode } from "../../model/types/site";
import { resolveDocumentUrl, type DocumentUrlContext } from "./resolve-document-url";

export function resolveMediaPaths(
  paths: Record<LanguageCode, string>,
  types: Record<LanguageCode, string>,
  context: DocumentUrlContext,
): Record<LanguageCode, string> {
  return Object.fromEntries(Object.entries(paths).map(([language, value]) => [
    language,
    isNativeAudio(types[language]) || isNativeVideo(types[language]) ? resolveDocumentUrl(value, context) : value,
  ]));
}
