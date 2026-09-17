import type { Project } from '@cor/shared-types';

/**
 * Persistence contract for projects (Mis Proyectos / historial).
 * The in-memory implementation below is swapped for AsyncStorage on-device
 * persistence, then later for a cloud-backed implementation, without any
 * screen code changing — they only ever depend on this interface.
 */
export interface StorageService {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  saveProject(project: Project): Promise<void>;
  duplicateProject(id: string): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
}
