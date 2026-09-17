import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  ThemeProvider,
  useTheme,
  Screen,
  Text,
  SectionLabel,
  CornerBrackets,
  Logo,
  Surface,
  Button,
  Divider,
  brand,
  typeScale,
} from '@cor/design-system';

const COLOR_SWATCHES = Object.entries(brand) as Array<[string, string]>;
const TYPE_VARIANTS = Object.keys(typeScale) as Array<keyof typeof typeScale>;

/**
 * Fase 2 — vista de verificación del sistema visual COR.
 * No es el Home (eso es Fase 3): existe solo para validar tokens,
 * tipografía, logo y componentes base antes de construir pantallas reales.
 */
function DesignSystemPreview() {
  const theme = useTheme();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <CornerBrackets size={22} thickness={5} />
          <Logo height={30} />
          <Text variant="caption" color="secondary" style={styles.heroCaption}>
            Sistema visual — Fase 2
          </Text>
          <Text variant="display" style={styles.heroTitle}>
            Transforma el escenario.{'\n'}Conserva el auto.
          </Text>
        </View>

        <Divider />

        <SectionLabel>Paleta de marca</SectionLabel>
        <View style={styles.swatchGrid}>
          {COLOR_SWATCHES.map(([name, hex]) => (
            <View key={name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: hex, borderColor: theme.colors.border }]} />
              <Text variant="caption" uppercase color="secondary">
                {name}
              </Text>
              <Text variant="caption" color="secondary">
                {hex}
              </Text>
            </View>
          ))}
        </View>

        <Divider />

        <SectionLabel>Tipografía</SectionLabel>
        <Surface style={styles.typeSurface}>
          {TYPE_VARIANTS.map((variant) => (
            <Text key={variant} variant={variant} style={styles.typeSample}>
              {variant} — COR Automotive Studio
            </Text>
          ))}
        </Surface>

        <Divider />

        <SectionLabel>Componentes</SectionLabel>
        <Surface style={styles.componentSurface}>
          <Text variant="subtitle" style={styles.componentLabel}>
            Botones
          </Text>
          <View style={styles.buttonRow}>
            <Button label="Nueva creación" onPress={() => {}} />
            <Button label="Ver detalle" variant="secondary" onPress={() => {}} />
            <Button label="Cancelar" variant="ghost" onPress={() => {}} />
          </View>

          <Divider spacing={theme.spacing.xl} />

          <Text variant="subtitle" style={styles.componentLabel}>
            Logo — variante marca
          </Text>
          <View style={styles.logoRow}>
            <Logo variant="mark" height={22} />
            <Logo variant="full" height={22} />
          </View>
        </Surface>

        <View style={{ height: theme.spacing.huge }} />
      </ScrollView>
      <StatusBar style="light" />
    </Screen>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <ThemeProvider mode="dark">
      <DesignSystemPreview />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  hero: {
    paddingVertical: 32,
  },
  heroCaption: {
    marginTop: 20,
  },
  heroTitle: {
    marginTop: 8,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  swatchItem: {
    width: 84,
    gap: 4,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  typeSurface: {
    marginTop: 16,
    gap: 10,
  },
  typeSample: {
    marginBottom: 2,
  },
  componentSurface: {
    marginTop: 16,
  },
  componentLabel: {
    marginBottom: 12,
  },
  buttonRow: {
    gap: 12,
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
});
