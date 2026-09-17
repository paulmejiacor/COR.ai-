import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';

export interface HeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Header minimalista propio — reemplaza el header nativo en todas las pantallas para mantener el look COR. */
export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
            <Icon name="chevronLeft" size={20} />
          </Pressable>
        ) : null}
      </View>
      <Text variant="label" uppercase color="secondary" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  side: {
    width: 40,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
