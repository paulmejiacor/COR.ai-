import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme';

export interface SectionLabelProps {
  children: string;
  align?: 'left' | 'center';
}

/** Etiqueta de sección tal como aparece en el manual de marca: mayúsculas, tracking amplio, subrayado fino. */
export function SectionLabel({ children, align = 'left' }: SectionLabelProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, align === 'center' && styles.center]}>
      <Text variant="label" color="secondary" uppercase>
        {children}
      </Text>
      <View
        style={[
          styles.underline,
          { backgroundColor: theme.colors.borderStrong },
          align === 'center' && styles.underlineCenter,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  center: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  underline: {
    marginTop: 6,
    height: 1,
    width: 28,
  },
  underlineCenter: {
    alignSelf: 'center',
  },
});
