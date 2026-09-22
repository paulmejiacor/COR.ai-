import { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, type GestureResponderEvent } from 'react-native';
import { useTheme } from '../theme';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const THUMB_SIZE = 18;
const HALO_SIZE = THUMB_SIZE + 8;

/** Control deslizante propio (sin dependencia nativa extra) para escala, altura, rotación y distancia. */
export function Slider({ value, min, max, onChange }: SliderProps) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const widthRef = useRef(0);

  const clampRatio = (x: number) => Math.min(1, Math.max(0, widthRef.current > 0 ? x / widthRef.current : 0));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        onChange(min + clampRatio(evt.nativeEvent.locationX) * (max - min));
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        onChange(min + clampRatio(evt.nativeEvent.locationX) * (max - min));
      },
    })
  ).current;

  const ratio = max > min ? (value - min) / (max - min) : 0;

  return (
    <View
      style={styles.touchArea}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setTrackWidth(e.nativeEvent.layout.width);
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: theme.colors.border }]} />
      <View style={[styles.fill, { backgroundColor: theme.colors.accent, width: `${ratio * 100}%` }]} />
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: theme.colors.background,
            left: Math.max(-4, Math.min(trackWidth - HALO_SIZE + 4, ratio * trackWidth - HALO_SIZE / 2)),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: theme.colors.textPrimary,
            left: Math.max(0, Math.min(trackWidth - THUMB_SIZE, ratio * trackWidth - THUMB_SIZE / 2)),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    height: 32,
    justifyContent: 'center',
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  fill: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  halo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
});
