import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, TextInput, View, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { ImageResult } from 'expo-image-manipulator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen,
  Header,
  Text,
  SectionLabel,
  Button,
  SegmentedControl,
  Slider,
  Logo,
  LOGO_ASPECT_RATIO,
  useTheme,
} from '@cor/design-system';
import { EXPORT_PRESETS, type ExportPresetId, type ExportFileFormat, type WatermarkVariant, type WatermarkCorner } from '@cor/shared-types';
import { resolveExportSpec, computeWatermarkLayout } from '@cor/image-processing';
import type { RootStackParamList } from '../navigation/types';
import { exportImageToSpec } from '../lib/exportImage';

type Props = NativeStackScreenProps<RootStackParamList, 'Export'>;

const FORMAT_TILES: Array<{ id: ExportPresetId; label: string; subtitle: string }> = [
  { id: 'instagram_post', label: 'Instagram Post', subtitle: '1080 × 1080' },
  { id: 'instagram_story', label: 'Instagram Story', subtitle: '1080 × 1920' },
  { id: 'web', label: 'Web', subtitle: '1600 × 900' },
  { id: 'whatsapp', label: 'WhatsApp', subtitle: '1080 × 1080' },
  { id: 'facebook', label: 'Facebook', subtitle: '1200 × 630' },
  { id: 'original', label: 'Original', subtitle: 'Alta resolución' },
  { id: 'custom', label: 'Personalizado', subtitle: 'A tu medida' },
];

const WATERMARK_OPTIONS: { value: WatermarkVariant; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'logo_name', label: 'Logo + nombre' },
  { value: 'none', label: 'Sin marca' },
];

const CORNER_OPTIONS: { value: WatermarkCorner; label: string }[] = [
  { value: 'top_left', label: 'Sup. izquierda' },
  { value: 'top_right', label: 'Sup. derecha' },
  { value: 'bottom_left', label: 'Inf. izquierda' },
  { value: 'bottom_right', label: 'Inf. derecha' },
];

const FORMAT_OPTIONS: { value: ExportFileFormat; label: string }[] = [
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

export function ExportScreen({ route, navigation }: Props) {
  const { resultImageUri, photoWidth, photoHeight } = route.params;
  const theme = useTheme();

  const [presetId, setPresetId] = useState<ExportPresetId>('instagram_post');
  const [customWidth, setCustomWidth] = useState(String(photoWidth));
  const [customHeight, setCustomHeight] = useState(String(photoHeight));
  const [customFormat, setCustomFormat] = useState<ExportFileFormat>('jpg');

  const [watermarkVariant, setWatermarkVariant] = useState<WatermarkVariant>('logo');
  const [watermarkCorner, setWatermarkCorner] = useState<WatermarkCorner>('bottom_right');
  const [watermarkSize, setWatermarkSize] = useState(0.35);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.85);

  const [preview, setPreview] = useState({ width: 0, height: 0 });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ImageResult | null>(null);

  const watermarkLayout = computeWatermarkLayout({
    variant: watermarkVariant,
    corner: watermarkCorner,
    size: watermarkSize,
    opacity: watermarkOpacity,
  });

  let watermarkBox: { left: number; top: number; width: number; height: number } | null = null;
  if (watermarkLayout && preview.width > 0) {
    const width = preview.width * watermarkLayout.widthRatio;
    const height = width / LOGO_ASPECT_RATIO;
    const anchorX = preview.width * watermarkLayout.xRatio;
    const anchorY = preview.height * watermarkLayout.yRatio;
    const isRight = watermarkCorner.includes('right');
    const isBottom = watermarkCorner.includes('bottom');
    watermarkBox = {
      left: isRight ? anchorX - width : anchorX,
      top: isBottom ? anchorY - height : anchorY,
      width,
      height,
    };
  }

  const handleExport = async () => {
    setExporting(true);
    setExported(null);
    try {
      const custom =
        presetId === 'custom'
          ? { width: parseInt(customWidth, 10) || photoWidth, height: parseInt(customHeight, 10) || photoHeight, format: customFormat }
          : undefined;
      const spec = resolveExportSpec(presetId, custom);
      const result = await exportImageToSpec(resultImageUri, photoWidth, photoHeight, spec);
      setExported(result);
    } catch (error) {
      Alert.alert('No se pudo exportar', String(error));
    } finally {
      setExporting(false);
    }
  };

  const handleShareExported = async () => {
    if (!exported) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(exported.uri);
    } catch (error) {
      Alert.alert('No se pudo compartir', String(error));
    }
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Exportar" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SectionLabel>Exportar</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          Elige el formato
        </Text>

        <View
          onLayout={(e) => setPreview({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          style={[
            styles.preview,
            { aspectRatio: photoWidth / photoHeight, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface },
          ]}
        >
          <Image source={{ uri: resultImageUri }} resizeMode="cover" style={styles.previewImage} />
          {watermarkBox ? (
            <View style={[styles.watermarkBox, watermarkBox, { opacity: watermarkOpacity }]} pointerEvents="none">
              <Logo height={watermarkBox.height} tone="light" />
              {watermarkVariant === 'logo_name' ? (
                <Text variant="caption" style={styles.watermarkCaption} numberOfLines={1}>
                  AI AUTOMOTIVE STUDIO
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={[styles.grid, { marginTop: theme.spacing.lg }]}>
          {FORMAT_TILES.map((tile) => {
            const selected = tile.id === presetId;
            return (
              <Pressable
                key={tile.id}
                onPress={() => setPresetId(tile.id)}
                style={[
                  styles.tile,
                  {
                    borderRadius: theme.radii.md,
                    backgroundColor: theme.colors.surface,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text variant="bodySmall" color={selected ? 'accent' : 'primary'}>
                  {tile.label}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  {tile.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {presetId === 'custom' ? (
          <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
            <View style={styles.customRow}>
              <TextInput
                value={customWidth}
                onChangeText={setCustomWidth}
                keyboardType="number-pad"
                placeholder="Ancho"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.customInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />
              <Text variant="body" color="secondary">
                ×
              </Text>
              <TextInput
                value={customHeight}
                onChangeText={setCustomHeight}
                keyboardType="number-pad"
                placeholder="Alto"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.customInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />
            </View>
            <SegmentedControl options={FORMAT_OPTIONS} value={customFormat} onChange={setCustomFormat} />
          </View>
        ) : null}

        <SectionLabel>Marca COR</SectionLabel>
        <View style={{ marginTop: theme.spacing.md }}>
          <SegmentedControl options={WATERMARK_OPTIONS} value={watermarkVariant} onChange={setWatermarkVariant} />
        </View>

        {watermarkVariant !== 'none' ? (
          <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.lg }}>
            <View style={styles.cornerGrid}>
              {CORNER_OPTIONS.map((opt) => {
                const selected = opt.value === watermarkCorner;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setWatermarkCorner(opt.value)}
                    style={[
                      styles.cornerChip,
                      {
                        borderRadius: theme.radii.sm,
                        borderColor: selected ? theme.colors.accent : theme.colors.border,
                        backgroundColor: selected ? `${theme.colors.accent}26` : 'transparent',
                      },
                    ]}
                  >
                    <Text variant="bodySmall" color={selected ? 'accent' : 'secondary'}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <View style={styles.sliderHeader}>
                <Text variant="label" color="secondary" uppercase>
                  Tamaño
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {Math.round(watermarkSize * 100)}%
                </Text>
              </View>
              <View style={{ marginTop: theme.spacing.xs }}>
                <Slider value={watermarkSize} min={0.1} max={1} onChange={setWatermarkSize} />
              </View>
            </View>

            <View>
              <View style={styles.sliderHeader}>
                <Text variant="label" color="secondary" uppercase>
                  Opacidad
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {Math.round(watermarkOpacity * 100)}%
                </Text>
              </View>
              <View style={{ marginTop: theme.spacing.xs }}>
                <Slider value={watermarkOpacity} min={0.2} max={1} onChange={setWatermarkOpacity} />
              </View>
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button label={exporting ? 'EXPORTANDO…' : 'EXPORTAR'} fullWidth onPress={handleExport} disabled={exporting} />
        </View>

        {exported ? (
          <View
            style={[
              styles.resultBox,
              { marginTop: theme.spacing.lg, borderRadius: theme.radii.lg, borderColor: theme.colors.border },
            ]}
          >
            <Image source={{ uri: exported.uri }} resizeMode="cover" style={styles.resultThumb} />
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall">Exportación lista</Text>
              <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                {exported.width} × {exported.height}
              </Text>
              <Pressable onPress={handleShareExported} style={{ marginTop: theme.spacing.xs }}>
                <Text variant="bodySmall" color="accent">
                  Compartir archivo
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  watermarkBox: {
    position: 'absolute',
    alignItems: 'flex-start',
  },
  watermarkCaption: {
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '31%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderStyle: 'solid',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  cornerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cornerChip: {
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultBox: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  resultThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
});
