import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Image, StyleSheet } from 'react-native';
import { Screen, Header, Text, SectionLabel, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

/** Destino temporal de los botones cuyo flujo real todavía no se construye en esta fase. */
export function PlaceholderScreen({ route, navigation }: Props) {
  const { title, phase, photoUri, note } = route.params;
  const theme = useTheme();

  return (
    <Screen>
      <Header title={title} onBack={() => navigation.goBack()} />
      <View style={[styles.body, { paddingTop: theme.spacing.xxxl }]}>
        <SectionLabel>{phase}</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          {title}
        </Text>

        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={[styles.preview, { borderRadius: theme.radii.lg, marginTop: theme.spacing.lg }]} />
            <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
              El contenido completo de esta pantalla se construye en una fase posterior del plan acordado.
            </Text>
            {note ? (
              <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.sm, fontStyle: 'italic' }}>
                "{note}"
              </Text>
            ) : null}
          </>
        ) : (
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm }}>
            Esta pantalla se construye en una fase posterior del plan acordado.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});
