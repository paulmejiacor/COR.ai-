import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({ label, variant = 'primary', fullWidth = false, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radii.pill,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xxl,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          backgroundColor:
            variant === 'primary' ? theme.colors.textPrimary : variant === 'secondary' ? 'transparent' : 'transparent',
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth * 1.5 : 0,
          borderColor: theme.colors.borderStrong,
        },
      ]}
      {...rest}
    >
      <Text
        variant="subtitle"
        style={{
          color: variant === 'primary' ? theme.colors.textInverse : theme.colors.textPrimary,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
