import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@cor/design-system';
import { HomeScreen } from '../screens/HomeScreen';
import { NewCreationScreen } from '../screens/NewCreationScreen';
import { CameraCaptureScreen } from '../screens/CameraCaptureScreen';
import { DetectionScreen } from '../screens/DetectionScreen';
import { MaskReviewScreen } from '../screens/MaskReviewScreen';
import { SceneSelectionScreen } from '../screens/SceneSelectionScreen';
import { CompositionEditorScreen } from '../screens/CompositionEditorScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultScreen } from '../screens/ResultScreen';
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
        <Stack.Screen name="Detection" component={DetectionScreen} />
        <Stack.Screen name="MaskReview" component={MaskReviewScreen} />
        <Stack.Screen name="SceneSelection" component={SceneSelectionScreen} />
        <Stack.Screen name="CompositionEditor" component={CompositionEditorScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
