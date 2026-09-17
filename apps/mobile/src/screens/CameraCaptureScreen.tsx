import { useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Text, Button, Icon, CornerBrackets, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraCaptureScreen({ navigation }: Props) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!photo) return;

      navigation.replace('Detection', {
        photoUri: photo.uri,
        photoWidth: photo.width,
        photoHeight: photo.height,
        source: 'camera',
      });
    } finally {
      setCapturing(false);
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

      <View style={[styles.topBar, { paddingTop: theme.spacing.xl }]}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevronLeft" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.frameGuide} pointerEvents="none">
        <CornerBrackets size={28} thickness={6} color="rgba(255,255,255,0.85)" />
        <Text variant="caption" color="inverse" align="center" style={styles.frameHint}>
          Encuadra el vehículo completo
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: theme.spacing.xxl }]}>
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          style={[styles.shutterOuter, { opacity: capturing ? 0.6 : 1 }]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 10, 10, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  frameHint: {
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});
