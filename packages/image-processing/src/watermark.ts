import type { WatermarkSettings } from '@cor/shared-types';

export interface WatermarkLayout {
  xRatio: number; // 0..1 anchor within the canvas
  yRatio: number;
  widthRatio: number;
  opacity: number;
}

const CORNER_ANCHOR: Record<WatermarkSettings['corner'], { x: number; y: number }> = {
  top_left: { x: 0.04, y: 0.04 },
  top_right: { x: 0.96, y: 0.04 },
  bottom_left: { x: 0.04, y: 0.96 },
  bottom_right: { x: 0.96, y: 0.96 },
};

export function computeWatermarkLayout(settings: WatermarkSettings): WatermarkLayout | null {
  if (settings.variant === 'none') return null;
  const anchor = CORNER_ANCHOR[settings.corner];
  return {
    xRatio: anchor.x,
    yRatio: anchor.y,
    widthRatio: 0.08 + settings.size * 0.18,
    opacity: settings.opacity,
  };
}
