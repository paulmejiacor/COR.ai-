import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from './Text';
import { useTheme } from '../theme';
import { fontWeights } from '../tokens/typography';

export type LogoTone = 'auto' | 'light' | 'dark';
export type LogoVariant = 'full' | 'mark';

export interface LogoProps {
  /** Alto total del isologo en dp; el ancho se deriva de la proporción 3.3:1 del manual. */
  height?: number;
  tone?: LogoTone;
  variant?: LogoVariant;
}

/**
 * Reconstrucción provisional del isologo COR para el prototipo.
 *
 * IMPORTANTE: no existe todavía el archivo vectorial oficial (.ai/.svg) en
 * este repo. El manual de marca solo permite versiones sólidas (negro,
 * blanco o los tonos de la paleta) para la interfaz — nunca deformarlo ni
 * recolorearlo fuera de esa lista — así que este componente dibuja el
 * símbolo ∞ ("intervención tipográfica") en SVG y compone la "R"
 * ("tipografía principal", según la página de construcción de marca) con
 * la fuente del sistema en su peso más pesado. Debe reemplazarse por el
 * asset vectorial real en cuanto el equipo de marca lo entregue.
 */
export function Logo({ height = 28, tone = 'auto', variant = 'full' }: LogoProps) {
  const theme = useTheme();
  const autoColor = theme.mode === 'dark' ? theme.colors.textPrimary : theme.colors.textInverse;
  const color =
    tone === 'light' ? theme.colors.textInverse : tone === 'dark' ? theme.colors.textPrimary : autoColor;

  const markHeight = height;
  const markWidth = markHeight * 1.6;
  const strokeWidth = markHeight * 0.32;
  const r = (markHeight - strokeWidth) / 2;
  const cyA = markHeight / 2;
  const cxA = r + strokeWidth / 2;
  const cxB = markWidth - r - strokeWidth / 2;

  const mark = (
    <Svg width={markWidth} height={markHeight} viewBox={`0 0 ${markWidth} ${markHeight}`}>
      <Circle cx={cxA} cy={cyA} r={r} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx={cxB} cy={cyA} r={r} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </Svg>
  );

  if (variant === 'mark') {
    return <View style={styles.row}>{mark}</View>;
  }

  return (
    <View style={styles.row}>
      {mark}
      <Text
        style={{
          fontFamily: fontWeights.extraBold,
          fontSize: height * 0.95,
          lineHeight: height,
          color,
          marginLeft: height * 0.12,
        }}
      >
        R
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
