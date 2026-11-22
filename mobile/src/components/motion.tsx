import { useEffect, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInDown, SlideInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

// Fades + lifts content in when it first mounts (sections, rows, cards).
export function Appear({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(420).delay(delay).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

// Pressable that gently shrinks while pressed and springs back.
export function PressScale({ children, style, scaleTo = 0.96, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const sc = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        sc.set(withTiming(scaleTo, { duration: 90 }));
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        sc.set(withSpring(1, { damping: 12, stiffness: 260 }));
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, a]}>{children}</Animated.View>
    </Pressable>
  );
}

// Bottom sheet: backdrop fades in, panel springs up from the bottom.
export function Sheet({ open, onClose, children, style }: { open: boolean; onClose: () => void; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {open ? (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View entering={FadeIn.duration(220)} style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
            <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
          </Animated.View>
          <Animated.View entering={SlideInDown.springify().damping(20).stiffness(180)} style={style}>
            {children}
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

// Progress bar fill that glides to its new width.
export function Fill({ pct, color, height = 5, style }: { pct: number; color: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const v = useSharedValue(pct);
  useEffect(() => {
    v.set(withTiming(Math.max(0, Math.min(1, pct)), { duration: 500 }));
  }, [pct, v]);
  const a = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color }, style, a]} />;
}
