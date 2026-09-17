import type {
  SourcePhoto,
  GenerationRequest,
  GenerationResult,
  GenerationProgressEvent,
  GenerationStage,
  VehicleIntegrityReport,
} from '@cor/shared-types';
import type { AIImageService, DetectVehicleResult } from '../AIImageService';

const STAGE_ORDER: GenerationStage[] = [
  'analyzing_vehicle',
  'protecting_identity',
  'building_scene',
  'matching_lighting',
  'applying_finish',
  'preparing_output',
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const PROMPT_MOOD_HINTS: Record<string, string> = {
  elegante: 'polished architectural surfaces, controlled cinematic key light, premium reflections',
  oscuro: 'dark, low-key environment, deep shadows, a single dramatic light source',
  lujo: 'luxury automotive showroom, marble or brushed metal surfaces, high-end retouch finish',
  ciudad: 'modern urban backdrop, clean architectural lines, soft ambient occlusion',
  noche: 'night setting, ambient ground lighting, subtle neon reflections on the paint',
  montaña: 'alpine landscape, golden-hour side light, crisp atmospheric depth',
};

/**
 * Demo-stage implementation of AIImageService.
 *
 * It never calls a real model — it simulates timing, staged progress, and
 * a passthrough "result" so every screen in the app can be built and
 * demoed end-to-end today. Every method signature matches what a real
 * provider will implement, so this class is the only thing that gets
 * replaced when we wire up actual segmentation / generation APIs.
 */
export class MockAIImageService implements AIImageService {
  async detectVehicle(photo: SourcePhoto): Promise<DetectVehicleResult> {
    await delay(900);
    return {
      mask: {
        id: uid('mask'),
        sourcePhotoId: photo.id,
        maskUri: photo.uri,
        previewUri: photo.uri,
        confidence: 0.97,
        edits: [],
        status: 'detected',
      },
    };
  }

  async assistPrompt(rawIdea: string): Promise<string> {
    await delay(500);
    const lower = rawIdea.toLowerCase();
    const hints = Object.entries(PROMPT_MOOD_HINTS)
      .filter(([keyword]) => lower.includes(keyword))
      .map(([, hint]) => hint);

    const base = hints.length > 0 ? hints.join(', ') : 'premium automotive environment, realistic environmental shadows';
    return `${rawIdea.trim()} — ${base}, high-end automotive photography, photorealistic integration.`;
  }

  async generate(
    request: GenerationRequest,
    onProgress?: (event: GenerationProgressEvent) => void
  ): Promise<GenerationResult> {
    for (let i = 0; i < STAGE_ORDER.length; i++) {
      await delay(650);
      onProgress?.({ stage: STAGE_ORDER[i], progress: (i + 1) / STAGE_ORDER.length });
    }

    const result: GenerationResult = {
      id: uid('gen'),
      requestSnapshot: request,
      // Demo passthrough: the real provider returns a newly composited image.
      resultImageUri: request.vehicle.sourcePhoto.uri,
      integrityReport: { passed: true, flaggedAttributes: [] },
      createdAt: new Date().toISOString(),
    };
    return result;
  }

  async checkVehicleIntegrity(result: GenerationResult): Promise<VehicleIntegrityReport> {
    await delay(300);
    return result.integrityReport;
  }
}
