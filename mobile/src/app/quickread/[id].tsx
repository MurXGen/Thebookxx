import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Linking, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { HeaderTitle } from "@/components/ScreenHeader";
import { Text } from "@/components/ui-text";
import { confetti } from "@/lib/confetti";
import { fetchQuickRead, getProgress, QUICKREAD_MRP, QUICKREAD_PRICE, setProgress, type Frame, type QuickRead } from "@/lib/quickreads";
import { useStore } from "@/lib/store";
import { C, SITE } from "@/theme";

const TINTS: [string, string][] = [
  ["#FFF7ED", "#FFEDD5"],
  ["#F0FDF4", "#DCFCE7"],
  ["#EFF6FF", "#DBEAFE"],
  ["#FDF4FF", "#FAE8FF"],
  ["#FEFCE8", "#FEF9C3"],
];

type Item = { kind: "frame"; f: Frame; i: number } | { kind: "lock" } | { kind: "done" };

export default function Reader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId, profile, catalog } = useStore();
  const book = byId.get(id || "");
  const meta = catalog.quickreads?.[id || ""];
  const { width, height } = useWindowDimensions();
  const [qr, setQr] = useState<QuickRead | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<Item>>(null);
  const restored = useRef(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    fetchQuickRead(id, profile.phone)
      .then((r) => live && setQr(r))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [id, profile.phone]);

  const items: Item[] = qr ? [...qr.frames.map((f, i) => ({ kind: "frame" as const, f, i })), qr.unlocked ? { kind: "done" as const } : { kind: "lock" as const }] : [];

  // Resume where the reader stopped.
  useEffect(() => {
    if (!qr || restored.current || !id) return;
    restored.current = true;
    getProgress().then((p) => {
      const at = Math.min(p[id] ?? 0, qr.frames.length - 1);
      if (at > 0) setTimeout(() => list.current?.scrollToIndex({ index: at, animated: false }), 50);
    });
  }, [qr, id]);

  const onView = useRef(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    const v = viewableItems[0];
    if (v?.index != null) setIndex(v.index);
  }).current;

  useEffect(() => {
    if (!qr || !id) return;
    const it = items[index];
    if (it?.kind === "frame") setProgress(id, it.i);
    if (it?.kind === "done") confetti(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const unlock = () => {
    const url = `${SITE}/quickreads`;
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  };

  const total = qr?.total || meta?.count || 0;
  const cardH = height - 230;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerTitle: () => <HeaderTitle title={book?.name || "QuickRead"} sub={total ? `${total} cards · ${qr?.unlocked ? "Unlocked" : "Free preview"}` : undefined} /> }} />
      {/* progress bar */}
      <View style={s.progressWrap}>
        <View style={s.track}>
          <Animated.View style={[s.fill, { width: `${total ? ((Math.min(index, (qr?.frames.length || 1) - 1) + 1) / total) * 100 : 0}%` }]} />
        </View>
        <Text style={s.count}>{qr ? `${Math.min(index + 1, qr.frames.length)} / ${total}` : ""}</Text>
      </View>

      {error ? (
        <View style={s.center}>
          <Text style={s.muted}>Couldn’t load this QuickRead. Check your internet and try again.</Text>
        </View>
      ) : !qr ? (
        <View style={s.center}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : (
        <FlatList
          ref={list}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(it, i) => (it.kind === "frame" ? it.f.id : `${it.kind}-${i}`)}
          onViewableItemsChanged={onView}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => (
            <View style={{ width, padding: 20 }}>
              {item.kind === "frame" ? (
                <LinearGradient colors={TINTS[item.i % TINTS.length]} style={[s.card, { height: cardH }]}>
                  <Text style={s.cardN}>Card {item.i + 1}</Text>
                  <Text style={s.cardT}>{item.f.title}</Text>
                  <Text style={s.cardC}>{item.f.content}</Text>
                  <Text style={s.swipe}>Swipe ←</Text>
                </LinearGradient>
              ) : item.kind === "lock" ? (
                <Animated.View entering={FadeIn} style={[s.card, s.lock, { height: cardH }]}>
                  <View style={s.lockIc}>
                    <Ionicons name="lock-closed" size={28} color="#fff" />
                  </View>
                  <Text style={s.lockH}>You’ve read the free preview</Text>
                  <Text style={s.lockS}>Unlock all {total} cards of {book?.name} and keep them forever.</Text>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 14 }}>
                    <Text style={s.price}>₹{QUICKREAD_PRICE}</Text>
                    <Text style={s.mrp}>₹{QUICKREAD_MRP}</Text>
                  </View>
                  <PressScale onPress={unlock} style={s.unlockBtn}>
                    <Ionicons name="flash" size={16} color="#fff" />
                    <Text style={s.unlockTxt}>Unlock for ₹{QUICKREAD_PRICE}</Text>
                  </PressScale>
                  <Text style={s.note}>Opens TheBookX checkout. Unlocks on this number once paid{profile.phone ? ` (+91 ${profile.phone})` : ""}.</Text>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown} style={[s.card, s.lock, { height: cardH, backgroundColor: C.greenSoft }]}>
                  <Text style={{ fontSize: 48 }}>🎉</Text>
                  <Text style={s.lockH}>You finished it!</Text>
                  <Text style={s.lockS}>All {total} cards of {book?.name}. Come back any time.</Text>
                </Animated.View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: C.muted, textAlign: "center" },
  progressWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.line, overflow: "hidden" },
  fill: { height: 5, backgroundColor: "#F59E0B" },
  count: { fontSize: 12, fontWeight: "600", color: C.ink2, minWidth: 48, textAlign: "right" },
  card: { borderRadius: 22, padding: 24, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  cardN: { fontSize: 12, fontWeight: "700", color: C.brandDark, letterSpacing: 0.6, textTransform: "uppercase" },
  cardT: { fontSize: 24, fontWeight: "700", color: C.ink, marginTop: 12, lineHeight: 31, letterSpacing: -0.3 },
  cardC: { fontSize: 16.5, color: C.ink2, marginTop: 16, lineHeight: 26 },
  swipe: { position: "absolute", bottom: 20, right: 24, fontSize: 12, color: C.muted },
  lock: { alignItems: "center", justifyContent: "center", backgroundColor: "#FFF7ED" },
  lockIc: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
  lockH: { fontSize: 20, fontWeight: "700", color: C.ink, marginTop: 16, textAlign: "center" },
  lockS: { fontSize: 14, color: C.ink2, marginTop: 6, textAlign: "center", lineHeight: 20 },
  price: { fontSize: 32, fontWeight: "700", color: C.ink },
  mrp: { fontSize: 16, color: C.muted, textDecorationLine: "line-through" },
  unlockBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16, backgroundColor: C.green, borderRadius: 12, height: 50, paddingHorizontal: 26 },
  unlockTxt: { color: "#fff", fontWeight: "600", fontSize: 15.5 },
  note: { fontSize: 11.5, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 16 },
});
