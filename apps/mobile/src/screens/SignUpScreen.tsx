import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Logo, Text, Button, useTheme } from '@cor/design-system';
import { resolveAuthService } from '../lib/authService';
import type { AuthStackParamList } from '../navigation/authTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Faltan datos', 'Escribe tu nombre, correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Usa al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await resolveAuthService().signUpWithEmail(email.trim(), password, name.trim());
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', error instanceof Error ? error.message : 'Intenta de nuevo.');
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
            Crea tu cuenta
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: 8, marginBottom: 28 }}>
            Una cuenta por asesor para usar COR Automotive Studio.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
            editable={!loading}
            style={[
              styles.input,
              { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.radii.control },
            ]}
          />
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
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.control,
                marginTop: theme.spacing.sm,
              },
            ]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña (mín. 6 caracteres)"
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
            <Button label={loading ? 'CREANDO...' : 'CREAR CUENTA'} fullWidth onPress={handleSignUp} disabled={loading} />
          </View>

          <Text
            variant="bodySmall"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.lg }}
            onPress={() => !loading && navigation.navigate('Login')}
          >
            ¿Ya tienes cuenta? <Text variant="bodySmall" color="accent">Inicia sesión</Text>
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
