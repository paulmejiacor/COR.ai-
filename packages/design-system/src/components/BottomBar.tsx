import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '../theme';

export interface BottomBarProps extends ViewProps {
  /** Detección no lleva separador superior. */
  bordered?: boolean;
}

/** Barra de acción fija al pie de pantalla (Escenario, Editor, Exportar) — envuelve el botón primario. */
export function BottomBar({ bordered = true, style, children, ...rest }: BottomBarProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          paddingTop: 14,
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: 38,
          borderTopWidth: bordered ? StyleSheet.hairlineWidth : 0,
          borderTopColor: theme.colors.borderSubtle,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      {...rest}
    />
  );
}
