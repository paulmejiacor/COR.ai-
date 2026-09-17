import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { useTheme } from '../theme';

export type IconName =
  | 'chevronLeft'
  | 'chevronRight'
  | 'folder'
  | 'grid'
  | 'download'
  | 'sliders'
  | 'camera'
  | 'image'
  | 'undo'
  | 'refresh'
  | 'plusCircle'
  | 'minusCircle'
  | 'check'
  | 'edit'
  | 'share'
  | 'save'
  | 'compare'
  | 'copy'
  | 'trash';

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

      {name === 'chevronRight' && <Path d="M9 4L17 12L9 20" {...common} />}

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

      {name === 'camera' && (
        <>
          <Path d="M9 5h6l1.5 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2h2.5L9 5z" {...common} />
          <Circle cx={12} cy={13} r={3.4} {...common} />
        </>
      )}

      {name === 'image' && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={2} {...common} />
          <Circle cx={8.2} cy={9} r={1.4} fill={stroke} stroke="none" />
          <Path d="M4 17l5.2-5.6a1.4 1.4 0 0 1 2 0L15 15.5l1.6-1.8a1.4 1.4 0 0 1 2.1 0L21 16.5" {...common} />
        </>
      )}

      {name === 'undo' && <Path d="M7 7L3 11l4 4M3 11h11a6 6 0 0 1 0 12h-4" {...common} />}

      {name === 'refresh' && (
        <>
          <Path d="M4 12a8 8 0 0 1 13.5-5.5M17.5 3v4h-4" {...common} />
          <Path d="M20 12a8 8 0 0 1-13.5 5.5M6.5 21v-4h4" {...common} />
        </>
      )}

      {name === 'plusCircle' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M12 8v8M8 12h8" {...common} />
        </>
      )}

      {name === 'minusCircle' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M8 12h8" {...common} />
        </>
      )}

      {name === 'check' && <Path d="M4 12l5 5L20 6" {...common} />}

      {name === 'edit' && <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" {...common} />}

      {name === 'share' && (
        <>
          <Path d="M12 3v12M8 7l4-4 4 4" {...common} />
          <Path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" {...common} />
        </>
      )}

      {name === 'save' && <Path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" {...common} />}

      {name === 'compare' && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={2} {...common} />
          <Line x1={12} y1={4} x2={12} y2={20} {...common} />
          <Circle cx={12} cy={12} r={2} fill={stroke} stroke="none" />
        </>
      )}

      {name === 'copy' && (
        <>
          <Rect x={8} y={8} width={13} height={13} rx={2} {...common} />
          <Path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" {...common} />
        </>
      )}

      {name === 'trash' && (
        <>
          <Path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" {...common} />
          <Path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" {...common} />
          <Line x1={10} y1={11} x2={10} y2={17} {...common} />
          <Line x1={14} y1={11} x2={14} y2={17} {...common} />
        </>
      )}
    </Svg>
  );
}
