export type HorizontalPosition = 'left' | 'center' | 'right';

/**
 * Controls how the (untouched) vehicle cut-out is placed into the new scene.
 * These only move/scale the composition — they never deform the vehicle mask itself.
 */
export interface CompositionSettings {
  position: HorizontalPosition;
  /** 0.5 - 1.5, 1 = original scale. */
  scale: number;
  /** -1 (low angle) to 1 (high angle), 0 = eye level. */
  heightPerspective: number;
  /** Degrees, -15 to 15. */
  rotation: number;
  /** 0 (close) to 1 (far). */
  distance: number;
}

export const DEFAULT_COMPOSITION_SETTINGS: CompositionSettings = {
  position: 'center',
  scale: 1,
  heightPerspective: 0,
  rotation: 0,
  distance: 0.4,
};

export type WatermarkVariant = 'logo' | 'logo_name' | 'none';
export type WatermarkCorner = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

export interface WatermarkSettings {
  variant: WatermarkVariant;
  corner: WatermarkCorner;
  /** 0.1 - 1 relative scale. */
  size: number;
  /** 0 - 1. */
  opacity: number;
}

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  variant: 'logo',
  corner: 'bottom_right',
  size: 0.35,
  opacity: 0.85,
};
