import type { AIImageService, AIImageServiceConfig } from './AIImageService';
import { MockAIImageService } from './mock/MockAIImageService';

export * from './AIImageService';
export { MockAIImageService } from './mock/MockAIImageService';

let instance: AIImageService | null = null;

/**
 * Single entry point the app uses to obtain the active AI provider.
 * Today it always returns the mock. Wiring a real provider later is a
 * one-line change here (`case 'remote': return new RemoteAIImageService(config)`).
 */
export function getAIImageService(config: AIImageServiceConfig = { provider: 'mock' }): AIImageService {
  if (instance) return instance;

  switch (config.provider) {
    case 'mock':
    default:
      instance = new MockAIImageService();
      return instance;
  }
}
