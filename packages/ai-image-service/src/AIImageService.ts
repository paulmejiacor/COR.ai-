import type {
  SourcePhoto,
  VehicleMask,
  Scene,
  GenerationRequest,
  GenerationResult,
  GenerationProgressEvent,
  VehicleIntegrityReport,
  LicensePlateDetection,
} from '@cor/shared-types';

export interface DetectVehicleResult {
  mask: VehicleMask;
}

/**
 * Provider-agnostic contract for every AI-backed operation in the app.
 *
 * This is the ONLY surface the rest of the app talks to. Swapping the
 * underlying provider(s) — a segmentation model, an image-generation model,
 * a relighting/upscaling model, possibly a different one for each — means
 * writing a new class that implements this interface, then changing the
 * factory in `index.ts`. No screen, navigation, or state code has to change.
 *
 * Pipeline this interface is designed around:
 * source photo -> segmentation -> mask -> vehicle protection ->
 * background generation -> composition -> lighting match -> color grade ->
 * upscale -> export.
 */
export interface AIImageService {
  /** Segmentation: isolates the vehicle from the background of a source photo. */
  detectVehicle(photo: SourcePhoto): Promise<DetectVehicleResult>;

  /**
   * Turns a short, plain-language idea into a precise visual description
   * for the generation engine (COR Prompt Assist).
   */
  assistPrompt(rawIdea: string): Promise<string>;

  /**
   * Runs the full background-generation + composition + lighting-match +
   * color-grade + upscale pipeline with the vehicle held fixed (Vehicle Lock).
   * Emits progress through `onProgress` as each stage completes.
   */
  generate(
    request: GenerationRequest,
    onProgress?: (event: GenerationProgressEvent) => void
  ): Promise<GenerationResult>;

  /**
   * Conceptual protection check: compares the vehicle region of a result
   * against the original reference and flags likely identity drift.
   */
  checkVehicleIntegrity(result: GenerationResult): Promise<VehicleIntegrityReport>;

  /**
   * Ubica la placa (que la IA deja en blanco — ver buildEditPrompt) en una
   * foto ya generada, para colocar el logo real de COR ahí automáticamente
   * en vez de que el usuario tenga que arrastrarlo a mano. `null` = no se
   * encontró con suficiente confianza; quien llama debe caer de vuelta al
   * posicionamiento manual (centrado) en ese caso, nunca bloquear el flujo.
   */
  detectLicensePlate(imageUri: string): Promise<LicensePlateDetection | null>;
}

export interface AIImageServiceConfig {
  provider: 'mock' | 'remote';
  /** Base URL for a future remote provider; unused by the mock provider. */
  remoteBaseUrl?: string;
  /** Requerido cuando provider es 'remote' — clave de fal.ai (FLUX.1 Kontext). */
  apiKey?: string;
}
