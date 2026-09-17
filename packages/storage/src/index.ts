import type { StorageService } from './StorageService';
import { MemoryStorageService } from './MemoryStorageService';

export * from './StorageService';
export { MemoryStorageService } from './MemoryStorageService';

let instance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!instance) instance = new MemoryStorageService();
  return instance;
}
