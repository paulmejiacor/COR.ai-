import { useCallback, useState } from 'react';
import { Alert, View, Image, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, Icon, useTheme } from '@cor/design-system';
import { listCustomScenes, addCustomScene, type CustomScene } from '@cor/storage';
import { DEFAULT_COMPOSITION_SETTINGS } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';
import { SCENE_PRESETS, SCENE_CATEGORY_LABEL, SCENE_CATEGORY_ORDER, type UIScenePreset } from '../data/scenePresets';

type Props = NativeStackScreenProps<RootStackParamList, 'SceneSelection'>;

const EXAMPLES = [
  'Showroom minimalista de lujo con piso de mármol negro y grandes ventanales.',
  'Carretera alpina al atardecer.',
  'Hotel de lujo en Dubai durante la noche.',
];

async function ensureCustomScenesDir(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}custom-scenes/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export function SceneSelectionScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source, angle } = route.params;
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customScenes, setCustomScenes] = useState<CustomScene[]>([]);
  const [addingScene, setAddingScene] = useState(false);

  const reloadCustomScenes = useCallback(() => {
    listCustomScenes()
      .then(setCustomScenes)
      .catch(() => setCustomScenes([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadCustomScenes();
    }, [reloadCustomScenes])
  );

  const allPresets: UIScenePreset[] = [
    ...SCENE_PRESETS,
    ...customScenes.map((s) => ({
      id: s.id,
      category: 'custom' as const,
      name: s.name,
      basePrompt: `Escenario personalizado: ${s.name}.`,
      thumbnail: { uri: s.uri },
    })),
  ];

  const selectPreset = (preset: UIScenePreset) => {
    setSelectedId(preset.id);
    setDescription(preset.basePrompt);
  };

  const handleChangeText = (text: string) => {
    setDescription(text);
    setSelectedId(null);
  };

  const handleAddScene = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para agregar un escenario.');
      return;
    }

    setAddingScene(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      const dir = await ensureCustomScenesDir();
      const id = `custom_${Date.now()}`;
      const dest = `${dir}${id}.jpg`;
      // Copiamos a un directorio propio de la app: la URI que entrega el
      // selector de galería puede ser temporal y no sobrevivir a un reinicio.
      await FileSystem.copyAsync({ from: asset.uri, to: dest });

      const scene: CustomScene = {
        id,
        name: `Escenario ${customScenes.length + 1}`,
        uri: dest,
        createdAt: new Date().toISOString(),
      };
      await addCustomScene(scene);
      reloadCustomScenes();
    } catch (error) {
      Alert.alert('No se pudo agregar', String(error));
    } finally {
      setAddingScene(false);
    }
  };

  const handleContinue = () => {
    // El Editor de composición se quitó del flujo: la posición/escala que se
    // ajustaba ahí nunca se le mandaba a la IA (Kontext solo recibe la foto
    // completa + el texto del escenario), así que esa pantalla no cambiaba
    // nada del resultado — era un paso de más entre elegir el escenario y
    // que la IA empezara a trabajar.
    const selectedPreset = allPresets.find((p) => p.id === selectedId);
    // Resuelve el thumbnail (require local o { uri } de un escenario
    // personalizado) a una URI real que se pueda subir — así la IA recibe
    // la foto de referencia del spot elegido, no solo su descripción de
    // texto, y el resultado se parece de verdad al espacio físico de COR.
    // resolveAssetSource no existe en todas las plataformas (ej. web) — si
    // falla, seguimos sin referencia en vez de trabar la navegación.
    let sceneReferenceUri: string | undefined;
    try {
      sceneReferenceUri = selectedPreset ? Image.resolveAssetSource?.(selectedPreset.thumbnail)?.uri : undefined;
    } catch {
      sceneReferenceUri = undefined;
    }

    navigation.navigate('Processing', {
      photoUri,
      photoWidth,
      photoHeight,
      source,
      angle,
      sceneDescription: description.trim() || undefined,
      sceneReferenceUri,
      composition: DEFAULT_COMPOSITION_SETTINGS,
    });
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Escenario" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SectionLabel>Nuevo escenario</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          ¿Dónde quieres colocar tu vehículo?
        </Text>

        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <TextInput
            value={description}
            onChangeText={handleChangeText}
            placeholder="Describe el escenario..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            style={[styles.input, { color: theme.colors.textPrimary, fontFamily: theme.type.body.fontFamily }]}
          />
        </View>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.sm }}>
          Por ejemplo: "{EXAMPLES[0]}"
        </Text>

        {SCENE_CATEGORY_ORDER.map((category) => {
          const presets = allPresets.filter((p) => p.category === category);
          if (category !== 'custom' && presets.length === 0) return null;
          return (
            <View key={category} style={{ marginTop: theme.spacing.xxl }}>
              <SectionLabel>{SCENE_CATEGORY_LABEL[category]}</SectionLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}
              >
                {category === 'custom' ? (
                  <Pressable onPress={handleAddScene} disabled={addingScene} style={styles.card}>
                    <View
                      style={[
                        styles.cardImage,
                        styles.addCard,
                        { borderRadius: theme.radii.md, borderColor: theme.colors.border },
                      ]}
                    >
                      <Icon name="plusCircle" size={22} color={theme.colors.textSecondary} />
                    </View>
                    <Text variant="bodySmall" color="secondary" numberOfLines={1} style={{ marginTop: 6, width: 108 }}>
                      {addingScene ? 'Agregando…' : 'Agregar escenario'}
                    </Text>
                  </Pressable>
                ) : null}

                {presets.map((preset) => {
                  const selected = preset.id === selectedId;
                  return (
                    <Pressable key={preset.id} onPress={() => selectPreset(preset)} style={styles.card}>
                      <Image
                        source={preset.thumbnail}
                        style={[
                          styles.cardImage,
                          {
                            borderRadius: theme.radii.md,
                            borderColor: selected ? theme.colors.accent : 'transparent',
                          },
                        ]}
                      />
                      <Text
                        variant="bodySmall"
                        color={selected ? 'accent' : 'primary'}
                        numberOfLines={1}
                        style={{ marginTop: 6, width: 108 }}
                      >
                        {preset.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}

        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button label="CONTINUAR" fullWidth onPress={handleContinue} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    padding: 14,
    minHeight: 84,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  card: {
    alignItems: 'flex-start',
  },
  cardImage: {
    width: 108,
    height: 80,
    borderWidth: 2,
  },
  addCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
