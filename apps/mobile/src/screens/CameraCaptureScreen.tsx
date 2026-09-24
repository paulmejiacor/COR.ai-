import { useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, Button, Icon, Chip, CornerBrackets, useTheme } from '@cor/design-system';
import { normalizeCapturedPhoto } from '../lib/normalizePhoto';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const ANGLES = ['Frontal 3/4', 'Lateral', 'Trasera 3/4', 'Frontal', 'Trasera', 'Interior'];

export function CameraCaptureScreen({ navigation }: Props) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [pickingGallery, setPickingGallery] = useState(false);
  const [angle, setAngle] = useState(ANGLES[0]);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!photo) return;

      const normalized = await normalizeCapturedPhoto(photo.uri);

      navigation.replace('SceneSelection', {
        photoUri: normalized.uri,
        photoWidth: normalized.width,
        photoHeight: normalized.height,
        source: 'camera',
        angle,
      });
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    setPickingGallery(true);
    try {
      // allowsMultipleSelection habilita elegir el lote completo de fotos del
      // auto de una vez — con 1 sola foto elegida, el flujo sigue exactamente
      // igual que antes (batchPhotos queda undefined).
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const normalized = await Promise.all(result.assets.map((asset) => normalizeCapturedPhoto(asset.uri)));
      const [first, ...rest] = normalized;

      navigation.replace('SceneSelection', {
        photoUri: first.uri,
        photoWidth: first.width,
        photoHeight: first.height,
        source: 'gallery',
        batchPhotos: rest.length > 0 ? normalized.map((p) => ({ uri: p.uri, width: p.width, height: p.height })) : undefined,
      });
    } finally {
      setPickingGallery(false);
    }
  };

  if (!permission) {
    return <Screen />;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.permissionContainer}>
          <Icon name="camera" size={32} />
          <Text variant="title" align="center" style={{ marginTop: theme.spacing.lg }}>
            Permitir el uso de la cámara
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
            COR necesita la cámara para fotografiar el vehículo que vas a transformar.
          </Text>
          <Button label="Permitir cámara" onPress={requestPermission} />
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.lg }}>
            <Text variant="bodySmall" color="secondary">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={styles.fill} facing="back" />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
        locations={[0, 0.22]}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        locations={[0.62, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <View style={styles.thirds} pointerEvents="none">
        <View style={[styles.thirdLineV, { left: '33.333%' }]} />
        <View style={[styles.thirdLineV, { left: '66.666%' }]} />
        <View style={[styles.thirdLineH, { top: '33.333%' }]} />
        <View style={[styles.thirdLineH, { top: '66.666%' }]} />
      </View>

      <View style={[styles.topBar, { paddingTop: theme.spacing.xl }]}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevronLeft" size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.angleChip}>
          <View style={[styles.angleDot, { backgroundColor: theme.colors.accent }]} />
          <Text variant="caption" color="inverse" uppercase style={styles.angleChipText}>
            {angle}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.frameGuide} pointerEvents="none">
        <CornerBrackets size={28} thickness={6} color="rgba(255,255,255,0.85)" />
        <Text variant="caption" color="inverse" align="center" style={styles.frameHint}>
          Encuadra el vehículo completo
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: 42 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.angleRow}
        >
          {ANGLES.map((a) => (
            <Chip key={a} label={a} tone="overlay" active={a === angle} onPress={() => setAngle(a)} />
          ))}
        </ScrollView>

        <View style={styles.captureRow}>
          <Pressable
            onPress={handleGallery}
            disabled={pickingGallery}
            accessibilityLabel="Elegir de galería"
            style={styles.galleryButton}
          >
            <Icon name="image" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            style={[styles.shutterOuter, { opacity: capturing ? 0.6 : 1 }]}
          >
            <View style={styles.shutterInner} />
          </Pressable>

          <Text variant="caption" color="inverse" uppercase style={styles.photoLabel}>
            Foto
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 340,
  },
  thirds: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 250,
  },
  thirdLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  thirdLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  topBar: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  angleChip: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(10, 10, 10, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  angleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  angleChipText: {
    letterSpacing: 1.8,
    fontSize: 10,
  },
  frameGuide: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 150,
    bottom: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  frameHint: {
    position: 'absolute',
    bottom: -30,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: 26,
  },
  angleRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  galleryButton: {
    position: 'absolute',
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  photoLabel: {
    position: 'absolute',
    right: 20,
    letterSpacing: 1.4,
    fontSize: 10,
  },
});
