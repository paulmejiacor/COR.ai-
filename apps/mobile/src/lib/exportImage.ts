import { manipulateAsync, SaveFormat, type ImageResult } from 'expo-image-manipulator';
import { computeCoverCropRect, type ResolvedExportSpec } from '@cor/image-processing';

const FORMAT_MAP: Record<ResolvedExportSpec['format'], SaveFormat> = {
  jpg: SaveFormat.JPEG,
  png: SaveFormat.PNG,
  webp: SaveFormat.WEBP,
};

/**
 * Recorta (cover, centrado) y redimensiona una imagen real a la
 * especificación de exportación elegida — sin deformar el vehículo, igual
 * que el resto de la composición: se recorta el encuadre, nunca se estira.
 */
export async function exportImageToSpec(
  uri: string,
  sourceWidth: number,
  sourceHeight: number,
  spec: ResolvedExportSpec
): Promise<ImageResult> {
  const crop = computeCoverCropRect(sourceWidth, sourceHeight, spec.width, spec.height);

  return manipulateAsync(
    uri,
    [{ crop }, { resize: { width: spec.width, height: spec.height } }],
    { compress: spec.quality, format: FORMAT_MAP[spec.format] }
  );
}

/**
 * Re-codifica una imagen ya del tamaño correcto al formato/calidad final,
 * sin recortar ni redimensionar. Se usa después de "hornear" la marca de
 * agua (que siempre se captura como PNG sin pérdida) para producir el
 * archivo en el formato que el usuario eligió.
 */
export async function reencodeImage(
  uri: string,
  format: ResolvedExportSpec['format'],
  quality: number
): Promise<ImageResult> {
  return manipulateAsync(uri, [], { compress: quality, format: FORMAT_MAP[format] });
}
