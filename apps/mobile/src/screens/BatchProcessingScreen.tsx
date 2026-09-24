import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, useTheme } from '@cor/design-system';
import { resolveAIImageService, hasRealAIProvider } from '../lib/aiService';
import {
  DEFAULT_WATERMARK_SETTINGS,
  DEFAULT_COMPOSITION_SETTINGS,
  type SourcePhoto,
  type Vehicle,
  type Scene,
  type GenerationRequest,
} from '@cor/shared-types';
import type { RootStackParamList, BatchResultItem } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BatchProcessing'>;

let counter = 0;

/**
 * Procesa el lote una foto a la vez (no en paralelo) — más lento, pero
 * evita mandar N solicitudes simultáneas a fal.ai por accidente (costo y
 * límite de tasa) y deja mostrar un progreso real, foto por foto. Si una
 * falla, se salta y se sigue con las demás en vez de perder todo el lote.
 */
export function BatchProcessingScreen({ route, navigation }: Props) {
  const { photos, sceneDescription } = route.params;
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const results: BatchResultItem[] = [];
      let failed = 0;

      for (let i = 0; i < photos.length; i++) {
        if (cancelled) return;
        setIndex(i);

        const item = photos[i];
        const photo: SourcePhoto = {
          id: `photo_${Date.now()}_${counter++}`,
          uri: item.uri,
          width: item.width,
          height: item.height,
          capturedAt: new Date().toISOString(),
          source: 'gallery',
        };

        const vehicle: Vehicle = {
          id: `vehicle_${photo.id}`,
          sourcePhoto: photo,
          mask: {
            id: `mask_${photo.id}`,
            sourcePhotoId: photo.id,
            maskUri: photo.uri,
            previewUri: photo.uri,
            confidence: 0.97,
            edits: [],
            status: 'reviewed',
          },
          createdAt: new Date().toISOString(),
          vehicleLockEnabled: true,
        };

        const scene: Scene = { id: `scene_${photo.id}`, prompt: sceneDescription ?? '' };

        const request: GenerationRequest = {
          vehicle,
          scene,
          composition: DEFAULT_COMPOSITION_SETTINGS,
          watermark: DEFAULT_WATERMARK_SETTINGS,
          exportPresetId: 'original',
          vehicleLockEnabled: true,
        };

        try {
          const result = await resolveAIImageService().generate(request);
          if (cancelled) return;
          results.push({ photoUri: item.uri, resultImageUri: result.resultImageUri, photoWidth: item.width, photoHeight: item.height });
        } catch {
          failed += 1;
          setFailedCount(failed);
        }
      }

      if (cancelled) return;
      navigation.replace('BatchResult', { results, failedCount: failed, sceneDescription });
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        {!hasRealAIProvider() ? (
          <View style={[styles.demoBadge, { borderColor: theme.semantic.danger }]}>
            <Text variant="caption" uppercase style={{ color: theme.semantic.danger }}>
              Vista previa demo · sin IA real
            </Text>
          </View>
        ) : null}

        <Animated.View style={[styles.ring, { borderColor: theme.colors.accent, opacity: pulse }]} />

        <Text variant="title" align="center" style={{ marginTop: theme.spacing.xxl }}>
          Procesando foto {index + 1} de {photos.length}
        </Text>
        <Text variant="bodySmall" color="secondary" align="center" style={{ marginTop: theme.spacing.xs }}>
          No cierres la aplicación — esto puede tardar varios minutos con lotes grandes.
        </Text>
        {failedCount > 0 ? (
          <Text variant="bodySmall" style={{ marginTop: theme.spacing.sm, color: theme.semantic.danger }}>
            {failedCount} foto(s) fallaron y se están saltando.
          </Text>
        ) : null}

        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border, marginTop: theme.spacing.xxl }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.accent, width: `${((index + 1) / photos.length) * 100}%` },
            ]}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  demoBadge: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
