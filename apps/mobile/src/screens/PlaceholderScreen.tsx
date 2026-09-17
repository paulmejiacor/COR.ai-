import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Screen, Header, Text, SectionLabel, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

/** Destino temporal de los botones de Home cuyo flujo real todavía no se construye en esta fase. */
export function PlaceholderScreen({ route, navigation }: Props) {
  const { title, phase } = route.params;
  const theme = useTheme();

  return (
    <Screen>
      <Header title={title} onBack={() => navigation.goBack()} />
      <View style={[styles.body, { paddingTop: theme.spacing.xxxl }]}>
        <SectionLabel>{phase}</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          {title}
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm }}>
          Esta pantalla se construye en una fase posterior del plan acordado.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
