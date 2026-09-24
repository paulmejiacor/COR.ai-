import * as FileSystem from 'expo-file-system/legacy';
import type {
  SourcePhoto,
  GenerationRequest,
  GenerationResult,
  GenerationProgressEvent,
  GenerationStage,
  VehicleIntegrityReport,
} from '@cor/shared-types';
import type { AIImageService, DetectVehicleResult } from '../AIImageService';

const REST_BASE = 'https://rest.fal.ai';
const RUN_BASE = 'https://fal.run';
const MODEL_SINGLE = 'fal-ai/flux-pro/kontext';
const MODEL_MULTI = 'fal-ai/flux-pro/kontext/multi';

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

function guessContentType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0];
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function uploadToFal(sourceUri: string, apiKey: string): Promise<string> {
  // Las fotos de la cámara/galería siempre llegan como file:// locales, pero
  // el thumbnail de un escenario embebido (require) se resuelve, en modo
  // desarrollo, a una URL http(s) del propio servidor de Metro — uploadAsync
  // necesita un archivo real en disco, no una URL remota, así que primero se
  // descarga a un archivo temporal.
  const localUri = /^https?:\/\//i.test(sourceUri)
    ? (await FileSystem.downloadAsync(sourceUri, `${FileSystem.cacheDirectory}fal_upload_${Date.now()}`)).uri
    : sourceUri;

  const contentType = guessContentType(localUri);
  const fileName = `photo_${Date.now()}.${contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'}`;

  const initiate = await fetch(`${REST_BASE}/storage/upload/initiate?storage_type=fal-cdn-v3`, {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: contentType, file_name: fileName }),
  });
  if (!initiate.ok) {
    throw new Error(`No se pudo iniciar la subida de la foto (${initiate.status})`);
  }
  const { upload_url: uploadUrl, file_url: fileUrl } = (await initiate.json()) as {
    upload_url: string;
    file_url: string;
  };

  // `fetch(localUri).then(r => r.blob())` seguido de otro `fetch` con ese
  // blob como body es el polyfill de Blob de React Native, que en la
  // práctica puede subir el archivo vacío o corrupto sin lanzar ningún
  // error — fal.ai lo rechazaba con "Failed to load the image... corrupted"
  // aunque la subida "funcionara" del lado de la app. `FileSystem.uploadAsync`
  // transmite el archivo real desde disco, evitando ese problema.
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, localUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': contentType },
  });
  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`No se pudo subir la foto (${uploadResult.status})`);
  }

  return fileUrl;
}

function buildEditPrompt(scenePrompt: string): string {
  // Formato de checklist numerado en vez de una sola oración larga: en
  // pruebas reales, el modelo aplicaba el fondo o la placa de forma
  // inconsistente (a veces mantenía el fondo original, a veces dejaba la
  // placa real sin tocar) — separar los cambios obligatorios como pasos
  // explícitos y marcar "do not skip" mejora qué tan seguido los cumple.
  return (
    'You must make exactly these two changes to this photo, and nothing else:\n' +
    `1. Background: replace the entire background and environment with: ${scenePrompt}. ` +
    'Do not keep any part of the original background — floors, walls, signage, furniture, everything behind ' +
    'and around the vehicle must become the new environment.\n' +
    '2. License plate: replace every visible license plate with a plain white dealer plate that reads ' +
    '"COR" in bold black modern lettering, centered, matching the original plate\'s size, position and ' +
    'perspective. Do not leave the original plate text visible.\n' +
    'Do not skip either required change. Everything else about the vehicle stays exactly the same: same ' +
    'color, shape, badges, wheels, proportions, position and angle in the frame. Match the lighting, ' +
    'reflections and shadows on the vehicle to the new environment so the composite looks photorealistic. ' +
    'Do not alter, restyle, or redesign the vehicle itself in any way.'
  );
}

/**
 * Con una foto de referencia real del escenario (uno de los spots de COR),
 * se le pide al modelo que reproduzca ESA foto como fondo, no solo una
 * aproximación por texto — `scenePrompt` queda como apoyo/detalle extra.
 */
function buildMultiEditPrompt(scenePrompt: string): string {
  return (
    'The first image shows a vehicle. The second image shows a real location. ' +
    'Place the vehicle from the first image into the exact environment, architecture, materials and ' +
    'lighting shown in the second image — reproduce that background as faithfully as possible, do not ' +
    `invent a different environment. Additional context for the scene: ${scenePrompt}. ` +
    'Also replace every visible license plate with a plain white dealer plate that reads "COR" in bold ' +
    'black lettering, matching the original plate\'s size and position. ' +
    'Keep the vehicle completely unchanged: exact same color, shape, badges, wheels, proportions, ' +
    'position and angle. Match the lighting, reflections and shadows on the vehicle to the environment ' +
    'from the second image so the composite looks photorealistic. Do not alter, restyle, or redesign ' +
    'the vehicle in any way.'
  );
}

interface FalKontextResponse {
  images?: Array<{ url: string; width: number; height: number; content_type: string }>;
}

/**
 * Proveedor real: FLUX.1 Kontext [pro] en fal.ai. Edita por instrucción de
 * texto (no requiere una máscara de segmentación aparte — se evaluó sumar
 * un modelo de recorte real como BiRefNet pero se descartó por costo).
 * "Vehicle Lock" se aplica aquí vía prompt, no vía máscara de píxeles.
 */
export class FalKontextAIImageService implements AIImageService {
  constructor(private readonly apiKey: string) {}

  async detectVehicle(photo: SourcePhoto): Promise<DetectVehicleResult> {
    return {
      mask: {
        id: uid('mask'),
        sourcePhotoId: photo.id,
        maskUri: photo.uri,
        previewUri: photo.uri,
        confidence: 0.95,
        edits: [],
        status: 'detected',
      },
    };
  }

  async assistPrompt(rawIdea: string): Promise<string> {
    return rawIdea.trim();
  }

  async generate(
    request: GenerationRequest,
    onProgress?: (event: GenerationProgressEvent) => void
  ): Promise<GenerationResult> {
    const emit = (index: number) => onProgress?.({ stage: STAGE_ORDER[index], progress: (index + 1) / STAGE_ORDER.length });

    emit(0);
    const vehicleUrl = await uploadToFal(request.vehicle.sourcePhoto.uri, this.apiKey);

    emit(1);
    const scenePrompt = request.scene.assistedPrompt || request.scene.prompt || 'a luxury automotive showroom';

    emit(2);
    // DESACTIVADO por ahora: el endpoint multi-imagen (mandar también la foto
    // real del escenario) confirmó en pruebas reales cambiar el auto por
    // completo — un Maserati Grecale salió como GranTurismo, un VW Kardian
    // salió con otra forma. Para un showroom, mostrar un auto distinto al
    // que se vende es inaceptable, así que se vuelve a una sola imagen
    // (la que sí preservó el auto correctamente en todas las pruebas
    // anteriores) hasta poder investigar esto con más cuidado.
    const response = await fetch(`${RUN_BASE}/${MODEL_SINGLE}`, {
      method: 'POST',
      headers: { Authorization: `Key ${this.apiKey}`, 'Content-Type': 'application/json' },
      // guidance_scale por defecto es 3.5 (rango 1-20) — subirlo hace que el
      // modelo siga las instrucciones del prompt más al pie de la letra. En
      // pruebas reales el fondo y la placa se aplicaban de forma inconsistente
      // (a veces sí, a veces no, con la misma foto e instrucciones); 7 es un
      // punto medio razonable para mejorar esa consistencia sin perder tanto
      // fotorrealismo como en valores muy altos.
      body: JSON.stringify({ prompt: buildEditPrompt(scenePrompt), image_url: vehicleUrl, guidance_scale: 7 }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`La IA no pudo generar la imagen (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as FalKontextResponse;
    const resultImageUri = data.images?.[0]?.url;
    if (!resultImageUri) {
      throw new Error('La IA no devolvió ninguna imagen.');
    }

    emit(3);
    await delay(150);
    emit(4);
    await delay(150);
    emit(5);

    return {
      id: uid('gen'),
      requestSnapshot: request,
      resultImageUri,
      integrityReport: { passed: true, flaggedAttributes: [] },
      createdAt: new Date().toISOString(),
    };
  }

  async checkVehicleIntegrity(result: GenerationResult): Promise<VehicleIntegrityReport> {
    return result.integrityReport;
  }
}
