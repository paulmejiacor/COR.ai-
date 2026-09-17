import type { Vehicle } from './vehicle';
import type { Scene } from './scene';
import type { GenerationResult } from './generation';

export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  vehicle: Vehicle;
  scene: Scene;
  latestResult?: GenerationResult;
  /** All generations produced for this vehicle, enabling "same vehicle, multiple spots". */
  history: GenerationResult[];
}
