import { Alert, Image, ScrollView, View, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Surface, NavCard, Button, useTheme } from '@cor/design-system';
import { getStorageService } from '@cor/storage';
import type { Project } from '@cor/shared-types';
import { hasRealAIProvider } from '../lib/aiService';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

let counter = 0;

function guessFormat(uri: string) {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  return (match?.[1] ?? 'jpg').toUpperCase();
}

function buildProject(params: Props['route']['params']): Project {
  const { photoUri, photoWidth, photoHeight, source, angle, resultImageUri, sceneDescription, composition } = params;
  const now = new Date().toISOString();
  const photoId = `photo_${Date.now()}_${counter++}`;

  const vehicle: Project['vehicle'] = {
    id: `vehicle_${photoId}`,
    sourcePhoto: { id: photoId, uri: photoUri, width: photoWidth, height: photoHeight, capturedAt: now, source, angle },
    mask: {
      id: `mask_${photoId}`,
      sourcePhotoId: photoId,
      maskUri: photoUri,
      previewUri: photoUri,
      confidence: 0.97,
      edits: [],
      status: 'reviewed',
    },
    createdAt: now,
    vehicleLockEnabled: true,
  };

  const scene: Project['scene'] = { id: `scene_${photoId}`, prompt: sceneDescription ?? '' };

  const result: Project['latestResult'] = {
    id: `gen_${photoId}`,
    requestSnapshot: {
      vehicle,
      scene,
      composition,
      watermark: { variant: 'logo', corner: 'bottom_right', size: 0.35, opacity: 0.85 },
      exportPresetId: 'original',
      vehicleLockEnabled: true,
    },
    resultImageUri,
    integrityReport: { passed: true, flaggedAttributes: [] },
    createdAt: now,
  };

  return {
    id: `project_${photoId}`,
    name: sceneDescription ? sceneDescription.slice(0, 40) : 'Nuevo proyecto',
    createdAt: now,
    updatedAt: now,
    status: 'completed',
    vehicle,
    scene,
    latestResult: result,
    history: result ? [result] : [],
  };
}

export function ResultScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source, sceneDescription, sceneReferenceUri, composition, resultImageUri } =
    route.params;
  const theme = useTheme();

  const handleRegenerate = () =>
    navigation.replace('Processing', {
      photoUri,
      photoWidth,
      photoHeight,
      source,
      sceneDescription,
      sceneReferenceUri,
      composition,
    });

  const handleNewVersion = () => navigation.navigate('SceneSelection', { photoUri, photoWidth, photoHeight, source });

  const handleShare = async () => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(resultImageUri);
    } catch (error) {
      Alert.alert('No se pudo compartir', String(error));
    }
  };

  const handleSave = async () => {
    try {
      await getStorageService().saveProject(buildProject(route.params));
      Alert.alert('Guardado', 'El proyecto se guardó en Mis proyectos.');
    } catch (error) {
      Alert.alert('No se pudo guardar', String(error));
    }
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Resultado" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <Image
          source={{ uri: resultImageUri }}
          resizeMode="cover"
          style={[styles.result, { aspectRatio: photoWidth / photoHeight, borderRadius: theme.radii.lg }]}
        />

        <Surface style={{ marginTop: theme.spacing.lg }} bordered>
          <MetaRow label="Vehículo" value={source === 'camera' ? 'Fotografiado con cámara' : 'Seleccionado de galería'} />
          <MetaRow label="Escenario" value={sceneDescription || 'Descripción personalizada'} last />
          <MetaRow label="Resolución" value={`${photoWidth} × ${photoHeight}`} />
          <MetaRow label="Formato" value={guessFormat(resultImageUri)} last={hasRealAIProvider()} />
          {!hasRealAIProvider() ? (
            <MetaRow label="Proveedor de IA" value="Demo (sin conexión real)" last />
          ) : null}
        </Surface>

        <SectionLabel>Acciones</SectionLabel>
        <View style={[styles.grid, { marginTop: theme.spacing.md }]}>
          <NavCard icon="edit" label="Editar" onPress={() => navigation.goBack()} />
          <NavCard icon="refresh" label="Regenerar" onPress={handleRegenerate} />
          <NavCard
            icon="compare"
            label="Comparar"
            onPress={() => navigation.navigate('Compare', { beforeUri: photoUri, afterUri: resultImageUri, photoWidth, photoHeight })}
          />
          <NavCard
            icon="download"
            label="Exportar"
            onPress={() => navigation.navigate('Export', { resultImageUri, photoWidth, photoHeight })}
          />
          <NavCard icon="share" label="Compartir" onPress={handleShare} />
          <NavCard icon="save" label="Guardar" onPress={handleSave} />
        </View>

        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button label="CREAR OTRA VERSIÓN" fullWidth variant="secondary" onPress={handleNewVersion} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function MetaRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.metaRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
      ]}
    >
      <Text variant="bodySmall" color="secondary">
        {label}
      </Text>
      <Text variant="bodySmall" numberOfLines={1} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  result: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
