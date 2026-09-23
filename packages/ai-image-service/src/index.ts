import type { AIImageService, AIImageServiceConfig } from './AIImageService';
import { MockAIImageService } from './mock/MockAIImageService';
import { FalKontextAIImageService } from './fal/FalKontextAIImageService';

export * from './AIImageService';
export { MockAIImageService } from './mock/MockAIImageService';
export { FalKontextAIImageService } from './fal/FalKontextAIImageService';

let instance: AIImageService | null = null;
// Incluye la apiKey (no solo el provider) para que guardar una clave nueva
// desde Configuración, en tiempo de ejecución, no siga devolviendo una
// instancia vieja con la clave anterior horneada en el constructor.
let instanceCacheKey: string | null = null;

/**
 * Single entry point the app uses to obtain the active AI provider.
 * Wiring a real provider is a one-line change here — the rest of the app
 * only ever talks to the `AIImageService` interface.
 */
export function getAIImageService(config: AIImageServiceConfig = { provider: 'mock' }): AIImageService {
  const cacheKey = config.provider === 'remote' ? `remote:${config.apiKey}` : 'mock';
  if (instance && instanceCacheKey === cacheKey) return instance;

  switch (config.provider) {
    case 'remote':
      if (!config.apiKey) {
        throw new Error('Falta apiKey para el proveedor de IA real (fal.ai).');
      }
      instance = new FalKontextAIImageService(config.apiKey);
      instanceCacheKey = cacheKey;
      return instance;
    case 'mock':
    default:
      instance = new MockAIImageService();
      instanceCacheKey = cacheKey;
      return instance;
  }
}
