import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme';

export interface CornerBracketsProps {
  size?: number;
  thickness?: number;
  color?: string;
  style?: ViewStyle;
}

/** Un solo trazo en forma de esquina (┌); las otras tres se obtienen reflejando este con transforms. */
const Bracket = ({ size, thickness, color }: { size: number; thickness: number; color: string }) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <Path d={`M1,${size} V${thickness} Q1,1 ${thickness},1 H${size}`} stroke={color} strokeWidth={1.2} fill="none" strokeLinecap="round" />
  </Svg>
);

/** Motivo decorativo de esquinas visto en las páginas del manual de marca — solo para momentos hero. */
export function CornerBrackets({ size = 20, thickness = 6, color, style }: CornerBracketsProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.borderStrong;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={[styles.corner, styles.topLeft]}>
        <Bracket size={size} thickness={thickness} color={resolvedColor} />
      </View>
      <View style={[styles.corner, styles.topRight, { transform: [{ scaleX: -1 }] }]}>
        <Bracket size={size} thickness={thickness} color={resolvedColor} />
      </View>
      <View style={[styles.corner, styles.bottomLeft, { transform: [{ scaleY: -1 }] }]}>
        <Bracket size={size} thickness={thickness} color={resolvedColor} />
      </View>
      <View style={[styles.corner, styles.bottomRight, { transform: [{ scaleX: -1 }, { scaleY: -1 }] }]}>
        <Bracket size={size} thickness={thickness} color={resolvedColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
  },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
});
