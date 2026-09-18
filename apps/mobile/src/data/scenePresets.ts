import type { ImageSourcePropType } from 'react-native';
import type { ScenePresetCategory } from '@cor/shared-types';

/**
 * Plantillas de escenario para la Fase 7. `thumbnail` acepta tanto imágenes
 * locales (require) como remotas ({ uri }) — por eso vive aquí y no en
 * @cor/shared-types, que se mantiene sin dependencias de React Native.
 */
export interface UIScenePreset {
  id: string;
  category: ScenePresetCategory;
  name: string;
  basePrompt: string;
  thumbnail: ImageSourcePropType;
}

export const SCENE_CATEGORY_LABEL: Record<ScenePresetCategory, string> = {
  custom: 'Mis escenarios',
  showroom: 'Showroom COR',
  urban: 'Urbano',
  nature: 'Naturaleza',
  automotive: 'Automotriz',
  night: 'Noche',
};

/**
 * Los únicos escenarios predefinidos de la app — reemplazan el catálogo
 * anterior a petición explícita. El usuario puede agregar más desde la
 * tarjeta "+ Agregar escenario" (categoría "custom", persistida en el
 * dispositivo vía @cor/storage).
 */
export const SCENE_PRESETS: UIScenePreset[] = [
  {
    id: 'cor-lobby-dark',
    category: 'showroom',
    name: 'Lobby Oscuro',
    basePrompt:
      'Lobby moderno de mármol oscuro, líneas de luz cálida en el techo, paredes de mármol veteado con iluminación indirecta, atmósfera cinematográfica de lujo, reflejos controlados en el piso pulido.',
    thumbnail: require('../../assets/scenes/cor-lobby-dark.jpg'),
  },
  {
    id: 'cor-lobby-light',
    category: 'showroom',
    name: 'Salón Claro',
    basePrompt:
      'Salón amplio de mármol claro con molduras doradas, luz natural entrando por ventanales altos, ambiente cálido y minimalista, piso de mármol pulido con reflejos suaves.',
    thumbnail: require('../../assets/scenes/cor-lobby-light.jpg'),
  },
  {
    id: 'cor-lobby-view',
    category: 'showroom',
    name: 'Lobby con Vista',
    basePrompt:
      'Lobby de lujo con ventanales de piso a techo y vista panorámica a la ciudad y montañas al atardecer, recepción de mármol oscuro, iluminación cálida indirecta, atmósfera exclusiva.',
    thumbnail: require('../../assets/scenes/cor-lobby-view.jpg'),
  },
];

export const SCENE_CATEGORY_ORDER: ScenePresetCategory[] = ['custom', 'showroom', 'automotive', 'urban', 'nature', 'night'];
