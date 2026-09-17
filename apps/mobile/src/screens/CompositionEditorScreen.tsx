import { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, type LayoutChangeEvent } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, Slider, SegmentedControl, useTheme } from '@cor/design-system';
import { computeVehicleTransform } from '@cor/image-processing';
import { DEFAULT_COMPOSITION_SETTINGS, type CompositionSettings, type HorizontalPosition } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompositionEditor'>;

const POSITION_OPTIONS: { value: HorizontalPosition; label: string }[] = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
];

export function CompositionEditorScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source, sceneDescription, sceneThumbnail } = route.params;
  const theme = useTheme();
  const [settings, setSettings] = useState<CompositionSettings>(DEFAULT_COMPOSITION_SETTINGS);
  const [preview, setPreview] = useState({ width: 0, height: 0 });

  const update = <K extends keyof CompositionSettings>(key: K, value: CompositionSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const transform = computeVehicleTransform(settings);
  const vehicleWidth = preview.width * 0.56 * transform.scale;
  const vehicleHeight = vehicleWidth * (photoHeight / photoWidth);

  const onPreviewLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreview({ width, height });
  };

  const handleContinue = () => {
    const summary = `Posición ${settings.position}, escala ${settings.scale.toFixed(2)}x, rotación ${settings.rotation.toFixed(0)}°, distancia ${Math.round(settings.distance * 100)}%.`;
    const note = sceneDescription ? `${sceneDescription} — ${summary}` : summary;
    navigation.navigate('Placeholder', {
      title: 'Procesando',
      phase: 'Fase 9 — Pantalla de procesamiento',
      photoUri,
      note,
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
          Estos controles mueven y escalan el vehículo dentro de la escena — nunca lo deforman.
        </Text>

        <View
          onLayout={onPreviewLayout}
          style={[
            styles.preview,
            { borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {sceneThumbnail ? (
            <Image source={sceneThumbnail} style={styles.sceneBackground} resizeMode="cover" />
          ) : null}

          {preview.width > 0 ? (
            <Image
              source={{ uri: photoUri }}
              resizeMode="contain"
              style={{
                position: 'absolute',
                width: vehicleWidth,
                height: vehicleHeight,
                left: preview.width / 2 - vehicleWidth / 2 + transform.translateXRatio * preview.width,
                top: preview.height / 2 - vehicleHeight / 2 + transform.translateYRatio * preview.height,
                transform: [{ rotate: `${transform.rotationDeg}deg` }],
              }}
            />
          ) : null}
        </View>

        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.lg }}>
          <View>
            <Text variant="label" color="secondary" uppercase style={{ marginBottom: theme.spacing.sm }}>
              Posición
            </Text>
            <SegmentedControl options={POSITION_OPTIONS} value={settings.position} onChange={(v) => update('position', v)} />
          </View>

          <ControlSlider
            label="Escala"
            valueLabel={`${settings.scale.toFixed(2)}x`}
            value={settings.scale}
            min={0.6}
            max={1.4}
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
    aspectRatio: 4 / 3,
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
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
