import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project } from '@cor/shared-types';
import type { StorageService } from './StorageService';

const STORAGE_KEY = '@cor/projects';

async function readAll(): Promise<Project[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

async function writeAll(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/** Persiste los proyectos en el dispositivo (AsyncStorage) — sobrevive a reinicios de la app. */
export class AsyncStorageService implements StorageService {
  async listProjects(): Promise<Project[]> {
    const projects = await readAll();
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getProject(id: string): Promise<Project | undefined> {
    const projects = await readAll();
    return projects.find((p) => p.id === id);
  }

  async saveProject(project: Project): Promise<void> {
    const projects = await readAll();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) projects[index] = project;
    else projects.push(project);
    await writeAll(projects);
  }

  async duplicateProject(id: string): Promise<Project | undefined> {
    const projects = await readAll();
    const original = projects.find((p) => p.id === id);
    if (!original) return undefined;
    const now = new Date().toISOString();
    const copy: Project = {
      ...original,
      id: `${original.id}_copy_${Date.now()}`,
      name: `${original.name} (copia)`,
      createdAt: now,
      updatedAt: now,
    };
    projects.push(copy);
    await writeAll(projects);
    return copy;
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await readAll();
    await writeAll(projects.filter((p) => p.id !== id));
  }
}
