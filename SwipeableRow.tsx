import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';

interface Props {
  onSwipeSettle: () => void;
  /** Pass true when entry is already settled — disables the gesture */
  disabled?: boolean;
  children: React.ReactNode;
}

const THRESHOLD = 80;

export function SwipeableRow({ onSwipeSettle, disabled = false, children }: Props) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Only claim horizontal gestures that are clearly more horizontal than vertical
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        !disabled && dx > 6 && Math.abs(dx) > Math.abs(dy) * 1.8,
      onPanResponderGrant: () => {
        triggered.current = false;
      },
      onPanResponderMove: (_, { dx }) => {
        if (disabled || dx <= 0) return;
        // Cap at threshold + a little overscroll for feel
        translateX.setValue(Math.min(dx, THRESHOLD + 24));
        if (dx >= THRESHOLD && !triggered.current) {
          triggered.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (dx < THRESHOLD) {
          triggered.current = false;
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        const didCommit = !disabled && dx >= THRESHOLD;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }).start();
        if (didCommit) onSwipeSettle();
        triggered.current = false;
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        triggered.current = false;
      },
    })
  ).current;

  const bgOpacity = translateX.interpolate({
    inputRange: [0, 20, THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const labelScale = translateX.interpolate({
    inputRange: [0, THRESHOLD],
    outputRange: [0.7, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrap}>
      {/* Green settle background revealed by the sliding row */}
      <Animated.View
        style={[styles.bg, { backgroundColor: colors.oweMeBg, opacity: bgOpacity }]}
      >
        <Animated.Text
          style={[styles.bgLabel, { color: colors.oweMe, transform: [{ scale: labelScale }] }]}
        >
          ✓  Settle
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  bgLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
});
