import type { AiProviderId, ProviderRegistration, ProviderRegistry } from "../ports/ai";
import { ProviderError } from "../errors/app-error";

/** In-memory provider registry (Registry pattern). */
export class InMemoryProviderRegistry implements ProviderRegistry {
  private readonly registrations = new Map<AiProviderId, ProviderRegistration>();

  register(registration: ProviderRegistration): void {
    this.registrations.set(registration.id, registration);
  }

  has(id: AiProviderId): boolean {
    return this.registrations.has(id);
  }

  get(id: AiProviderId): ProviderRegistration | undefined {
    return this.registrations.get(id);
  }

  list(): readonly ProviderRegistration[] {
    return [...this.registrations.values()];
  }

  require(id: AiProviderId): ProviderRegistration {
    const found = this.registrations.get(id);
    if (!found) throw new ProviderError(`Unknown AI provider: ${id}`, { details: { provider: id } });
    return found;
  }
}
