import type { Vehicle } from './vehicle';
import type { Scene } from './scene';
import type { CompositionSettings, WatermarkSettings } from './composition';
import type { ExportPresetId } from './export';

/**
 * The full offline pipeline a generation runs through, in order.
 * SEGMENTATION -> MASK -> VEHICLE PROTECTION -> BACKGROUND GENERATION ->
 * COMPOSITION -> LIGHTING MATCH -> COLOR GRADE -> UPSCALE -> EXPORT
 */
export type GenerationStage =
  | 'analyzing_vehicle'
  | 'protecting_identity'
  | 'building_scene'
  | 'matching_lighting'
  | 'applying_finish'
  | 'preparing_output';

export const GENERATION_STAGE_LABEL_ES: Record<GenerationStage, string> = {
  analyzing_vehicle: 'Analizando vehículo...',
  protecting_identity: 'Protegiendo características originales...',
  building_scene: 'Construyendo escenario...',
  matching_lighting: 'Adaptando iluminación...',
  applying_finish: 'Aplicando acabado COR...',
  preparing_output: 'Preparando imagen final...',
};

export interface GenerationRequest {
  vehicle: Vehicle;
  scene: Scene;
  composition: CompositionSettings;
  watermark: WatermarkSettings;
  exportPresetId: ExportPresetId;
  vehicleLockEnabled: boolean;
}

/** Conceptual protection check comparing the generated vehicle region to the source. */
export interface VehicleIntegrityReport {
  passed: boolean;
  /** Regions where the AI may have deviated from the protected reference. */
  flaggedAttributes: Array<
    'rims' | 'headlights' | 'silhouette' | 'color' | 'body' | 'badges' | 'proportions'
  >;
  message?: string;
}

export interface GenerationResult {
  id: string;
  requestSnapshot: GenerationRequest;
  resultImageUri: string;
  integrityReport: VehicleIntegrityReport;
  createdAt: string;
}

export interface GenerationProgressEvent {
  stage: GenerationStage;
  progress: number; // 0-1
}
