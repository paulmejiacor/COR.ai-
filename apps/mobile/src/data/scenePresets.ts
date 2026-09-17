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
  showroom: 'Showroom COR',
  urban: 'Urbano',
  nature: 'Naturaleza',
  automotive: 'Automotriz',
  night: 'Noche',
};

export const SCENE_PRESETS: UIScenePreset[] = [
  {
    id: 'cor-showroom-interior',
    category: 'showroom',
    name: 'Showroom COR',
    basePrompt:
      'Interior showroom COR, iluminación cenital cálida y puntual, pared de fondo con el isologo COR, piso oscuro pulido, atmósfera cinematográfica minimalista, reflejos controlados.',
    thumbnail: require('../../assets/scenes/cor-showroom-interior.jpg'),
  },
  {
    id: 'cor-showroom-exterior',
    category: 'showroom',
    name: 'Fachada COR al atardecer',
    basePrompt:
      'Fachada arquitectónica moderna del showroom COR al atardecer, cielo con tonos cálidos, logo COR iluminado en la pared, piso de adoquín, ambiente exclusivo de concesionario de lujo.',
    thumbnail: require('../../assets/scenes/cor-showroom-exterior.jpg'),
  },
  {
    id: 'dark-studio',
    category: 'showroom',
    name: 'Dark Studio',
    basePrompt:
      'Luxury automotive studio, dark architectural environment, polished dark floor, controlled cinematic lighting, premium reflections, realistic environmental shadows, high-end automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1626037032248-1ac252c8ccc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'marble-showroom',
    category: 'showroom',
    name: 'Marble Showroom',
    basePrompt:
      'Luxury marble showroom interior, polished white and grey marble surfaces, soft diffused lighting, minimalist architecture, premium automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1675922844693-e1051c5a72e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'urban-city',
    category: 'urban',
    name: 'Ciudad Moderna',
    basePrompt:
      'Modern city street, clean architectural lines, glass and steel skyscrapers, soft ambient occlusion, urban automotive photography, realistic daylight.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1760213318955-d2b116899acc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'mountain-sunset',
    category: 'nature',
    name: 'Carretera de Montaña',
    basePrompt:
      'Alpine mountain road at golden hour, warm side light, crisp atmospheric depth, dramatic landscape, cinematic automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1560194053-c5a96f89c366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'desert',
    category: 'nature',
    name: 'Desierto',
    basePrompt:
      'Vast desert landscape with sand dunes, warm directional sunlight, long soft shadows, off-road automotive photography, wide open horizon.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1643925690746-9eb744dae41b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'beach',
    category: 'nature',
    name: 'Playa',
    basePrompt:
      'Coastal beach setting, aerial perspective, turquoise water, soft natural light, premium lifestyle automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1620370053209-be66e35a1ea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'race-track',
    category: 'automotive',
    name: 'Pista de Carreras',
    basePrompt:
      'Professional race track at dusk, asphalt with racing lines, motorsport atmosphere, dramatic sky, high-performance automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1771383378500-fa6c124a3458?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'garage',
    category: 'automotive',
    name: 'Garage Privado',
    basePrompt:
      'Private dark concrete garage, moody directional lighting, minimalist industrial architecture, exclusive car collection atmosphere.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1767868278588-b61f3f5816cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
  {
    id: 'city-night',
    category: 'night',
    name: 'Ciudad de Noche',
    basePrompt:
      'Night city setting with neon reflections, ambient street lighting, wet asphalt reflections, cinematic night automotive photography.',
    thumbnail: { uri: 'https://images.unsplash.com/photo-1674000603823-011d39b01dd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80' },
  },
];

export const SCENE_CATEGORY_ORDER: ScenePresetCategory[] = ['showroom', 'automotive', 'urban', 'nature', 'night'];
