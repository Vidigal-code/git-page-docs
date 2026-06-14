import type { AIProvider, AiProviderId, ProviderFactory } from "../ports/ai";
import type { InMemoryProviderRegistry } from "./registry";
import { ProviderError } from "../errors/app-error";

/** Creates provider strategies from the registry (Factory pattern). */
export class RegistryProviderFactory implements ProviderFactory {
  constructor(private readonly registry: InMemoryProviderRegistry) {}

  create(id: AiProviderId): AIProvider {
    const registration = this.registry.get(id);
    if (!registration) throw new ProviderError(`Unknown AI provider: ${id}`, { details: { provider: id } });
    return registration.create();
  }
}
