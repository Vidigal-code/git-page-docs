import type { AiProviderId, ModelDescriptor, ModelRegistry } from "../ports/ai";
import { PROVIDER_CATALOG } from "./catalog";

/** Model registry backed by the static provider catalog. */
export class CatalogModelRegistry implements ModelRegistry {
  list(providerId: AiProviderId): readonly ModelDescriptor[] {
    return PROVIDER_CATALOG[providerId]?.models ?? [];
  }

  defaultModel(providerId: AiProviderId): string | undefined {
    return PROVIDER_CATALOG[providerId]?.defaultModel;
  }
}
