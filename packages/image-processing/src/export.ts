import { EXPORT_PRESETS, type CustomExportSettings, type ExportPresetId } from '@cor/shared-types';

export interface ResolvedExportSpec {
  width: number;
  height: number;
  format: 'jpg' | 'png' | 'webp';
  quality: number;
}

export function resolveExportSpec(
  presetId: ExportPresetId,
  custom?: CustomExportSettings
): ResolvedExportSpec {
  if (presetId === 'custom') {
    if (!custom) throw new Error('Custom export selected without settings.');
    return { ...custom, quality: 0.95 };
  }
  return EXPORT_PRESETS[presetId];
}

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/**
 * Rectángulo de recorte "cover": el más grande que cabe dentro de la imagen
 * fuente conservando la relación de aspecto del destino, centrado. Es lo
 * que usa la exportación real para adaptar la foto a cada formato sin
 * deformarla.
 */
export function computeCoverCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): CropRect {
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  if (sourceAspect > targetAspect) {
    const cropWidth = Math.round(sourceHeight * targetAspect);
    return { originX: Math.round((sourceWidth - cropWidth) / 2), originY: 0, width: cropWidth, height: sourceHeight };
  }

  const cropHeight = Math.round(sourceWidth / targetAspect);
  return { originX: 0, originY: Math.round((sourceHeight - cropHeight) / 2), width: sourceWidth, height: cropHeight };
}
