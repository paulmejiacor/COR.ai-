import { getAIImageService, type AIImageService } from '@cor/ai-image-service';

/**
 * `EXPO_PUBLIC_FAL_KEY` viene de `.env.local` (nunca subido al repositorio —
 * ver .gitignore). Si no está presente, la app sigue funcionando con el
 * proveedor mock, igual que en todas las fases anteriores.
 */
const FAL_KEY = process.env.EXPO_PUBLIC_FAL_KEY;

export function resolveAIImageService(): AIImageService {
  if (FAL_KEY) {
    return getAIImageService({ provider: 'remote', apiKey: FAL_KEY });
  }
  return getAIImageService({ provider: 'mock' });
}
