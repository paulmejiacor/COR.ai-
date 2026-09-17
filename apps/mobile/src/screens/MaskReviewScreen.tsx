import { useEffect, useRef, useState } from 'react';
import { View, Image, PanResponder, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, Button, Icon, useTheme, type IconName } from '@cor/design-system';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MaskReview'>;

type StrokeMode = 'add' | 'remove';
type Point = { x: number; y: number };
type Stroke = { id: string; mode: StrokeMode; points: Point[] };

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  return `M${points[0].x},${points[0].y} ${points
    .slice(1)
    .map((p) => `L${p.x},${p.y}`)
    .join(' ')}`;
}

/**
 * Fase 6 — corrección manual de la máscara: el usuario dibuja directamente
 * sobre la fotografía para agregar o quitar área de la selección, con
 * deshacer y restaurar. El trazo es real (PanResponder + SVG); lo que
 * todavía es mock es la máscara automática de fondo que corrige.
 */
export function MaskReviewScreen({ route, navigation }: Props) {
  const { photoUri, photoWidth, photoHeight } = route.params;
  const theme = useTheme();
  const [mode, setMode] = useState<StrokeMode>('add');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [, forceRender] = useState(0);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const liveStrokeRef = useRef<Point[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        liveStrokeRef.current = [{ x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }];
        forceRender((n) => n + 1);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        liveStrokeRef.current = [...liveStrokeRef.current, { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }];
        forceRender((n) => n + 1);
      },
      onPanResponderRelease: () => {
        const points = liveStrokeRef.current;
        liveStrokeRef.current = [];
        if (points.length > 1) {
          const id = `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          setStrokes((prev) => [...prev, { id, mode: modeRef.current, points }]);
        }
        forceRender((n) => n + 1);
      },
    })
  ).current;

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const restore = () => setStrokes([]);

  const ModeButton = ({ value, icon, label }: { value: StrokeMode; icon: IconName; label: string }) => {
    const active = mode === value;
    const tint = value === 'add' ? theme.colors.accent : theme.semantic.danger;
    return (
      <Pressable
        onPress={() => setMode(value)}
        style={[
          styles.modeButton,
          {
            borderRadius: theme.radii.md,
            borderColor: active ? tint : theme.colors.border,
            backgroundColor: active ? `${tint}26` : 'transparent',
          },
        ]}
      >
        <Icon name={icon} size={18} color={active ? tint : theme.colors.textSecondary} />
        <Text variant="bodySmall" style={{ color: active ? tint : theme.colors.textSecondary }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <Header title="Revisar selección" onBack={() => navigation.goBack()} />

      <View style={{ paddingTop: theme.spacing.lg, flex: 1 }}>
        <View
          style={[styles.frame, { aspectRatio: photoWidth / photoHeight, borderRadius: theme.radii.lg }]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            {strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={pointsToPath(stroke.points)}
                stroke={stroke.mode === 'add' ? theme.colors.accent : theme.semantic.danger}
                strokeOpacity={0.55}
                strokeWidth={28}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {liveStrokeRef.current.length > 0 && (
              <Path
                d={pointsToPath(liveStrokeRef.current)}
                stroke={mode === 'add' ? theme.colors.accent : theme.semantic.danger}
                strokeOpacity={0.55}
                strokeWidth={28}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        </View>

        <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.md }}>
          Dibuja sobre la fotografía para {mode === 'add' ? 'agregar' : 'quitar'} área de la selección del vehículo.
        </Text>

        <View style={[styles.toolbar, { marginTop: theme.spacing.lg }]}>
          <ModeButton value="add" icon="plusCircle" label="Agregar área" />
          <ModeButton value="remove" icon="minusCircle" label="Eliminar área" />
        </View>

        <View style={[styles.toolbar, { marginTop: theme.spacing.sm }]}>
          <Pressable
            onPress={undo}
            disabled={strokes.length === 0}
            style={[styles.iconButton, { opacity: strokes.length === 0 ? 0.4 : 1 }]}
          >
            <Icon name="undo" size={18} />
            <Text variant="bodySmall">Deshacer</Text>
          </Pressable>
          <Pressable
            onPress={restore}
            disabled={strokes.length === 0}
            style={[styles.iconButton, { opacity: strokes.length === 0 ? 0.4 : 1 }]}
          >
            <Icon name="refresh" size={18} />
            <Text variant="bodySmall">Restaurar</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 'auto', paddingBottom: theme.spacing.xl }}>
          {strokes.length > 0 ? (
            <Text variant="caption" color="secondary" align="center" style={{ marginBottom: theme.spacing.sm }}>
              {strokes.length} corrección{strokes.length === 1 ? '' : 'es'} manual{strokes.length === 1 ? '' : 'es'}
            </Text>
          ) : null}
          <Button label="CONFIRMAR SELECCIÓN" fullWidth onPress={() => navigation.goBack()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    paddingVertical: 12,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
});
