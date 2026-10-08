import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import type { User } from '@cor/shared-types';
import { ThemeProvider } from '@cor/design-system';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { loadStoredFalKey } from './src/lib/apiKeyStore';
import { resolveAuthService } from './src/lib/authService';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [apiKeyReady, setApiKeyReady] = useState(false);
  // `undefined` = todavía no se resolvió la sesión; `null` = sin sesión (mostrar login).
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    loadStoredFalKey().finally(() => setApiKeyReady(true));
  }, []);

  useEffect(() => {
    const unsubscribe = resolveAuthService().onAuthStateChange(setUser);
    return unsubscribe;
  }, []);

  if (!fontsLoaded || !apiKeyReady || user === undefined) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider mode="dark">
        {user ? <RootNavigator /> : <AuthNavigator />}
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
