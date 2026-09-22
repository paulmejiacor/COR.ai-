import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** 'overlay' = variante sobre foto (Cámara): inactivo con scrim oscuro en vez de transparente. */
  tone?: 'default' | 'overlay';
}

/** Pill de selección rápida (ejemplos de escenario, ángulo de cámara). */
export function Chip({ label, active = false, onPress, tone = 'default' }: ChipProps) {
  const theme = useTheme();
  const inactiveBorder = tone === 'overlay' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(222, 222, 216, 0.18)';
  const inactiveBg = tone === 'overlay' ? 'rgba(10, 10, 10, 0.45)' : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.textPrimary : inactiveBg,
          borderColor: active ? theme.colors.textPrimary : inactiveBorder,
        },
      ]}
    >
      <Text
        variant="bodySmall"
        numberOfLines={1}
        style={{ color: active ? theme.colors.textInverse : theme.colors.textPrimary, fontSize: 12 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 33,
    maxWidth: 240,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
