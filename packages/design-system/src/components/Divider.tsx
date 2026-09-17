import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export function Divider({ spacing }: { spacing?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: theme.colors.border,
          marginVertical: spacing ?? theme.spacing.lg,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
