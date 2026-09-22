/**
 * Tipografía secundaria del manual de marca: Proxima Nova Alt.
 * Al no disponer de las fuentes licenciadas para el prototipo, se usa
 * Plus Jakarta Sans como sustituto (geometría y calidez cercanas) hasta
 * que el equipo de marca entregue los archivos oficiales. Cambiar la
 * fuente real es editar únicamente `FONT_FAMILY` y el mapa de pesos.
 */
export const FONT_FAMILY = 'Plus Jakarta Sans';

export const fontWeights = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export const typeScale: Record<
  'hero' | 'title' | 'stage' | 'subtitle' | 'body' | 'bodySmall' | 'label' | 'brand' | 'button' | 'caption',
  TypeStyle
> = {
  // Diseño oficial (docs/DESIGN.md) — tamaños/pesos/tracking finales.
  hero: { fontFamily: fontWeights.semiBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  title: { fontFamily: fontWeights.semiBold, fontSize: 24, lineHeight: 30, letterSpacing: 0 },
  stage: { fontFamily: fontWeights.semiBold, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  subtitle: { fontFamily: fontWeights.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0.1 },
  body: { fontFamily: fontWeights.regular, fontSize: 14, lineHeight: 21, letterSpacing: 0.1 },
  bodySmall: { fontFamily: fontWeights.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontFamily: fontWeights.semiBold, fontSize: 11, lineHeight: 16, letterSpacing: 2.4 },
  /** Marca del vehículo (Historial): mayúsculas, color accent — aplicado por quien la use. */
  brand: { fontFamily: fontWeights.semiBold, fontSize: 10, lineHeight: 14, letterSpacing: 1.6 },
  /** Texto de botón primario/secundario: mayúsculas. */
  button: { fontFamily: fontWeights.bold, fontSize: 13, lineHeight: 16, letterSpacing: 2.4 },
  caption: { fontFamily: fontWeights.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
};
