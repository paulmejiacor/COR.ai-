export type ScenePresetCategory =
  | 'custom'
  | 'showroom'
  | 'urban'
  | 'nature'
  | 'automotive'
  | 'night';

export interface ScenePreset {
  id: string;
  category: ScenePresetCategory;
  name: string;
  /** Base prompt fragment used/expanded by COR Prompt Assist. */
  basePrompt: string;
  thumbnailUri: string;
}

/** The scenario the user wants the vehicle placed into. */
export interface Scene {
  id: string;
  preset?: ScenePreset;
  /** Free-text description written or refined by the user. */
  prompt: string;
  /** Prompt after COR Prompt Assist expands it into a precise visual description. */
  assistedPrompt?: string;
  /**
   * URI local de la foto de referencia del escenario elegido (uno de los
   * spots reales de COR, o un escenario personalizado). Cuando está
   * presente, el proveedor de IA la sube junto con la foto del vehículo y
   * la usa como referencia visual real del fondo — no solo el texto de
   * `prompt`.
   */
  referenceImageUri?: string;
}
