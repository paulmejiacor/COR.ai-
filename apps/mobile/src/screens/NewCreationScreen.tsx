import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, OptionTile, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewCreation'>;

/**
 * Fase 4 — punto de entrada del flujo de creación: elegir el origen de la
 * fotografía. La captura real de cámara/galería es la Fase 5; por ahora
 * ambas opciones llevan al placeholder de esa fase.
 */
export function NewCreationScreen({ navigation }: Props) {
  const theme = useTheme();

  const goToCapture = (source: 'Tomar foto' | 'Usar galería') =>
    navigation.navigate('Placeholder', { title: source, phase: 'Fase 5 — Carga de fotografía (cámara/galería)' });

  return (
    <Screen>
      <Header title="Nueva creación" onBack={() => navigation.goBack()} />

      <View style={[styles.body, { paddingTop: theme.spacing.xxxl }]}>
        <SectionLabel>Nuevo vehículo</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          ¿Cómo quieres empezar?
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl }}>
          Elige el origen de la fotografía. En el siguiente paso podrás revisar que el vehículo quedó bien seleccionado.
        </Text>

        <View style={{ gap: theme.spacing.md }}>
          <OptionTile
            icon="camera"
            title="Tomar foto"
            description="Abre la cámara y fotografía el vehículo ahora."
            onPress={() => goToCapture('Tomar foto')}
          />
          <OptionTile
            icon="image"
            title="Usar galería"
            description="Elige una fotografía existente del vehículo."
            onPress={() => goToCapture('Usar galería')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
