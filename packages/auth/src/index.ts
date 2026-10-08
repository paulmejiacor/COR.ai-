import type { AuthService } from './AuthService';
import { MockAuthService } from './MockAuthService';
import { SupabaseAuthService } from './SupabaseAuthService';

export * from './AuthService';
export { MockAuthService } from './MockAuthService';
export { SupabaseAuthService } from './SupabaseAuthService';

export type AuthServiceConfig = { provider: 'mock' } | { provider: 'supabase'; url: string; anonKey: string };

let instance: AuthService | null = null;
let instanceCacheKey: string | null = null;

/**
 * Único punto de entrada para obtener el proveedor de auth activo —
 * mismo patrón que `getAIImageService` en @cor/ai-image-service.
 */
export function getAuthService(config: AuthServiceConfig = { provider: 'mock' }): AuthService {
  const cacheKey = config.provider === 'supabase' ? `supabase:${config.url}:${config.anonKey}` : 'mock';
  if (instance && instanceCacheKey === cacheKey) return instance;

  switch (config.provider) {
    case 'supabase':
      if (!config.url || !config.anonKey) {
        throw new Error('Falta url o anonKey para el proveedor de cuentas real (Supabase).');
      }
      instance = new SupabaseAuthService(config.url, config.anonKey);
      instanceCacheKey = cacheKey;
      return instance;
    case 'mock':
    default:
      instance = new MockAuthService();
      instanceCacheKey = cacheKey;
      return instance;
  }
}
