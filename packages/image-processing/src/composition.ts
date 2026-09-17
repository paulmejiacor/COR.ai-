import type { CompositionSettings } from '@cor/shared-types';

export interface VehicleTransform {
  translateXRatio: number; // -1..1 of canvas width, relative to center
  scale: number;
  rotationDeg: number;
  /** Vertical shift as a ratio of canvas height, driven by perspective + distance. */
  translateYRatio: number;
}

const POSITION_TO_X_RATIO: Record<CompositionSettings['position'], number> = {
  left: -0.28,
  center: 0,
  right: 0.28,
};

/**
 * Converts user-facing composition controls into a single transform for the
 * (untouched) vehicle cut-out layer. This never touches the vehicle mask's
 * pixels — it only repositions/scales the layer within the new scene, which
 * is what keeps the vehicle itself protected while still feeling directable.
 */
export function computeVehicleTransform(settings: CompositionSettings): VehicleTransform {
  const distanceScale = 1 - settings.distance * 0.35;
  return {
    translateXRatio: POSITION_TO_X_RATIO[settings.position],
    scale: Math.max(0.4, settings.scale * distanceScale),
    rotationDeg: settings.rotation,
    translateYRatio: settings.heightPerspective * 0.12,
  };
}
