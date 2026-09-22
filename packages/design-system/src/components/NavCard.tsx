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
          borderColor: pressed ? theme.colors.borderStrong : theme.colors.border,
          borderRadius: theme.radii.card,
          padding: 18,
        },
      ]}
    >
      <Icon name={icon} size={20} color={theme.colors.textPrimary} />
      <Text variant="bodySmall">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    height: 100,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
  },
});
