import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cor/fal-api-key-override';

/**
 * `undefined` = todavía no se cargó desde AsyncStorage (justo al abrir la app).
 * `null` = se cargó y no había nada guardado.
 * `string` = clave guardada desde la pantalla de Configuración.
 *
 * Existe porque `EXPO_PUBLIC_FAL_KEY` depende de que Metro la haya inlineado al
 * arrancar — en Windows eso puede fallar por caché vieja, procesos colgados o
 * el `.env.local` mal guardado, sin ningún error visible en la app. Esta clave
 * guardada en el dispositivo es la vía de respaldo: se puede pegar y probar
 * sin volver a la terminal.
 */
let cached: string | null | undefined;

export async function loadStoredFalKey(): Promise<string | null> {
  if (cached !== undefined) return cached;
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  cached = stored && stored.trim() ? stored.trim() : null;
  return cached;
}

export async function setStoredFalKey(key: string | null): Promise<void> {
  cached = key && key.trim() ? key.trim() : null;
  if (cached) {
    await AsyncStorage.setItem(STORAGE_KEY, cached);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export function getCachedFalKeyOverride(): string | null {
  return cached ?? null;
}
