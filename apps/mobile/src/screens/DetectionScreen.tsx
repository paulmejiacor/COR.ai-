import { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, Easing, StyleSheet, type LayoutChangeEvent } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, Button, CornerBrackets, useTheme } from '@cor/design-system';
import { getAIImageService } from '@cor/ai-image-service';
import type { SourcePhoto, VehicleMask } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detection'>;

type Status = 'analyzing' | 'detected';

/**
 * Fase 6 — pantalla de preparación: la IA (mock por ahora) separa el
 * vehículo del fondo. Muestra "Vehículo detectado" con una previsualización
 * del área protegida y ofrece "Revisar selección" para corregirla a mano.
 */
export function DetectionScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source } = route.params;
  const theme = useTheme();
  const [status, setStatus] = useState<Status>('analyzing');
  const [mask, setMask] = useState<VehicleMask | null>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    let cancelled = false;
    const photo: SourcePhoto = {
      id: `photo_${Date.now()}`,
      uri: photoUri,
      width: photoWidth,
      height: photoHeight,
      capturedAt: new Date().toISOString(),
      source,
    };
    getAIImageService()
      .detectVehicle(photo)
      .then(({ mask: detected }) => {
        if (cancelled) return;
        setMask(detected);
        setStatus('detected');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri]);

  useEffect(() => {
    if (status !== 'analyzing') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const onFrameLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrame({ width, height });
  };

  const rect =
    frame.width > 0
      ? {
          left: frame.width * 0.08,
          right: frame.width * 0.92,
          top: frame.height * 0.26,
          bottom: frame.height * 0.88,
        }
      : null;

  const goToSceneSelection = () =>
    navigation.navigate('Placeholder', {
      title: 'Escenario',
      phase: 'Fase 7 — Selección de escenario',
      photoUri,
    });

  return (
    <Screen>
      <Header title="Detección" onBack={() => navigation.goBack()} />

      <View style={{ paddingTop: theme.spacing.lg, flex: 1 }}>
        <View
          style={[styles.frame, { aspectRatio: photoWidth / photoHeight, borderRadius: theme.radii.lg }]}
          onLayout={onFrameLayout}
        >
          <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />

          {status === 'analyzing' && (
            <Animated.View style={[styles.scrim, { opacity: pulse }]}>
              <CornerBrackets size={26} thickness={6} color="#FFFFFF" />
            </Animated.View>
          )}

          {status === 'detected' && rect && (
            <>
              <View style={[styles.scrimBar, { top: 0, left: 0, right: 0, height: rect.top }]} />
              <View style={[styles.scrimBar, { bottom: 0, left: 0, right: 0, height: frame.height - rect.bottom }]} />
              <View style={[styles.scrimBar, { top: rect.top, height: rect.bottom - rect.top, left: 0, width: rect.left }]} />
              <View
                style={[
                  styles.scrimBar,
                  { top: rect.top, height: rect.bottom - rect.top, right: 0, width: frame.width - rect.right },
                ]}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: rect.left,
                  top: rect.top,
                  width: rect.right - rect.left,
                  height: rect.bottom - rect.top,
                  borderWidth: 2,
                  borderColor: theme.colors.accent,
                  borderRadius: theme.radii.md,
                }}
              />
            </>
          )}
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>
          {status === 'analyzing' ? (
            <>
              <Text variant="title">Analizando vehículo...</Text>
              <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                Estamos separando el vehículo del fondo para protegerlo durante todo el proceso.
              </Text>
            </>
          ) : (
            <>
              <Text variant="title">Vehículo detectado</Text>
              <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                Confianza de detección: {Math.round((mask?.confidence ?? 0) * 100)}%. Esta será la unidad protegida
                durante toda la generación.
              </Text>
            </>
          )}
        </View>

        {status === 'detected' && (
          <View style={{ marginTop: 'auto', paddingBottom: theme.spacing.xl, gap: theme.spacing.sm }}>
            <Button label="CONTINUAR" fullWidth onPress={goToSceneSelection} />
            <Button
              label="Revisar selección"
              variant="secondary"
              fullWidth
              onPress={() => navigation.navigate('MaskReview', { photoUri, photoWidth, photoHeight, source })}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrimBar: {
    position: 'absolute',
    backgroundColor: 'rgba(10,10,10,0.72)',
  },
});
