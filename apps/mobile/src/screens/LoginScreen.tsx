import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Logo, Text, Button, useTheme } from '@cor/design-system';
import { resolveAuthService } from '../lib/authService';
import type { AuthStackParamList } from '../navigation/authTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Escribe tu correo y tu contraseña.');
      return;
    }
    setLoading(true);
    try {
      // No hace falta navegar: App.tsx escucha onAuthStateChange y cambia
      // de pantalla sola en cuanto la sesión queda activa.
      await resolveAuthService().signInWithEmail(email.trim(), password);
    } catch (error) {
      Alert.alert('No se pudo entrar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.center}>
          <Logo height={34} />
          <Text variant="hero" align="center" style={{ marginTop: 28 }}>
            Inicia sesión
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: 8, marginBottom: 28 }}>
            Usa la cuenta de tu asesor para entrar a COR Automotive Studio.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="correo@autocor.com"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
            style={[
              styles.input,
              { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.radii.control },
            ]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!loading}
            style={[
              styles.input,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.control,
                marginTop: theme.spacing.sm,
              },
            ]}
          />

          <View style={{ marginTop: theme.spacing.lg, width: '100%' }}>
            <Button label={loading ? 'ENTRANDO...' : 'INICIAR SESIÓN'} fullWidth onPress={handleLogin} disabled={loading} />
          </View>

          <Text
            variant="bodySmall"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.lg }}
            onPress={() => !loading && navigation.navigate('SignUp')}
          >
            ¿No tienes cuenta? <Text variant="bodySmall" color="accent">Créala aquí</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: {
    width: '100%',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
});
