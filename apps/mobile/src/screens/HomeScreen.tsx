import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, Logo, CornerBrackets, Button, NavCard, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();

  const openPlaceholder = (title: string, phase: string) => navigation.navigate('Placeholder', { title, phase });

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <CornerBrackets size={22} thickness={5} />
          <Logo height={36} />
          <Text variant="label" color="secondary" uppercase style={styles.eyebrow}>
            AI Automotive Studio
          </Text>
          <Text variant="title" align="center" style={styles.tagline}>
            Transforma el escenario.{'\n'}Conserva el auto.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="NUEVA CREACIÓN" fullWidth onPress={() => navigation.navigate('NewCreation')} />

          <View style={[styles.grid, { marginTop: theme.spacing.lg }]}>
            <NavCard icon="folder" label="Mis proyectos" onPress={() => navigation.navigate('History')} />
            <NavCard
              icon="grid"
              label="Plantillas"
              onPress={() => openPlaceholder('Plantillas', 'Fase 7 — Selección de escenario')}
            />
            <NavCard
              icon="download"
              label="Exportaciones"
              onPress={() => openPlaceholder('Exportaciones', 'Fase 12 — Exportación')}
            />
            <NavCard
              icon="sliders"
              label="Configuración"
              onPress={() => openPlaceholder('Configuración', 'Fuera del roadmap de fases actual')}
            />
          </View>
        </View>

        <Text variant="caption" color="secondary" align="center" style={styles.footer}>
          COR · EST. 2024
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
  },
  eyebrow: {
    marginTop: 18,
  },
  tagline: {
    marginTop: 10,
  },
  actions: {
    marginTop: 56,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
