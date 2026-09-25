import type { ImageSourcePropType } from 'react-native';
import type { CompositionSettings } from '@cor/shared-types';

/**
 * Rutas "próximamente": pantallas que ya se pueden abrir pero cuyo
 * contenido real se construye en una fase posterior del plan acordado.
 * Cuando la fotografía ya existe, se adjunta para previsualizarla aunque
 * el contenido real de esa fase todavía no esté construido.
 */
export type PlaceholderRoute = {
  title: string;
  phase: string;
  photoUri?: string;
  note?: string;
};

export type CapturedPhotoParams = {
  photoUri: string;
  photoWidth: number;
  photoHeight: number;
  source: 'camera' | 'gallery';
  /** Ángulo elegido en el selector de Cámara (Frontal 3/4, Lateral, ...); ausente en fotos de galería. */
  angle?: string;
};

export type CompositionEditorParams = CapturedPhotoParams & {
  sceneDescription?: string;
  sceneThumbnail?: ImageSourcePropType;
};

export type BatchPhoto = { uri: string; width: number; height: number };

export type SceneSelectionParams = CapturedPhotoParams & {
  /** Presente solo si se eligieron varias fotos de golpe — el mismo escenario se aplica a todas. */
  batchPhotos?: BatchPhoto[];
};

export type BatchProcessingParams = {
  photos: BatchPhoto[];
  sceneDescription?: string;
};

export type BatchResultItem = { photoUri: string; resultImageUri: string; photoWidth: number; photoHeight: number };

export type BatchResultParams = {
  results: BatchResultItem[];
  failedCount: number;
  sceneDescription?: string;
};

export type ProcessingParams = CapturedPhotoParams & {
  sceneDescription?: string;
  /** URI local de la foto del escenario elegido, para usarla como referencia visual real ante la IA (no solo texto). */
  sceneReferenceUri?: string;
  composition: CompositionSettings;
};

export type ResultParams = ProcessingParams & {
  resultImageUri: string;
};

export type CompareParams = {
  beforeUri: string;
  afterUri: string;
  photoWidth: number;
  photoHeight: number;
};

export type ExportParams = {
  resultImageUri: string;
  photoWidth: number;
  photoHeight: number;
};

export type RootStackParamList = {
  Home: undefined;
  NewCreation: undefined;
  Camera: undefined;
  Detection: CapturedPhotoParams;
  MaskReview: CapturedPhotoParams;
  SceneSelection: SceneSelectionParams;
  CompositionEditor: CompositionEditorParams;
  Processing: ProcessingParams;
  Result: ResultParams;
  PlateBranding: ResultParams;
  Compare: CompareParams;
  Export: ExportParams;
  BatchProcessing: BatchProcessingParams;
  BatchResult: BatchResultParams;
  History: undefined;
  Settings: undefined;
  Placeholder: PlaceholderRoute;
};
