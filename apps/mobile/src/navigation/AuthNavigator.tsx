import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@cor/design-system';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import type { AuthStackParamList } from './authTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Árbol de navegación independiente de RootNavigator — App.tsx renderiza
 * uno u otro (nunca los dos), según haya o no una sesión activa, por eso
 * trae su propio NavigationContainer en vez de compartir el de abajo.
 */
export function AuthNavigator() {
  const theme = useTheme();
  const navigationTheme = {
    ...DefaultTheme,
    dark: theme.mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
