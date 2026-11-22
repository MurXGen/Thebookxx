import { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { onConfetti } from "@/lib/confetti";

// Brand-friendly palette (no muddy colours).
const COLORS = ["#FB8500", "#FFB703", "#1BA672", "#3B82F6", "#E11D48", "#A855F7", "#14B8A6", "#F43F5E"];
type Shape = "rect" | "strip" | "dot";

// Deterministic pseudo-random per piece, so a burst looks the same within a frame.
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Spec = { x0: number; y0: number; vx: number; vy: number; g: number; drag: number; sway: number; swayF: number; spin: number; flip: number; dur: number; delay: number; w: number; h: number; color: string; shape: Shape };

// Real-ish physics: launched with a velocity, slowed by air drag, pulled by
// gravity, swaying side to side and flipping (scaleY) like paper.
function Piece({ sp }: { sp: Spec }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(sp.delay, withTiming(1, { duration: sp.dur, easing: Easing.linear })));
  }, [t, sp]);
  const a = useAnimatedStyle(() => {
    const p = t.get();
    const s = (p * sp.dur) / 1000; // seconds
    const k = (1 - Math.exp(-sp.drag * s)) / sp.drag; // drag-integrated time
    const x = sp.x0 + sp.vx * k + Math.sin(s * sp.swayF) * sp.sway * Math.min(1, s * 2);
    const y = sp.y0 + sp.vy * k + 0.5 * sp.g * s * s;
    return {
      opacity: p < 0.8 ? 1 : (1 - p) / 0.2,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${sp.spin * s}deg` }, { scaleY: Math.cos(s * sp.flip) }],
    };
  });
  return (
    <Animated.View
      style={[
        s.piece,
        { width: sp.w, height: sp.h, backgroundColor: sp.color, borderRadius: sp.shape === "dot" ? sp.w / 2 : sp.shape === "strip" ? 1 : 2 },
        a,
      ]}
    />
  );
}

function makeBurst(seed: number, w: number, h: number, big: boolean): Spec[] {
  const out: Spec[] = [];
  const cannon = big ? 44 : 24; // per side
  const shower = big ? 40 : 18;
  let i = 0;
  const r = (n: number) => rnd(seed + i, n);
  const shape = (): Shape => (r(9) < 0.2 ? "dot" : r(9) < 0.55 ? "strip" : "rect");
  const size = (sh: Shape) => (sh === "dot" ? [7, 7] : sh === "strip" ? [4 + r(10) * 2, 12 + r(11) * 8] : [8 + r(10) * 5, 6 + r(11) * 5]);
  // Two cannons from the bottom corners, aimed up and inwards.
  for (const side of [-1, 1]) {
    for (let k = 0; k < cannon; k++, i++) {
      const sh = shape();
      const [pw, ph] = size(sh);
      const angle = (60 + r(1) * 25) * (Math.PI / 180);
      const speed = 900 + r(2) * 700;
      out.push({
        x0: side < 0 ? -10 : w + 10,
        y0: h * 0.92,
        vx: -side * Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        g: 1500,
        drag: 1.6 + r(3) * 0.8,
        sway: 10 + r(4) * 18,
        swayF: 3 + r(5) * 4,
        spin: (r(6) - 0.5) * 900,
        flip: 6 + r(7) * 8,
        dur: 2600 + r(8) * 900,
        delay: r(12) * 120,
        w: pw,
        h: ph,
        color: COLORS[Math.floor(r(13) * COLORS.length)],
        shape: sh,
      });
    }
  }
  // A gentle shower from the top for the big celebrations.
  for (let k = 0; k < shower; k++, i++) {
    const sh = shape();
    const [pw, ph] = size(sh);
    out.push({
      x0: r(1) * w,
      y0: -30 - r(2) * 120,
      vx: (r(3) - 0.5) * 60,
      vy: 60 + r(4) * 80,
      g: 180 + r(5) * 120,
      drag: 0.6,
      sway: 18 + r(6) * 26,
      swayF: 2 + r(7) * 3,
      spin: (r(8) - 0.5) * 600,
      flip: 4 + r(10) * 6,
      dur: 3000 + r(11) * 1000,
      delay: 250 + r(12) * 700,
      w: pw,
      h: ph,
      color: COLORS[Math.floor(r(13) * COLORS.length)],
      shape: sh,
    });
  }
  return out;
}

export default function ConfettiHost() {
  const { width, height } = useWindowDimensions();
  const [burst, setBurst] = useState<{ key: number; big: boolean } | null>(null);
  useEffect(
    () =>
      onConfetti((big) => {
        setBurst({ key: Date.now(), big });
        setTimeout(() => setBurst(null), big ? 4600 : 3700);
      }),
    [],
  );
  const pieces = useMemo(() => (burst ? makeBurst(burst.key % 1000, width, height, burst.big) : []), [burst, width, height]);
  if (!burst) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 40 }]} key={burst.key}>
      {pieces.map((sp, i) => (
        <Piece key={i} sp={sp} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({ piece: { position: "absolute", left: 0, top: 0 } });
