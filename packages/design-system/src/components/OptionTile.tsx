import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export interface OptionTileProps {
  icon: IconName;
  title: string;
  description?: string;
  onPress?: () => void;
}

/** Tarjeta de opción grande (icono + título + descripción + chevron), para flujos de selección. */
export function OptionTile({ icon, title, description, onPress }: OptionTileProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.backgroundElevated, borderRadius: theme.radii.md },
        ]}
      >
        <Icon name={icon} size={22} />
      </View>

      <View style={styles.textColumn}>
        <Text variant="subtitle">{title}</Text>
        {description ? (
          <Text variant="bodySmall" color="secondary" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>

      <Icon name="chevronRight" size={18} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  badge: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  description: {
    marginTop: 3,
  },
});
