import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cor/custom-scenes';

/** Escenario agregado por el usuario ("+ Agregar escenario"), persistido en el dispositivo. */
export interface CustomScene {
  id: string;
  name: string;
  /** URI local permanente (copiada al directorio de documentos de la app, no el cache del picker). */
  uri: string;
  createdAt: string;
}

async function readAll(): Promise<CustomScene[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CustomScene[];
  } catch {
    return [];
  }
}

async function writeAll(scenes: CustomScene[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
}

export async function listCustomScenes(): Promise<CustomScene[]> {
  const scenes = await readAll();
  return scenes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addCustomScene(scene: CustomScene): Promise<void> {
  const scenes = await readAll();
  scenes.push(scene);
  await writeAll(scenes);
}

export async function deleteCustomScene(id: string): Promise<void> {
  const scenes = await readAll();
  await writeAll(scenes.filter((s) => s.id !== id));
}
