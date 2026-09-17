import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { typeScale } from '../tokens/typography';

export type TextVariant = keyof typeof typeScale;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'inverse' | 'accent';
  uppercase?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'body',
  color = 'primary',
  uppercase = false,
  align = 'left',
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const typeStyle = theme.type[variant];
  const colorMap = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    inverse: theme.colors.textInverse,
    accent: theme.colors.accent,
  };

  return (
    <RNText
      style={[
        styles.base,
        {
          fontFamily: typeStyle.fontFamily,
          fontSize: typeStyle.fontSize,
          lineHeight: typeStyle.lineHeight,
          letterSpacing: typeStyle.letterSpacing,
          color: colorMap[color],
          textAlign: align,
          textTransform: uppercase ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
