export type ExportPresetId =
  | 'instagram_post'
  | 'instagram_story'
  | 'web'
  | 'whatsapp'
  | 'facebook'
  | 'original'
  | 'custom';

export type ExportFileFormat = 'jpg' | 'png' | 'webp';

export interface ExportPreset {
  id: ExportPresetId;
  label: string;
  width: number;
  height: number;
  format: ExportFileFormat;
  /** JPEG/WebP quality 0-1; ignored for PNG. */
  quality: number;
}

export const EXPORT_PRESETS: Record<Exclude<ExportPresetId, 'custom'>, ExportPreset> = {
  instagram_post: { id: 'instagram_post', label: 'Instagram Post', width: 1080, height: 1080, format: 'jpg', quality: 0.92 },
  instagram_story: { id: 'instagram_story', label: 'Instagram Story / Reel', width: 1080, height: 1920, format: 'jpg', quality: 0.92 },
  web: { id: 'web', label: 'Web', width: 1600, height: 900, format: 'webp', quality: 0.85 },
  whatsapp: { id: 'whatsapp', label: 'WhatsApp', width: 1080, height: 1080, format: 'jpg', quality: 0.8 },
  facebook: { id: 'facebook', label: 'Facebook', width: 1200, height: 630, format: 'jpg', quality: 0.9 },
  original: { id: 'original', label: 'Original / Alta Resolución', width: 4096, height: 4096, format: 'png', quality: 1 },
};

export interface CustomExportSettings {
  width: number;
  height: number;
  format: ExportFileFormat;
}
