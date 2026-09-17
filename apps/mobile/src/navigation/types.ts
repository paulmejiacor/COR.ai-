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
};

export type CompositionEditorParams = CapturedPhotoParams & {
  sceneDescription?: string;
  sceneThumbnail?: ImageSourcePropType;
};

export type ProcessingParams = CapturedPhotoParams & {
  sceneDescription?: string;
  composition: CompositionSettings;
};

export type RootStackParamList = {
  Home: undefined;
  NewCreation: undefined;
  Camera: undefined;
  Detection: CapturedPhotoParams;
  MaskReview: CapturedPhotoParams;
  SceneSelection: CapturedPhotoParams;
  CompositionEditor: CompositionEditorParams;
  Processing: ProcessingParams;
  Placeholder: PlaceholderRoute;
};
