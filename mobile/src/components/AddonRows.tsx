import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { C } from "@/theme";

const tick = () => {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
};

type Art = "bookmark" | "gift" | "flash";
const ART: Record<Art, { colors: [string, string]; icon: keyof typeof Ionicons.glyphMap }> = {
  bookmark: { colors: ["#FFB547", "#F07A00"], icon: "bookmark" },
  gift: { colors: ["#FB7185", "#E11D48"], icon: "gift" },
  flash: { colors: ["#3D3D42", "#1C1C1E"], icon: "flash" },
};

export function AddonArt({ kind, count }: { kind: Art; count?: number }) {
  const a = ART[kind];
  return (
    <View>
      <LinearGradient colors={a.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.art}>
        <Ionicons name={a.icon} size={22} color="#fff" />
      </LinearGradient>
      {count ? (
        <Animated.View key={count} entering={ZoomIn.springify().damping(10)} style={s.badge}>
          <Text style={s.badgeTxt}>{count}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

export function PriceChip({ free, label }: { free: boolean; label: string }) {
  return (
    <View style={[s.chip, free ? s.chipFree : s.chipPaid]}>
      <Text style={[s.chipTxt, { color: free ? C.green : C.brandDark }]}>{label}</Text>
    </View>
  );
}

// Animated pill switch.
export function Switch({ on }: { on: boolean }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.set(withTiming(on ? 1 : 0, { duration: 180 }));
  }, [on, v]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(v.get(), [0, 1], ["#D4D4DA", C.green]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: v.get() * 18 }] }));
  return (
    <Animated.View style={[s.track, track]}>
      <Animated.View style={[s.knob, knob]} />
    </Animated.View>
  );
}

function Row({ on, children, onPress }: { on: boolean; children: ReactNode; onPress?: () => void }) {
  const inner = <View style={[s.row, on && s.rowOn]}>{children}</View>;
  return onPress ? (
    <PressScale scaleTo={0.985} onPress={onPress}>
      {inner}
    </PressScale>
  ) : (
    inner
  );
}

export function ToggleAddon({ kind, title, sub, price, free, on, onToggle }: { kind: Art; title: string; sub: string; price: string; free?: boolean; on: boolean; onToggle: () => void }) {
  return (
    <Row
      on={on}
      onPress={() => {
        tick();
        onToggle();
      }}
    >
      <AddonArt kind={kind} />
      <View style={{ flex: 1 }}>
        <View style={s.titleRow}>
          <Text style={s.t}>{title}</Text>
          <PriceChip free={!!free} label={price} />
        </View>
        <Text style={s.sub}>{sub}</Text>
      </View>
      <Switch on={on} />
    </Row>
  );
}

// Bookmarks: green ADD that becomes a − n + stepper (same as the book cards).
export function BookmarkAddon({ count, sub, price, free, onChange, max }: { count: number; sub: ReactNode; price: string; free: boolean; onChange: (n: number) => void; max: number }) {
  const s1 = useSharedValue(1);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: s1.get() }] }));
  const set = (n: number) => {
    tick();
    s1.set(withSpring(1.08, { damping: 6 }, () => s1.set(withSpring(1))));
    onChange(n);
  };
  return (
    <Row on={count > 0}>
      <AddonArt kind="bookmark" count={count} />
      <View style={{ flex: 1 }}>
        <View style={s.titleRow}>
          <Text style={s.t}>Bookmarks</Text>
          <PriceChip free={free} label={price} />
        </View>
        <Text style={s.sub}>{sub}</Text>
      </View>
      <Animated.View style={bump}>
        {count === 0 ? (
          <Pressable onPress={() => set(1)} style={s.add} hitSlop={6}>
            <Text style={s.addTxt}>ADD</Text>
            <Ionicons name="add" size={14} color={C.green} />
          </Pressable>
        ) : (
          <Animated.View entering={FadeIn.duration(150)} style={s.stepper}>
            <Pressable onPress={() => set(count - 1)} hitSlop={8} style={s.sBtn}>
              <Ionicons name="remove" size={16} color="#fff" />
            </Pressable>
            <Animated.View key={count} entering={ZoomIn.duration(160)}>
              <Text style={s.n}>{count}</Text>
            </Animated.View>
            <Pressable onPress={() => set(count + 1)} hitSlop={8} style={[s.sBtn, count >= max && { opacity: 0.4 }]}>
              <Ionicons name="add" size={16} color="#fff" />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </Row>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff" },
  rowOn: { borderColor: "#FBD5A8", backgroundColor: "#FFFAF3" },
  art: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.ink, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "700", lineHeight: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  t: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  sub: { fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 16 },
  chip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  chipFree: { backgroundColor: C.greenSoft },
  chipPaid: { backgroundColor: C.brandSoft },
  chipTxt: { fontSize: 10.5, fontWeight: "700" },
  track: { width: 42, height: 24, borderRadius: 12, padding: 3 },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  add: { flexDirection: "row", alignItems: "center", gap: 2, height: 32, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: "#D7EBDF", backgroundColor: "#fff" },
  addTxt: { color: C.green, fontWeight: "700", fontSize: 13 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10, height: 32, paddingHorizontal: 6, borderRadius: 9, backgroundColor: C.green },
  sBtn: { width: 22, alignItems: "center" },
  n: { color: "#fff", fontWeight: "700", fontSize: 14, minWidth: 12, textAlign: "center" },
});
