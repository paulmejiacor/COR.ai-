import { useState } from 'react';
import { View, Image, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';
import { SCENE_PRESETS, SCENE_CATEGORY_LABEL, SCENE_CATEGORY_ORDER, type UIScenePreset } from '../data/scenePresets';

type Props = NativeStackScreenProps<RootStackParamList, 'SceneSelection'>;

const EXAMPLES = [
  'Showroom minimalista de lujo con piso de mármol negro y grandes ventanales.',
  'Carretera alpina al atardecer.',
  'Hotel de lujo en Dubai durante la noche.',
];

export function SceneSelectionScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight, source } = route.params;
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectPreset = (preset: UIScenePreset) => {
    setSelectedId(preset.id);
    setDescription(preset.basePrompt);
  };

  const handleChangeText = (text: string) => {
    setDescription(text);
    setSelectedId(null);
  };

  const handleContinue = () => {
    navigation.navigate('Placeholder', {
      title: 'Editor de composición',
      phase: 'Fase 8 — Editor de composición',
      photoUri,
      note: description.trim() || undefined,
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
          const presets = SCENE_PRESETS.filter((p) => p.category === category);
          if (presets.length === 0) return null;
          return (
            <View key={category} style={{ marginTop: theme.spacing.xxl }}>
              <SectionLabel>{SCENE_CATEGORY_LABEL[category]}</SectionLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}
              >
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
});
