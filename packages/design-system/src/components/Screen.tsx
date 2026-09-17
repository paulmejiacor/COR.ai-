import { SafeAreaView, StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../theme';

export interface ScreenProps extends ViewProps {
  padded?: boolean;
}

/** Contenedor base de pantalla: fondo de marca + safe area. Fase 3+ construye sobre esto. */
export function Screen({ padded = true, style, children, ...rest }: ScreenProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View
        style={[styles.content, padded && { paddingHorizontal: theme.spacing.xl }, style]}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
