import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Button, useTheme } from '@cor/design-system';
import { getCachedFalKeyOverride, loadStoredFalKey, setStoredFalKey } from '../lib/apiKeyStore';
import { hasRealAIProvider } from '../lib/aiService';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ENV_FAL_KEY = process.env.EXPO_PUBLIC_FAL_KEY;

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadStoredFalKey().then((stored) => {
      setValue(stored ?? '');
      setLoaded(true);
    });
  }, []);

  const activeSource = getCachedFalKeyOverride()
    ? 'Guardada en este dispositivo'
    : ENV_FAL_KEY
      ? 'Cargada desde .env.local'
      : 'Ninguna — modo demo';

  const handleSave = async () => {
    setSaving(true);
    try {
      await setStoredFalKey(value.trim() || null);
      Alert.alert(
        'Guardado',
        value.trim() ? 'La clave de fal.ai quedó guardada en este dispositivo.' : 'Se quitó la clave guardada.'
      );
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await setStoredFalKey(null);
      setValue('');
      Alert.alert('Listo', 'Se quitó la clave guardada en este dispositivo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Configuración" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: theme.spacing.xl }}>
          <SectionLabel>IA · fal.ai</SectionLabel>
          <Text variant="title" style={{ marginTop: theme.spacing.md }}>
            Clave de la API
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            Pégala aquí si la app sigue en modo demo aunque ya la hayas puesto en .env.local — esta vía no depende de
            reiniciar nada.
          </Text>

          <View
            style={[
              styles.statusRow,
              {
                borderColor: hasRealAIProvider() ? theme.colors.accent : theme.semantic.danger,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Text variant="bodySmall" style={{ color: hasRealAIProvider() ? theme.colors.accent : theme.semantic.danger }}>
              {hasRealAIProvider() ? '● IA real activa' : '● Modo demo (sin IA real)'}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {activeSource}
            </Text>
          </View>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="41dcad77-...:...."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={loaded && !saving}
            style={[
              styles.input,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.control,
                marginTop: theme.spacing.lg,
              },
            ]}
          />

          <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
            <Button label="GUARDAR" fullWidth onPress={handleSave} disabled={saving} />
            <Button label="QUITAR CLAVE GUARDADA" fullWidth variant="secondary" onPress={handleClear} disabled={saving} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
});
