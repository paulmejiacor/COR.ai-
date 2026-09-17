import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '../theme';

export interface SurfaceProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  bordered?: boolean;
}

export function Surface({ elevated = false, padded = true, bordered = true, style, ...rest }: SurfaceProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.colors.backgroundElevated : theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}
