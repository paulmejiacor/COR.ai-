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
