import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { getProgress, QUICKREAD_FREE_FRAMES, QUICKREAD_MRP, QUICKREAD_PRICE } from "@/lib/quickreads";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

export default function QuickReads() {
  const { catalog, byId } = useStore();
  const { width } = useWindowDimensions();
  const [progress, setProgressState] = useState<Record<string, number>>({});
  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgressState);
    }, []),
  );
  const items = useMemo(
    () =>
      Object.entries(catalog.quickreads || {})
        .map(([id, m]) => ({ id, ...m, book: byId.get(id) }))
        .filter((x) => x.book)
        .sort((a, b) => Number(progress[b.id] != null) - Number(progress[a.id] != null)),
    [catalog, byId, progress],
  );
  const cardW = (width - 16 * 2 - 12) / 2;

  const header = (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <LinearGradient colors={["#1C1C1E", "#3A3A40"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.heroIc}>
          <Ionicons name="flash" size={22} color="#FBBF24" />
        </View>
        <Text style={s.heroH}>QuickReads</Text>
        <Text style={s.heroS}>The big ideas of bestselling books, in bite-sized cards. Read {QUICKREAD_FREE_FRAMES} cards free, unlock the rest for ₹{QUICKREAD_PRICE}.</Text>
        <View style={s.heroRow}>
          <Text style={s.heroChip}>⚡ 5-min reads</Text>
          <Text style={s.heroChip}>📚 {items.length} books</Text>
          <Text style={s.heroChip}>₹{QUICKREAD_PRICE} <Text style={{ textDecorationLine: "line-through", color: "rgba(255,255,255,0.6)" }}>₹{QUICKREAD_MRP}</Text></Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg }}
      data={items}
      numColumns={2}
      keyExtractor={(x) => x.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
      renderItem={({ item, index }) => {
        const read = progress[item.id];
        const pct = read != null ? Math.min(1, (read + 1) / item.count) : 0;
        return (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50)} style={{ width: cardW }}>
            <PressScale scaleTo={0.97} onPress={() => router.push({ pathname: "/quickread/[id]", params: { id: item.id } })} style={s.card}>
              <View style={s.coverWrap}>
                <Image alt="" source={item.book!.image} style={s.cover} contentFit="cover" />
                <View style={s.countTag}>
                  <Ionicons name="layers" size={11} color="#fff" />
                  <Text style={s.countTxt}>{item.count} cards</Text>
                </View>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.title} numberOfLines={2}>{item.book!.name}</Text>
                <Text style={s.tag} numberOfLines={2}>{item.tagline}</Text>
                {read != null ? (
                  <View style={s.track}>
                    <View style={[s.fill, { width: `${pct * 100}%` }]} />
                  </View>
                ) : (
                  <Text style={s.free}>{QUICKREAD_FREE_FRAMES} cards free</Text>
                )}
              </View>
            </PressScale>
          </Animated.View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 20, padding: 18, marginBottom: 16 },
  heroIc: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(251,191,36,0.15)", alignItems: "center", justifyContent: "center" },
  heroH: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 10 },
  heroS: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4, lineHeight: 19 },
  heroRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  heroChip: { color: "#fff", fontSize: 12, fontWeight: "600", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, overflow: "hidden" },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.line },
  coverWrap: { height: 150, backgroundColor: "#F3F1EC" },
  cover: { width: "100%", height: "100%" },
  countTag: { position: "absolute", left: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  countTxt: { color: "#fff", fontSize: 10.5, fontWeight: "600" },
  title: { fontSize: 13.5, fontWeight: "600", color: C.ink, lineHeight: 18 },
  tag: { fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 15 },
  free: { fontSize: 11, color: C.green, fontWeight: "700", marginTop: 6 },
  track: { height: 4, borderRadius: 2, backgroundColor: C.line, marginTop: 8, overflow: "hidden" },
  fill: { height: 4, backgroundColor: "#F59E0B" },
});
