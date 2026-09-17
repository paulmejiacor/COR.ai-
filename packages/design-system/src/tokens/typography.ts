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
  'display' | 'title' | 'subtitle' | 'body' | 'bodySmall' | 'label' | 'caption',
  TypeStyle
> = {
  display: { fontFamily: fontWeights.bold, fontSize: 32, lineHeight: 38, letterSpacing: 0.2 },
  title: { fontFamily: fontWeights.semiBold, fontSize: 22, lineHeight: 28, letterSpacing: 0.1 },
  subtitle: { fontFamily: fontWeights.medium, fontSize: 16, lineHeight: 22, letterSpacing: 0.1 },
  body: { fontFamily: fontWeights.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0.1 },
  bodySmall: { fontFamily: fontWeights.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontFamily: fontWeights.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.6 },
  caption: { fontFamily: fontWeights.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
};
