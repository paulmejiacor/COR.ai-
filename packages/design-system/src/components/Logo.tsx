import { Image } from 'react-native';
import { useTheme } from '../theme';

/** 'light' = tinta blanca (para fondos oscuros); 'dark' = tinta negra (para fondos claros). */
export type LogoTone = 'auto' | 'light' | 'dark';

export interface LogoProps {
  /** Alto del isologo en dp; el ancho se deriva de la proporción real del asset. */
  height?: number;
  tone?: LogoTone;
  /** Se dispara cuando el asset terminó de decodificarse y pintarse — útil para esperar antes de capturar la vista. */
  onLoad?: () => void;
}

const SOURCE_WHITE_INK = require('../../assets/brand/cor-logo-white.png');
const SOURCE_BLACK_INK = require('../../assets/brand/cor-logo-black.png');

/** Proporción real del recorte (759×264, extraído del manual de marca oficial). */
export const LOGO_ASPECT_RATIO = 759 / 264;
const ASPECT_RATIO = LOGO_ASPECT_RATIO;

/**
 * Isologo COR — recortado y recolorizado directamente del manual de marca
 * oficial (versiones sólidas en negro y blanco, página "Colorimetría,
 * versiones de color"), nunca deformado ni recoloreado fuera de esa lista.
 */
export function Logo({ height = 28, tone = 'auto', onLoad }: LogoProps) {
  const theme = useTheme();
  // Fondo oscuro -> tinta blanca; fondo claro -> tinta negra.
  const resolvedTone: 'light' | 'dark' = tone === 'auto' ? (theme.mode === 'dark' ? 'light' : 'dark') : tone;
  const source = resolvedTone === 'light' ? SOURCE_WHITE_INK : SOURCE_BLACK_INK;

  return (
    <Image
      source={source}
      accessibilityLabel="COR"
      resizeMode="contain"
      style={{ height, width: height * ASPECT_RATIO }}
      onLoad={onLoad}
    />
  );
}
