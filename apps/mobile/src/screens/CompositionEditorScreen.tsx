import { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, PanResponder, StyleSheet, type LayoutChangeEvent, type GestureResponderEvent } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, Slider, SegmentedControl, useTheme } from '@cor/design-system';
import { computeVehicleTransform } from '@cor/image-processing';
import { DEFAULT_COMPOSITION_SETTINGS, type CompositionSettings, type HorizontalPosition } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompositionEditor'>;

const SCALE_MIN = 0.5;
const SCALE_MAX = 2.2;

const POSITION_OPTIONS: { value: HorizontalPosition; label: string }[] = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function distanceBetween(touches: Array<{ pageX: number; pageY: number }>) {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

export function CompositionEditorScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source, angle, sceneDescription, sceneThumbnail } = route.params;
  const theme = useTheme();
  const [settings, setSettings] = useState<CompositionSettings>(DEFAULT_COMPOSITION_SETTINGS);
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState({ width: 0, height: 0 });
  // 16:9 como respaldo — mucho más cercano a la proporción real de los 3
  // escenarios de COR (~1.78-1.81) que el 4:3 anterior, por si en algún
  // dispositivo `resolveAssetSource` no trae las dimensiones (ver abajo).
  const [sceneAspectRatio, setSceneAspectRatio] = useState(16 / 9);

  useEffect(() => {
    if (!sceneThumbnail) {
      setSceneAspectRatio(16 / 9);
      return;
    }
    let cancelled = false;

    // Escenarios remotos o personalizados (uri): no traen dimensiones, hay que consultarlas.
    if (typeof sceneThumbnail === 'object' && 'uri' in sceneThumbnail && sceneThumbnail.uri) {
      Image.getSize(
        sceneThumbnail.uri,
        (width, height) => {
          if (!cancelled && width > 0 && height > 0) setSceneAspectRatio(clamp(width / height, 0.6, 2));
        },
        () => {}
      );
      return () => {
        cancelled = true;
      };
    }

    // Escenarios locales (require): Metro normalmente resuelve width/height sin
    // red, pero si un dispositivo no las trae, medimos con getSize sobre el uri
    // resuelto en vez de quedarnos con el respaldo 16:9 genérico.
    const resolved = Image.resolveAssetSource(sceneThumbnail);
    if (resolved?.width && resolved?.height) {
      setSceneAspectRatio(clamp(resolved.width / resolved.height, 0.6, 2));
    } else if (resolved?.uri) {
      Image.getSize(
        resolved.uri,
        (width, height) => {
          if (!cancelled && width > 0 && height > 0) setSceneAspectRatio(clamp(width / height, 0.6, 2));
        },
        () => {}
      );
    }
    return () => {
      cancelled = true;
    };
  }, [sceneThumbnail]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const manualOffsetRef = useRef(manualOffset);
  useEffect(() => {
    manualOffsetRef.current = manualOffset;
  }, [manualOffset]);

  const gestureRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startTouchX: number;
    startTouchY: number;
    startOffsetX: number;
    startOffsetY: number;
    startDistance: number;
    startScale: number;
  }>({ mode: 'none', startTouchX: 0, startTouchY: 0, startOffsetX: 0, startOffsetY: 0, startDistance: 0, startScale: 1 });

  const update = <K extends keyof CompositionSettings>(key: K, value: CompositionSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handlePositionChange = (value: HorizontalPosition) => {
    update('position', value);
    setManualOffset({ x: 0, y: 0 });
  };

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
            startScale: settingsRef.current.scale,
          };
        } else {
          gestureRef.current = {
            mode: 'pan',
            startTouchX: touches[0].pageX,
            startTouchY: touches[0].pageY,
            startOffsetX: manualOffsetRef.current.x,
            startOffsetY: manualOffsetRef.current.y,
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
            gestureRef.current = {
              ...gesture,
              mode: 'pinch',
              startDistance: distanceBetween(touches),
              startScale: settingsRef.current.scale,
            };
            return;
          }
          const newScale = clamp((gesture.startDistance > 0 ? distanceBetween(touches) / gesture.startDistance : 1) * gesture.startScale, SCALE_MIN, SCALE_MAX);
          update('scale', newScale);
        } else if (touches.length === 1) {
          if (gesture.mode !== 'pan') {
            gestureRef.current = {
              ...gesture,
              mode: 'pan',
              startTouchX: touches[0].pageX,
              startTouchY: touches[0].pageY,
              startOffsetX: manualOffsetRef.current.x,
              startOffsetY: manualOffsetRef.current.y,
            };
            return;
          }
          const dx = touches[0].pageX - gesture.startTouchX;
          const dy = touches[0].pageY - gesture.startTouchY;
          setManualOffset({ x: gesture.startOffsetX + dx, y: gesture.startOffsetY + dy });
        }
      },
      onPanResponderRelease: () => {
        gestureRef.current.mode = 'none';
      },
    })
  ).current;

  const transform = computeVehicleTransform(settings);
  // El vehículo debe caber tanto en ancho como en alto dentro del escenario:
  // una foto en vertical dentro de un escenario panorámico, calculada solo a
  // partir del ancho, se sale del recuadro por arriba y abajo (recortada por
  // "overflow: hidden") dejando ver solo una franja del fondo.
  const photoAspectRatio = photoWidth / photoHeight;
  const widthCap = preview.width * 0.56 * transform.scale;
  const heightCap = preview.height * 0.72 * transform.scale;
  const vehicleWidth = Math.min(widthCap, heightCap * photoAspectRatio);
  const vehicleHeight = vehicleWidth / photoAspectRatio;

  const onPreviewLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreview({ width, height });
  };

  const handleContinue = () => {
    navigation.navigate('Processing', {
      photoUri,
      photoWidth,
      photoHeight,
      source,
      angle,
      sceneDescription,
      composition: settings,
    });
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Editor de composición" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SectionLabel>Composición</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          Ajusta la composición
        </Text>
        <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
          Arrastra el vehículo con un dedo o pellizca con dos para moverlo y escalarlo — igual que con los controles de abajo, nunca se deforma.
        </Text>

        <View
          onLayout={onPreviewLayout}
          style={[
            styles.preview,
            {
              aspectRatio: sceneAspectRatio,
              borderRadius: theme.radii.lg,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {sceneThumbnail ? (
            <Image source={sceneThumbnail} style={styles.sceneBackground} resizeMode="cover" />
          ) : null}

          {preview.width > 0 ? (
            <View
              {...panResponder.panHandlers}
              style={{
                position: 'absolute',
                width: vehicleWidth,
                height: vehicleHeight,
                left: preview.width / 2 - vehicleWidth / 2 + transform.translateXRatio * preview.width + manualOffset.x,
                top: preview.height / 2 - vehicleHeight / 2 + transform.translateYRatio * preview.height + manualOffset.y,
                transform: [{ rotate: `${transform.rotationDeg}deg` }],
              }}
            >
              <Image source={{ uri: photoUri }} resizeMode="contain" style={styles.vehicleImage} />
            </View>
          ) : null}
        </View>

        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.sm }}>
          Vista previa aproximada — la IA vuelve a generar toda la imagen, así que el resultado final no se recorta igual a este recuadro.
        </Text>

        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.lg }}>
          <View>
            <Text variant="label" color="secondary" uppercase style={{ marginBottom: theme.spacing.sm }}>
              Posición
            </Text>
            <SegmentedControl options={POSITION_OPTIONS} value={settings.position} onChange={handlePositionChange} />
          </View>

          <ControlSlider
            label="Escala"
            valueLabel={`${settings.scale.toFixed(2)}x`}
            value={settings.scale}
            min={SCALE_MIN}
            max={SCALE_MAX}
            onChange={(v) => update('scale', v)}
          />

          <ControlSlider
            label="Altura visual"
            valueLabel={settings.heightPerspective.toFixed(2)}
            value={settings.heightPerspective}
            min={-1}
            max={1}
            onChange={(v) => update('heightPerspective', v)}
          />

          <ControlSlider
            label="Distancia"
            valueLabel={`${Math.round(settings.distance * 100)}%`}
            value={settings.distance}
            min={0}
            max={1}
            onChange={(v) => update('distance', v)}
          />

          <ControlSlider
            label="Rotación (opcional)"
            valueLabel={`${settings.rotation.toFixed(0)}°`}
            value={settings.rotation}
            min={-15}
            max={15}
            onChange={(v) => update('rotation', v)}
          />
        </View>

        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button label="CONTINUAR" fullWidth onPress={handleContinue} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ControlSlider({
  label,
  valueLabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.sliderHeader}>
        <Text variant="label" color="secondary" uppercase>
          {label}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {valueLabel}
        </Text>
      </View>
      <View style={{ marginTop: theme.spacing.xs }}>
        <Slider value={value} min={min} max={max} onChange={onChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sceneBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
