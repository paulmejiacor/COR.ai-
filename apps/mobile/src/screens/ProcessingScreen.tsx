import { useEffect, useRef, useState } from 'react';
import { Alert, View, Animated, Easing, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, Icon, useTheme } from '@cor/design-system';
import { resolveAIImageService } from '../lib/aiService';
import {
  GENERATION_STAGE_LABEL_ES,
  DEFAULT_WATERMARK_SETTINGS,
  type GenerationStage,
  type SourcePhoto,
  type Vehicle,
  type Scene,
  type GenerationRequest,
} from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

const STAGE_ORDER = Object.keys(GENERATION_STAGE_LABEL_ES) as GenerationStage[];

let counter = 0;

export function ProcessingScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source, angle, sceneDescription, composition } = route.params;
  const theme = useTheme();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
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

    const photo: SourcePhoto = {
      id: `photo_${Date.now()}_${counter++}`,
      uri: photoUri,
      width: photoWidth,
      height: photoHeight,
      capturedAt: new Date().toISOString(),
      source,
      angle,
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

    const scene: Scene = {
      id: `scene_${photo.id}`,
      prompt: sceneDescription ?? '',
    };

    const request: GenerationRequest = {
      vehicle,
      scene,
      composition,
      watermark: DEFAULT_WATERMARK_SETTINGS,
      exportPresetId: 'original',
      vehicleLockEnabled: true,
    };

    resolveAIImageService()
      .generate(request, (event) => {
        if (cancelled) return;
        setStageIndex(STAGE_ORDER.indexOf(event.stage));
        setProgress(event.progress);
      })
      .then((result) => {
        if (cancelled) return;
        navigation.replace('Result', {
          resultImageUri: result.resultImageUri,
          photoUri,
          photoWidth,
          photoHeight,
          source,
          angle,
          sceneDescription,
          composition,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        Alert.alert('No se pudo generar la imagen', String(error?.message ?? error), [
          { text: 'Volver', onPress: () => navigation.goBack() },
        ]);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri]);

  return (
    <Screen>
      <View style={styles.container}>
        <Animated.View style={[styles.ring, { borderColor: theme.colors.accent, opacity: pulse }]} />

        <Text variant="title" align="center" style={{ marginTop: theme.spacing.xxl }}>
          {GENERATION_STAGE_LABEL_ES[STAGE_ORDER[stageIndex]]}
        </Text>
        <Text variant="bodySmall" color="secondary" align="center" style={{ marginTop: theme.spacing.xs }}>
          Esto puede tardar unos segundos. No cierres la aplicación.
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border, marginTop: theme.spacing.xxl }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.colors.accent, width: `${progress * 100}%` }]} />
        </View>

        <View style={{ marginTop: theme.spacing.xxl, width: '100%', gap: theme.spacing.md }}>
          {STAGE_ORDER.map((stage, index) => {
            const status = index < stageIndex ? 'done' : index === stageIndex ? 'active' : 'pending';
            return (
              <View key={stage} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      borderColor: status === 'pending' ? theme.colors.border : theme.colors.accent,
                      backgroundColor: status === 'done' ? theme.colors.accent : 'transparent',
                    },
                  ]}
                >
                  {status === 'done' ? <Icon name="check" size={11} color={theme.colors.textInverse} /> : null}
                </View>
                <Text variant="bodySmall" color={status === 'pending' ? 'secondary' : 'primary'}>
                  {GENERATION_STAGE_LABEL_ES[stage]}
                </Text>
              </View>
            );
          })}
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
    paddingHorizontal: 8,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
