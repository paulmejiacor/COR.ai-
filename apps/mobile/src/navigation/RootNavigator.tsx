import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@cor/design-system';
import { HomeScreen } from '../screens/HomeScreen';
import { NewCreationScreen } from '../screens/NewCreationScreen';
import { CameraCaptureScreen } from '../screens/CameraCaptureScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewCreation" component={NewCreationScreen} />
        <Stack.Screen name="Camera" component={CameraCaptureScreen} />
        <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
