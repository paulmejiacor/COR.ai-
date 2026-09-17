import type { Project } from '@cor/shared-types';
import type { StorageService } from './StorageService';

/** In-memory implementation used for the demo/MVP. */
export class MemoryStorageService implements StorageService {
  private projects = new Map<string, Project>();

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async saveProject(project: Project): Promise<void> {
    this.projects.set(project.id, project);
  }

  async duplicateProject(id: string): Promise<Project | undefined> {
    const original = this.projects.get(id);
    if (!original) return undefined;
    const copy: Project = {
      ...original,
      id: `${original.id}_copy_${Date.now()}`,
      name: `${original.name} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(copy.id, copy);
    return copy;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }
}
