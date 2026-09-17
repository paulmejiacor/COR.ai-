import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { useTheme } from '../theme';

export type IconName = 'chevronLeft' | 'folder' | 'grid' | 'download' | 'sliders';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Set mínimo de íconos de línea, propios (sin librería externa) para mantener un trazo consistente. */
export function Icon({ name, size = 22, color }: IconProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors.textPrimary;
  const common = { stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'chevronLeft' && <Path d="M15 4L7 12L15 20" {...common} />}

      {name === 'folder' && (
        <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" {...common} />
      )}

      {name === 'grid' && (
        <>
          <Rect x={3} y={3} width={8} height={8} rx={1.5} {...common} />
          <Rect x={13} y={3} width={8} height={8} rx={1.5} {...common} />
          <Rect x={3} y={13} width={8} height={8} rx={1.5} {...common} />
          <Rect x={13} y={13} width={8} height={8} rx={1.5} {...common} />
        </>
      )}

      {name === 'download' && (
        <>
          <Path d="M12 3v12M7 10l5 5 5-5" {...common} />
          <Path d="M4 19h16" {...common} />
        </>
      )}

      {name === 'sliders' && (
        <>
          <Line x1={4} y1={6} x2={20} y2={6} {...common} />
          <Circle cx={9} cy={6} r={2.2} fill={theme.colors.background} stroke={stroke} strokeWidth={1.6} />
          <Line x1={4} y1={12} x2={20} y2={12} {...common} />
          <Circle cx={16} cy={12} r={2.2} fill={theme.colors.background} stroke={stroke} strokeWidth={1.6} />
          <Line x1={4} y1={18} x2={20} y2={18} {...common} />
          <Circle cx={11} cy={18} r={2.2} fill={theme.colors.background} stroke={stroke} strokeWidth={1.6} />
        </>
      )}
    </Svg>
  );
}
