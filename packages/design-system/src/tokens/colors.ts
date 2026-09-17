/**
 * Paleta oficial COR (docs/BRAND.md). No se agregan colores principales
 * fuera de esta lista — solo se derivan variantes de opacidad para uso
 * funcional (bordes, overlays).
 */
export const brand = {
  moss: '#2C3424',
  cypress: '#4C583E',
  olive: '#768064',
  cedar: '#959581',
  aloe: '#DEDED8',
  black: '#0A0A0A',
  principal2: '#231F20',
} as const;

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  accent: string;
  accentMuted: string;
  overlay: string;
}

/**
 * Tema oscuro — identidad primaria de la app (showroom cinematográfico).
 * Semántica de uso, no colores nuevos.
 */
export const darkTheme: ThemeColors = {
  background: brand.black,
  backgroundElevated: brand.moss,
  surface: brand.principal2,
  surfaceAlt: brand.cypress,
  border: 'rgba(222, 222, 216, 0.12)', // aloe @ 12%
  borderStrong: 'rgba(222, 222, 216, 0.24)',
  textPrimary: brand.aloe,
  textSecondary: brand.cedar,
  textInverse: brand.black,
  accent: brand.cypress,
  accentMuted: brand.olive,
  overlay: 'rgba(10, 10, 10, 0.72)',
};

/** Tema claro — para tarjetas/superficies que necesiten alto contraste sobre fondo oscuro. */
export const lightTheme: ThemeColors = {
  background: brand.aloe,
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: brand.cedar,
  border: 'rgba(10, 10, 10, 0.08)',
  borderStrong: 'rgba(10, 10, 10, 0.16)',
  textPrimary: brand.black,
  textSecondary: brand.moss,
  textInverse: brand.aloe,
  accent: brand.cypress,
  accentMuted: brand.olive,
  overlay: 'rgba(222, 222, 216, 0.8)',
};

/** Colores funcionales mínimos, deliberadamente desaturados para no competir con la marca. */
export const semantic = {
  danger: '#B4544A',
  warning: '#B98A4A',
  success: brand.cypress,
} as const;
