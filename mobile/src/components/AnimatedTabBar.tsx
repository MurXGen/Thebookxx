import { BottomTabBar, type BottomTabBarProps } from "expo-router/tabs";
import { StyleSheet } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navHidden, TAB_H } from "@/lib/navScroll";

// Tab bar that slides away while the reader scrolls down.
export default function AnimatedTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const h = TAB_H + insets.bottom;
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(navHidden.value, [0, 1], [0, h]) }] }));
  return (
    <Animated.View style={[s.wrap, a]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

const s = StyleSheet.create({ wrap: { position: "absolute", left: 0, right: 0, bottom: 0 } });
