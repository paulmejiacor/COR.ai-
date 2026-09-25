import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  PanResponder,
  ScrollView,
  View,
  StyleSheet,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, Slider, Logo, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlateBranding'>;

const SCALE_MIN = 0.3;
const SCALE_MAX = 3;

function distanceBetween(touches: Array<{ pageX: number; pageY: number }>) {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Tiempo agotado esperando: ${label}`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

const LOGO_BASE_HEIGHT = 40;

/**
 * La IA deja la placa como un rectángulo blanco liso (más consistente que
 * pedirle que dibuje texto/logos exactos — ver FalKontextAIImageService).
 * Aquí el usuario coloca el logo REAL de COR sobre esa placa a mano —
 * arrastrar/pellizcar igual que en el (extinto) editor de composición, más
 * un control de rotación — y se hornea a la resolución real de la imagen,
 * nunca a un lienzo más grande (la lección del recorte de Exportar).
 */
export function PlateBrandingScreen({ route, navigation }: Props) {
  const params = route.params;
  const { resultImageUri } = params;
  const theme = useTheme();

  const [realSize, setRealSize] = useState<{ width: number; height: number } | null>(null);
  const [preview, setPreview] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [saving, setSaving] = useState(false);

  const hiddenViewRef = useRef<View>(null);
  const baseImageLoadResolver = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    getImageSize(resultImageUri).then(
      (size) => {
        if (!cancelled) setRealSize(size);
      },
      () => {
        if (!cancelled) setRealSize({ width: params.photoWidth, height: params.photoHeight });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [resultImageUri, params.photoWidth, params.photoHeight]);

  const offsetRef = useRef(offset);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const gestureRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startTouchX: number;
    startTouchY: number;
    startOffsetX: number;
    startOffsetY: number;
    startDistance: number;
    startScale: number;
  }>({ mode: 'none', startTouchX: 0, startTouchY: 0, startOffsetX: 0, startOffsetY: 0, startDistance: 0, startScale: 1 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          gestureRef.current = {
            mode: 'pinch',
            startTouchX: 0,
            startTouchY: 0,
            startOffsetX: 0,
            startOffsetY: 0,
            startDistance: distanceBetween(touches),
            startScale: scaleRef.current,
          };
        } else {
          gestureRef.current = {
            mode: 'pan',
            startTouchX: touches[0].pageX,
            startTouchY: touches[0].pageY,
            startOffsetX: offsetRef.current.x,
            startOffsetY: offsetRef.current.y,
            startDistance: 0,
            startScale: 1,
          };
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;
        const gesture = gestureRef.current;

        if (touches.length >= 2) {
          if (gesture.mode !== 'pinch') {
            gestureRef.current = { ...gesture, mode: 'pinch', startDistance: distanceBetween(touches), startScale: scaleRef.current };
            return;
          }
          const newScale = clamp(
            (gesture.startDistance > 0 ? distanceBetween(touches) / gesture.startDistance : 1) * gesture.startScale,
            SCALE_MIN,
            SCALE_MAX
          );
          setScale(newScale);
        } else if (touches.length === 1) {
          if (gesture.mode !== 'pan') {
            gestureRef.current = {
              ...gesture,
              mode: 'pan',
              startTouchX: touches[0].pageX,
              startTouchY: touches[0].pageY,
              startOffsetX: offsetRef.current.x,
              startOffsetY: offsetRef.current.y,
            };
            return;
          }
          const dx = touches[0].pageX - gesture.startTouchX;
          const dy = touches[0].pageY - gesture.startTouchY;
          setOffset({ x: gesture.startOffsetX + dx, y: gesture.startOffsetY + dy });
        }
      },
      onPanResponderRelease: () => {
        gestureRef.current.mode = 'none';
      },
    })
  ).current;

  const onPreviewLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreview({ width, height });
  };

  const logoWidth = LOGO_BASE_HEIGHT * scale * (759 / 264);
  const logoHeight = LOGO_BASE_HEIGHT * scale;

  const handleSave = async () => {
    if (!realSize) return;
    setSaving(true);
    try {
      // El lienzo de captura se pinta al tamaño de vista previa (preview.width),
      // pero el logo se posicionó en esas mismas coordenadas — al pedirle a
      // captureRef que rasterice a la resolución REAL (realSize), reescala
      // proporcionalmente todo el contenido de la vista, logo incluido.
      const baseReady = new Promise<void>((resolve) => {
        baseImageLoadResolver.current = resolve;
      });
      await withTimeout(baseReady, 6000, 'cargar la foto');

      const rawUri = await withTimeout(
        captureRef(hiddenViewRef, { format: 'png', quality: 1, result: 'tmpfile', width: realSize.width, height: realSize.height }),
        8000,
        'aplicar el logo en la placa'
      );

      navigation.replace('Result', { ...params, resultImageUri: rawUri });
    } catch (error) {
      Alert.alert('No se pudo aplicar el logo', String(error));
    } finally {
      setSaving(false);
    }
  };

  const aspectRatio = realSize ? realSize.width / realSize.height : params.photoWidth / params.photoHeight;

  return (
    <Screen padded={false}>
      {/* Vista de captura oculta — pintada dentro de los límites reales de la
          pantalla (ver la misma lección en ExportScreen) para que Android no
          la deje en blanco por estar fuera de la pantalla. */}
      <View
        ref={hiddenViewRef}
        collapsable={false}
        style={{ position: 'absolute', top: 0, left: 0, width: preview.width || 1, height: preview.width ? preview.width / aspectRatio : 1 }}
      >
        <Image
          source={{ uri: resultImageUri }}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          onLoad={() => baseImageLoadResolver.current?.()}
        />
        {preview.width > 0 ? (
          <View
            collapsable={false}
            style={{
              position: 'absolute',
              width: logoWidth,
              height: logoHeight,
              left: preview.width / 2 - logoWidth / 2 + offset.x,
              top: (preview.width / aspectRatio) / 2 - logoHeight / 2 + offset.y,
              transform: [{ rotate: `${rotation}deg` }],
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Logo tone="dark" height={logoHeight * 0.7} />
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Logo en la placa" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SectionLabel>Marca COR</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          Coloca el logo sobre la placa
        </Text>
        <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
          Arrastra el logo con un dedo, pellizca con dos para escalarlo, y usa el control de abajo para rotarlo hasta que
          quede alineado con la placa.
        </Text>

        <View
          onLayout={onPreviewLayout}
          style={[styles.preview, { aspectRatio, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Image source={{ uri: resultImageUri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
          {preview.width > 0 ? (
            <View
              {...panResponder.panHandlers}
              style={{
                position: 'absolute',
                width: logoWidth,
                height: logoHeight,
                left: preview.width / 2 - logoWidth / 2 + offset.x,
                top: preview.height / 2 - logoHeight / 2 + offset.y,
                transform: [{ rotate: `${rotation}deg` }],
                backgroundColor: 'rgba(255,255,255,0.94)',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
              }}
            >
              <Logo tone="dark" height={logoHeight * 0.7} />
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>
          <View style={styles.sliderHeader}>
            <Text variant="label" color="secondary" uppercase>
              Rotación
            </Text>
            <Text variant="bodySmall" color="secondary">
              {rotation.toFixed(0)}°
            </Text>
          </View>
          <View style={{ marginTop: theme.spacing.xs }}>
            <Slider value={rotation} min={-45} max={45} onChange={setRotation} />
          </View>
        </View>

        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button label={saving ? 'APLICANDO…' : 'GUARDAR LOGO'} fullWidth onPress={handleSave} disabled={saving || !realSize} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
