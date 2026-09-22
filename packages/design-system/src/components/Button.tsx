import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Ícono opcional a la izquierda del texto (gap 10) — usado en "NUEVA CREACIÓN" en Home. */
  icon?: IconName;
  /** 'large' = 56 px de alto (Home); el resto de la app usa el alto por defecto (54 primario / 50 secundario). */
  size?: 'default' | 'large';
}

export function Button({
  label,
  variant = 'primary',
  fullWidth = false,
  icon,
  size = 'default',
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const height = variant === 'primary' ? (size === 'large' ? 56 : 54) : 50;
  const textColor = variant === 'primary' ? theme.colors.textInverse : theme.colors.textPrimary;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.xxl,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          backgroundColor: variant === 'primary' ? theme.colors.textPrimary : 'transparent',
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth * 1.5 : 0,
          borderColor: theme.colors.borderStrong,
        },
      ]}
      {...rest}
    >
      {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
      <Text variant="button" uppercase style={{ color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
