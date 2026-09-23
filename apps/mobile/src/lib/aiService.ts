import { getAIImageService, type AIImageService } from '@cor/ai-image-service';
import { getCachedFalKeyOverride, loadStoredFalKey } from './apiKeyStore';

/**
 * `EXPO_PUBLIC_FAL_KEY` viene de `.env.local` (nunca subido al repositorio —
 * ver .gitignore). Si no está presente, o si Metro no logró cargarla por lo
 * que sea (típicamente un problema de entorno en Windows), la clave guardada
 * desde la pantalla de Configuración sirve de respaldo — se lee de
 * AsyncStorage, no depende de reiniciar el bundler.
 */
const ENV_FAL_KEY = process.env.EXPO_PUBLIC_FAL_KEY;

// Se dispara una sola vez al importar este módulo (ver App.tsx, que espera a
// que resuelva antes de montar la navegación) para que el valor guardado ya
// esté en memoria antes de que cualquier pantalla llame a estas funciones.
void loadStoredFalKey();

function currentFalKey(): string | undefined {
  return getCachedFalKeyOverride() || ENV_FAL_KEY || undefined;
}

/**
 * Si esto es `false`, `generate()` devuelve la misma foto de entrada sin
 * ningún cambio (ver `MockAIImageService`) — las pantallas de Procesando y
 * Resultado usan esto para no dejar que un resultado "demo" pase por real
 * sin avisar. Es una función (no una constante) porque la clave guardada
 * puede cambiar en cualquier momento desde Configuración, sin reiniciar.
 */
export function hasRealAIProvider(): boolean {
  return Boolean(currentFalKey());
}

export function resolveAIImageService(): AIImageService {
  const key = currentFalKey();
  if (key) {
    return getAIImageService({ provider: 'remote', apiKey: key });
  }
  return getAIImageService({ provider: 'mock' });
}
