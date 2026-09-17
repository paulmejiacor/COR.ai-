import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, OptionTile, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';
import type { SourcePhoto } from '@cor/shared-types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewCreation'>;

let photoCounter = 0;

/**
 * Fase 4 — punto de entrada del flujo de creación: elegir el origen de la
 * fotografía. La captura de cámara (Fase 5) vive en su propia pantalla;
 * la galería se resuelve aquí mismo con el selector nativo del sistema.
 */
export function NewCreationScreen({ navigation }: Props) {
  const theme = useTheme();
  const [pickingGallery, setPickingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const goToDetection = (photo: SourcePhoto) =>
    navigation.navigate('Placeholder', {
      title: 'Foto seleccionada',
      phase: 'Fase 6 — Detección del vehículo',
      photoUri: photo.uri,
    });

  const handleGallery = async () => {
    setGalleryError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setGalleryError('Necesitamos acceso a tus fotos para elegir el vehículo.');
      return;
    }

    setPickingGallery(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      goToDetection({
        id: `photo_${Date.now()}_${photoCounter++}`,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        capturedAt: new Date().toISOString(),
        source: 'gallery',
      });
    } finally {
      setPickingGallery(false);
    }
  };

  return (
    <Screen>
      <Header title="Nueva creación" onBack={() => navigation.goBack()} />

      <View style={[styles.body, { paddingTop: theme.spacing.xxxl }]}>
        <SectionLabel>Nuevo vehículo</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          ¿Cómo quieres empezar?
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl }}>
          Elige el origen de la fotografía. En el siguiente paso podrás revisar que el vehículo quedó bien seleccionado.
        </Text>

        <View style={{ gap: theme.spacing.md }}>
          <OptionTile
            icon="camera"
            title="Tomar foto"
            description="Abre la cámara y fotografía el vehículo ahora."
            onPress={() => navigation.navigate('Camera')}
          />
          <OptionTile
            icon="image"
            title="Usar galería"
            description={pickingGallery ? 'Abriendo galería…' : 'Elige una fotografía existente del vehículo.'}
            onPress={handleGallery}
          />
        </View>

        {galleryError ? (
          <Text variant="bodySmall" style={{ color: theme.semantic.danger, marginTop: theme.spacing.md }}>
            {galleryError}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
