import { interpolate, makeMutable, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 0 = bottom navbar shown, 1 = hidden. Shared by the tab bar, the docked bag
// bar and every scroll view that should hide the navbar while scrolling down.
export const navHidden = makeMutable(0);
export const TAB_H = 62;

export const showNav = () => navHidden.set(withTiming(0, { duration: 220 }));

// Scroll down (past the top) → hide; scroll up a little → show again.
export function useHideNavOnScroll() {
  const last = useSharedValue(0);
  const dir = useSharedValue(0);
  return useAnimatedScrollHandler((e) => {
    const y = e.contentOffset.y;
    const dy = y - last.get();
    if ((y < 40 || dy < -6) && dir.get() !== 0) {
      dir.set(0);
      navHidden.set(withTiming(0, { duration: 220 }));
    } else if (y >= 40 && dy > 6 && dir.get() !== 1) {
      dir.set(1);
      navHidden.set(withTiming(1, { duration: 260 }));
    }
    last.set(y);
  });
}

// Bottom offset for bars that sit on top of the (absolute) tab bar.
export function useAboveTabBar() {
  const insets = useSafeAreaInsets();
  const h = TAB_H + insets.bottom;
  return useAnimatedStyle(() => ({ bottom: interpolate(navHidden.get(), [0, 1], [h, 0]) }));
}
