import { useRef, useState } from 'react';
import {
  View,
  Image,
  PanResponder,
  StyleSheet,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Icon } from './Icon';

export interface BeforeAfterSliderProps {
  beforeSource: ImageSourcePropType;
  afterSource: ImageSourcePropType;
  aspectRatio?: number;
  beforeLabel?: string;
  afterLabel?: string;
}

const GRIP_SIZE = 36;

/** Comparador interactivo antes/después — arrastra en cualquier punto para revelar la fotografía original. */
export function BeforeAfterSlider({
  beforeSource,
  afterSource,
  aspectRatio = 4 / 3,
  beforeLabel = 'ANTES',
  afterLabel = 'DESPUÉS',
}: BeforeAfterSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const [position, setPosition] = useState(0.5);

  const updateFromX = (x: number) => {
    if (widthRef.current <= 0) return;
    setPosition(Math.min(1, Math.max(0, x / widthRef.current)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => updateFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt: GestureResponderEvent) => updateFromX(evt.nativeEvent.locationX),
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      {...panResponder.panHandlers}
      style={[
        styles.container,
        { aspectRatio, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface },
      ]}
    >
      {width > 0 && (
        <>
          <Image source={afterSource} resizeMode="cover" style={[styles.fill, { width }]} />

          <View style={[styles.clip, { width: width * position }]}>
            <Image source={beforeSource} resizeMode="cover" style={[styles.fill, { width }]} />
          </View>

          <View pointerEvents="none" style={[styles.handleLine, { left: width * position - 1 }]} />
          <View
            pointerEvents="none"
            style={[
              styles.handleGrip,
              { left: width * position - GRIP_SIZE / 2, backgroundColor: theme.colors.accent },
            ]}
          >
            <Icon name="chevronLeft" size={11} color={theme.colors.textInverse} />
            <Icon name="chevronRight" size={11} color={theme.colors.textInverse} />
          </View>

          <View pointerEvents="none" style={[styles.badge, styles.badgeLeft]}>
            <Text variant="label" uppercase style={styles.badgeText}>
              {beforeLabel}
            </Text>
          </View>
          <View pointerEvents="none" style={[styles.badge, styles.badgeRight]}>
            <Text variant="label" uppercase style={styles.badgeText}>
              {afterLabel}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  handleLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
  },
  handleGrip: {
    position: 'absolute',
    top: '50%',
    marginTop: -GRIP_SIZE / 2,
    width: GRIP_SIZE,
    height: GRIP_SIZE,
    borderRadius: GRIP_SIZE / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  badge: {
    position: 'absolute',
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 10, 10, 0.55)',
  },
  badgeLeft: {
    left: 12,
  },
  badgeRight: {
    right: 12,
  },
  badgeText: {
    color: '#FFFFFF',
  },
});
