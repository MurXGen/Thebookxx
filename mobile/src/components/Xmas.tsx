import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, Path, Rect, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import { Text } from "@/components/ui-text";

// Christmas decor, ported from the website's src/components/XmasDecor.jsx:
// snowfall, pine garland with twinkling bulbs + swinging baubles, and a tree.

// On from 20 Nov to 6 Jan (the website's Christmas sale window).
export function isXmas(d = new Date()) {
  const m = d.getMonth();
  const day = d.getDate();
  return m === 11 || (m === 10 && day >= 20) || (m === 0 && day <= 6);
}

export const XMAS_RED = "#B91C1C";

const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 91.17 + n * 13.37) * 43758.5453;
  return x - Math.floor(x);
};

function Flake({ i, w, h, ink }: { i: number; w: number; h: number; ink: boolean }) {
  const f = useMemo(() => {
    const z = rnd(i, 1) ** 1.6;
    return { x: rnd(i, 2) * w, size: 3 + z * 6, dur: (h / (14 + z * 30)) * 1000, sway: 6 + rnd(i, 3) * 14, phase: rnd(i, 4), a: 0.55 + z * 0.45 };
  }, [i, w, h]);
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withTiming(1, { duration: f.dur, easing: Easing.linear }), -1, false));
  }, [t, f.dur]);
  const a = useAnimatedStyle(() => {
    const p = (t.get() + f.phase) % 1; // each flake starts at its own height
    return { transform: [{ translateX: f.x + Math.sin(p * Math.PI * 4 + i) * f.sway }, { translateY: -12 + p * (h + 24) }] };
  });
  return (
    <Animated.View
      style={[
        s.flake,
        { width: f.size, height: f.size, borderRadius: f.size / 2, opacity: f.a },
        ink && { backgroundColor: "#EEF3FA", borderWidth: 0.6, borderColor: "rgba(140,165,200,0.6)" },
        a,
      ]}
    />
  );
}

/** Continuous gentle snowfall over the parent (absolute fill, no touches). */
export function Snow({ count = 22, ink = false }: { count?: number; ink?: boolean }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w ? Array.from({ length: count }).map((_, i) => <Flake key={i} i={i} w={size.w} h={size.h} ink={ink} />) : null}
    </View>
  );
}

const BULBS = [13, 19, 22, 19, 13, 10, 12, 17, 22, 19, 13, 10, 12, 17, 22, 19, 13, 9];
const BULB_COLORS = ["#EF4444", "#FBBF24", "#22C55E", "#3B82F6"];
const BAUBLES = [
  { l: 5, len: 14, c: "#DC2626", d: 0 },
  { l: 18, len: 24, c: "#F59E0B", d: 500 },
  { l: 34, len: 30, c: "#DC2626", d: 800 },
  { l: 66, len: 28, c: "#DC2626", d: 400 },
  { l: 82, len: 18, c: "#F59E0B", d: 900 },
  { l: 95, len: 12, c: "#DC2626", d: 600 },
];

function Bulb({ i, left, top }: { i: number; left: string; top: number }) {
  const v = useSharedValue(1);
  useEffect(() => {
    v.set(withDelay((i % 6) * 350, withRepeat(withSequence(withTiming(0.35, { duration: 700 }), withTiming(1, { duration: 700 })), -1, false)));
  }, [v, i]);
  const a = useAnimatedStyle(() => ({ opacity: v.get() }));
  const c = BULB_COLORS[i % 4];
  return <Animated.View style={[s.bulb, { left: left as `${number}%`, top, backgroundColor: c, shadowColor: c }, a]} />;
}

function Bauble({ l, len, c, d }: { l: number; len: number; c: string; d: number }) {
  const r = useSharedValue(-6);
  useEffect(() => {
    r.set(withDelay(d, withRepeat(withSequence(withTiming(6, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1, false)));
  }, [r, d]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: -len / 2 }, { rotate: `${r.get()}deg` }, { translateY: len / 2 }] }));
  return (
    <Animated.View style={[{ position: "absolute", left: `${l}%`, top: 10, alignItems: "center" }, a]}>
      <View style={{ width: 1, height: len, backgroundColor: "rgba(120,80,30,0.6)" }} />
      <View style={[s.bauble, { backgroundColor: c }]}>
        <View style={s.baubleShine} />
      </View>
    </Animated.View>
  );
}

/** Pine garland with twinkling lights and swinging baubles along a top edge. */
export function Garland({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[{ height: 62 }, style]}>
      <Svg width="100%" height={46} viewBox="0 0 400 46" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Path d="M-10 6 Q50 34 100 12 T200 12 T300 12 T410 6" stroke="#166534" strokeWidth={9} fill="none" strokeLinecap="round" />
        <Path d="M-10 6 Q50 34 100 12 T200 12 T300 12 T410 6" stroke="#22A35A" strokeWidth={3} strokeDasharray="2 5" fill="none" strokeLinecap="round" />
      </Svg>
      {BAUBLES.map((b) => (
        <Bauble key={b.l} {...b} />
      ))}
      {BULBS.map((top, i) => (
        <Bulb key={i} i={i} left={`${3 + i * 5.5}%`} top={top} />
      ))}
    </View>
  );
}

const ORN: [number, number, string][] = [
  [50, 40, "#e11d2e"], [40, 55, "#fbbf24"], [61, 58, "#e11d2e"], [33, 74, "#e11d2e"], [52, 72, "#fbbf24"],
  [70, 78, "#fbbf24"], [44, 88, "#fbbf24"], [62, 92, "#e11d2e"], [27, 96, "#fbbf24"], [76, 98, "#e11d2e"],
];

/** Christmas tree with a glowing star (website's XmasTree). */
export function XmasTree({ size = 60, gifts = true }: { size?: number; gifts?: boolean }) {
  const star = useSharedValue(1);
  useEffect(() => {
    star.set(withRepeat(withSequence(withTiming(1.18, { duration: 900 }), withTiming(1, { duration: 900 })), -1, false));
  }, [star]);
  const sa = useAnimatedStyle(() => ({ transform: [{ scale: star.get() }] }));
  const w = size * (100 / 130);
  return (
    <View style={{ width: w, height: size }}>
      <Svg viewBox="0 0 100 130" width={w} height={size}>
        <Defs>
          <SvgGradient id="xtG" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1f8a4c" />
            <Stop offset="1" stopColor="#0d4f2c" />
          </SvgGradient>
        </Defs>
        <Rect x="45" y="104" width="10" height="12" rx="2" fill="#7c4a24" />
        <G>
          <Path d="M50 14 L80 56 H63 L88 86 H68 L94 112 H6 L32 86 H12 L37 56 H20 Z" fill="url(#xtG)" />
          <Path d="M20 56 Q28 52 37 56 M63 56 Q72 52 80 56 M12 86 Q22 81 32 86 M68 86 Q78 81 88 86 M6 112 Q20 106 34 111 M66 111 Q80 106 94 112" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <Path d="M26 66 Q50 78 72 64 M20 96 Q50 108 82 94" stroke="#fbbf24" strokeWidth={1.6} fill="none" strokeDasharray="1 3" strokeLinecap="round" />
          <Path d="M43 25 Q50 12 57 25 Q54 29 51 26 Q48 30 45 27 Z" fill="#fff" />
          {ORN.map(([x, y, c], i) => (
            <Circle key={i} cx={x} cy={y} r={3.4} fill={c} />
          ))}
        </G>
        {gifts ? (
          <G>
            <Rect x="14" y="110" width="20" height="16" rx="2" fill="#dc2626" />
            <Rect x="22" y="110" width="4" height="16" fill="#fbbf24" />
            <Rect x="64" y="113" width="16" height="13" rx="2" fill="#fbbf24" />
            <Rect x="70" y="113" width="4" height="13" fill="#dc2626" />
            <Rect x="38" y="116" width="14" height="10" rx="2" fill="#16a34a" />
            <Rect x="44" y="116" width="3" height="10" fill="#fff" />
          </G>
        ) : null}
      </Svg>
      <Animated.View style={[{ position: "absolute", top: 0, left: w / 2 - size * 0.1, width: size * 0.2, height: size * 0.2 }, sa]}>
        <Svg viewBox="38 1 25 25" width="100%" height="100%">
          <Path d="M50 2 L53.5 10.5 L62 11 L55.5 16.5 L57.5 25 L50 20.5 L42.5 25 L44.5 16.5 L38 11 L46.5 10.5 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />
        </Svg>
      </Animated.View>
    </View>
  );
}

/** Red sale strip shown above the home header (website's .hnd-promo). */
export function XmasPromo() {
  const items = ["🎄 Christmas Sale — up to 50% off", "Free delivery from ₹249", "Cash on Delivery & 7-day replacement"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <LinearGradient colors={["#B91C1C", "#DC2626", "#B91C1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.promo}>
      <Snow count={10} />
      <Animated.View key={i} entering={FadeInDown.duration(300)}>
        <Text style={s.promoTxt}>{items[i]}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flake: { position: "absolute", left: 0, top: 0, backgroundColor: "#fff" },
  bulb: { position: "absolute", width: 7, height: 9, borderRadius: 4, shadowOpacity: 0.9, shadowRadius: 5, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
  bauble: { width: 13, height: 13, borderRadius: 7, alignItems: "flex-start", justifyContent: "flex-start", padding: 2 },
  baubleShine: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.7)" },
  promo: { height: 32, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  promoTxt: { color: "#fff", fontSize: 12.5, fontWeight: "600", letterSpacing: 0.2 },
});
