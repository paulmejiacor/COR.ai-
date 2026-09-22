import { manipulateAsync } from 'expo-image-manipulator';

export interface NormalizedPhoto {
  uri: string;
  width: number;
  height: number;
}

/**
 * Re-codifica la foto recién capturada/elegida sin ninguna acción real.
 * ImageManipulator decodifica respetando el tag EXIF de orientación y
 * vuelve a codificar los píxeles ya rotados, así que el resultado siempre
 * trae width/height que coinciden con cómo se ve la foto — algunos
 * dispositivos Android devuelven width/height del sensor (sin rotar) para
 * fotos verticales, lo que descuadra todo el encuadre y la composición
 * más adelante si no se corrige aquí, en el único punto de entrada.
 */
export async function normalizeCapturedPhoto(uri: string): Promise<NormalizedPhoto> {
  const result = await manipulateAsync(uri, [], { compress: 1 });
  return { uri: result.uri, width: result.width, height: result.height };
}
