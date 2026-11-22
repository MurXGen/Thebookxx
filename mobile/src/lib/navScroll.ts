import { Easing, interpolate, makeMutable, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 0 = bottom navbar shown, 1 = hidden. Shared by the tab bar, the docked bag
// bar and every scroll view that should hide the navbar while scrolling down.
export const navHidden = makeMutable(0);
export const TAB_H = 62;

const EASE = Easing.out(Easing.quad);
export const showNav = () => navHidden.set(withTiming(0, { duration: 180, easing: EASE }));

// Hide only after a deliberate scroll down (60px in one direction, past the
// first screenful); show after 40px back up or near the top. Small jiggles
// while reading no longer make the bars bounce.
export function useHideNavOnScroll() {
  const last = useSharedValue(0);
  const travel = useSharedValue(0); // distance moved in the current direction
  const dir = useSharedValue(0);
  return useAnimatedScrollHandler((e) => {
    const y = e.contentOffset.y;
    const dy = y - last.get();
    last.set(y);
    if (dy === 0) return;
    const t = travel.get();
    travel.set(Math.sign(dy) === Math.sign(t) ? t + dy : dy);
    if (dir.get() === 1 && (y < 80 || travel.get() < -40)) {
      dir.set(0);
      navHidden.set(withTiming(0, { duration: 180, easing: EASE }));
    } else if (dir.get() === 0 && y > 200 && travel.get() > 60) {
      dir.set(1);
      navHidden.set(withTiming(1, { duration: 200, easing: EASE }));
    }
  });
}

// Bottom offset for bars that sit on top of the (absolute) tab bar.
export function useAboveTabBar() {
  const insets = useSafeAreaInsets();
  const h = TAB_H + insets.bottom;
  return useAnimatedStyle(() => ({ bottom: interpolate(navHidden.get(), [0, 1], [h, 0]) }));
}
