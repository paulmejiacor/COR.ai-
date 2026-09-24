import { Image, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, useTheme } from '@cor/design-system';
import { DEFAULT_COMPOSITION_SETTINGS } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BatchResult'>;

export function BatchResultScreen({ route, navigation }: Props) {
  const { results, failedCount, sceneDescription } = route.params;
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Resultados del lote" onBack={() => navigation.navigate('Home')} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <SectionLabel>Lote</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          {results.length} de {results.length + failedCount} generadas
        </Text>
        {failedCount > 0 ? (
          <Text variant="bodySmall" style={{ marginTop: theme.spacing.xs, color: theme.semantic.danger }}>
            {failedCount} foto(s) fallaron y no se incluyen aquí.
          </Text>
        ) : (
          <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
            Toca cualquiera para exportarla, compararla o guardarla — igual que con una sola foto.
          </Text>
        )}

        <View style={[styles.grid, { marginTop: theme.spacing.lg }]}>
          {results.map((item, index) => (
            <Pressable
              key={`${item.resultImageUri}_${index}`}
              style={styles.card}
              onPress={() =>
                navigation.navigate('Result', {
                  resultImageUri: item.resultImageUri,
                  photoUri: item.photoUri,
                  photoWidth: item.photoWidth,
                  photoHeight: item.photoHeight,
                  source: 'gallery',
                  sceneDescription,
                  composition: DEFAULT_COMPOSITION_SETTINGS,
                })
              }
            >
              <Image
                source={{ uri: item.resultImageUri }}
                resizeMode="cover"
                style={[
                  styles.thumb,
                  { borderRadius: theme.radii.md, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}
              />
              <Text variant="bodySmall" color="secondary" style={{ marginTop: 6 }}>
                Foto {index + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  card: {
    width: '48%',
  },
  thumb: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
