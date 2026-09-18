import type { StorageService } from './StorageService';
import { MemoryStorageService } from './MemoryStorageService';
import { AsyncStorageService } from './AsyncStorageService';

export * from './StorageService';
export { MemoryStorageService } from './MemoryStorageService';
export { AsyncStorageService } from './AsyncStorageService';
export * from './CustomSceneStorage';

let instance: StorageService | null = null;

/** Persistencia real en el dispositivo — el historial sobrevive a cerrar la app. */
export function getStorageService(): StorageService {
  if (!instance) instance = new AsyncStorageService();
  return instance;
}
