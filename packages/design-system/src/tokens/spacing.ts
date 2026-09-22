export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
  /** Tarjetas (NavCard, tarjetas de escenario, historial). */
  card: 18,
  /** Miniaturas. */
  thumb: 14,
  /** Lienzos (Detección, Editor). */
  canvas: 20,
  /** Controles pequeños (esquinas de marca de agua, tiles de formato). */
  control: 12,
  /** Segmentos dentro de un SegmentedControl. */
  segment: 9,
} as const;
