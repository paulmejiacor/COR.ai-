import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cor/fal-api-key-override';

/**
 * `undefined` = todavía no se cargó (justo al abrir la app).
 * `null` = se cargó y no había nada guardado (o AsyncStorage no está
 * disponible en este entorno — ver más abajo).
 * `string` = clave activa para esta sesión.
 *
 * Existe porque `EXPO_PUBLIC_FAL_KEY` depende de que Metro la haya inlineado al
 * arrancar — eso puede fallar por caché vieja, procesos colgados o un
 * `.env.local` mal guardado, sin ningún error visible en la app. Esta clave
 * es la vía de respaldo: se puede pegar y probar sin volver a la terminal.
 *
 * AsyncStorage puede no tener su módulo nativo disponible en Expo Go (pide
 * un development build) — en ese caso el guardado no sobrevive a cerrar la
 * app, pero la clave sigue funcionando para la sesión actual, que es lo que
 * importa para poder probar ahora mismo. Ninguna llamada de este módulo
 * debe poder rechazar la promesa: si falla el guardado persistente, se
 * sigue igual con el valor en memoria.
 */
let cached: string | null | undefined;

export async function loadStoredFalKey(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    cached = stored && stored.trim() ? stored.trim() : null;
  } catch {
    cached = null;
  }
  return cached;
}

export async function setStoredFalKey(key: string | null): Promise<void> {
  cached = key && key.trim() ? key.trim() : null;
  try {
    if (cached) {
      await AsyncStorage.setItem(STORAGE_KEY, cached);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Sigue funcionando en memoria para esta sesión aunque no se pueda persistir.
  }
}

export function getCachedFalKeyOverride(): string | null {
  return cached ?? null;
}
