import { useCallback, useState } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, Logo, CornerBrackets, Button, NavCard, SectionLabel, useTheme } from '@cor/design-system';
import { getStorageService } from '@cor/storage';
import type { Project } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HERO_IMAGE = require('../../assets/scenes/cor-lobby-dark.jpg');

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const [recent, setRecent] = useState<Project[]>([]);

  const openPlaceholder = (title: string, phase: string) => navigation.navigate('Placeholder', { title, phase });

  useFocusEffect(
    useCallback(() => {
      getStorageService()
        .listProjects()
        .then((projects) => setRecent(projects.filter((p) => p.status === 'completed').slice(0, 8)))
        .catch(() => setRecent([]));
    }, [])
  );

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Image source={HERO_IMAGE} resizeMode="cover" style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(10,10,10,0.55)', 'rgba(10,10,10,0.15)', 'rgba(10,10,10,0.7)', '#0A0A0A']}
            locations={[0, 0.38, 0.72, 1]}
            style={StyleSheet.absoluteFill}
          />
          <CornerBrackets size={22} thickness={5} color="rgba(222,222,216,0.5)" style={styles.heroBrackets} />

          <View style={styles.heroContent}>
            <Logo height={38} />
            <Text variant="label" color="secondary" uppercase style={styles.eyebrow}>
              AI Automotive Studio
            </Text>
            <Text variant="hero" align="center" style={{ color: theme.colors.textPrimary }}>
              Transforma el escenario.{'\n'}Conserva el auto.
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <View style={{ marginTop: 22 }}>
            <Button
              label="NUEVA CREACIÓN"
              icon="camera"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('Camera')}
            />
          </View>

          <View style={[styles.grid, { marginTop: 14 }]}>
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
            <NavCard icon="sliders" label="Configuración" onPress={() => navigation.navigate('Settings')} />
          </View>

          {recent.length > 0 ? (
            <View style={{ marginTop: 34 }}>
              <View style={styles.recentHeader}>
                <SectionLabel>Recientes</SectionLabel>
                <Text variant="bodySmall" color="primary" onPress={() => navigation.navigate('History')}>
                  Ver todo ›
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, marginTop: 14 }}
              >
                {recent.map((project) => (
                  <View key={project.id} style={styles.recentCard}>
                    <Image
                      source={{ uri: project.latestResult?.resultImageUri ?? project.vehicle.sourcePhoto.uri }}
                      style={[styles.recentThumb, { borderColor: theme.colors.border, borderRadius: theme.radii.thumb }]}
                    />
                    <Text variant="brand" color="accent" style={{ marginTop: 8 }}>
                      COR
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1} style={{ marginTop: 2, width: 176 }}>
                      {project.name || 'Proyecto'}
                    </Text>
                    <Text variant="caption" color="secondary" numberOfLines={1} style={{ width: 176 }}>
                      {project.scene.prompt || 'Escenario personalizado'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <Text variant="caption" color="secondary" align="center" style={styles.footer}>
          COR · EST. 2024
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 44,
  },
  hero: {
    height: 452,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBrackets: {
    left: 24,
    right: 24,
    top: 212,
    bottom: 10,
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    alignItems: 'center',
    gap: 16,
  },
  eyebrow: {
    letterSpacing: 3.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recentCard: {
    alignItems: 'flex-start',
  },
  recentThumb: {
    width: 176,
    height: 116,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    marginTop: 36,
    paddingBottom: 8,
    letterSpacing: 2,
  },
});
