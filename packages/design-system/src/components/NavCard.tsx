import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export interface NavCardProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

/** Tarjeta de acceso secundario (Mis proyectos, Plantillas, Exportaciones, Configuración en Home). */
export function NavCard({ icon, label, onPress }: NavCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Icon name={icon} size={20} color={theme.colors.textPrimary} />
      <Text variant="bodySmall" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  label: {
    marginTop: 2,
  },
});
