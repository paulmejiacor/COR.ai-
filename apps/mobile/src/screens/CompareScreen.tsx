import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, BeforeAfterSlider, useTheme } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Compare'>;

export function CompareScreen({ route, navigation }: Props) {
  const { beforeUri, afterUri, photoWidth, photoHeight } = route.params;
  const theme = useTheme();

  return (
    <Screen>
      <Header title="Comparar" onBack={() => navigation.goBack()} />
      <View style={{ paddingTop: theme.spacing.xxxl, flex: 1 }}>
        <SectionLabel>Antes / Después</SectionLabel>
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          Desliza para comparar
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
          El vehículo se mantiene intacto — solo cambia el escenario a su alrededor.
        </Text>

        <BeforeAfterSlider
          beforeSource={{ uri: beforeUri }}
          afterSource={{ uri: afterUri }}
          aspectRatio={photoWidth / photoHeight}
        />
      </View>
    </Screen>
  );
}
