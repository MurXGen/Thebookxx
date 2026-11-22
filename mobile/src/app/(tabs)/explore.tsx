import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import CartBar from "@/components/CartBar";
import { useHideNavOnScroll } from "@/lib/navScroll";
import { catColor, categoriesOf, CATEGORY_META } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

export default function Explore() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { catalog } = useStore();
  const cats = useMemo(() => categoriesOf(catalog.books, 3), [catalog]);
  const tileW = (width - 16 * 2 - 12) / 2;
  const onScroll = useHideNavOnScroll();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Text style={s.h1}>Explore</Text>
        <Pressable onPress={() => router.push("/search")} style={s.search}>
          <Ionicons name="search" size={19} color={C.ink2} />
          <Text style={s.searchTxt}>Search books, authors, genres</Text>
        </Pressable>
      </View>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 16, paddingBottom: 250 }}>
        <Pressable onPress={() => router.push("/category/one-rupee")} style={s.rupee}>
          <View style={{ flex: 1 }}>
            <Text style={s.rupeeH}>Books at ₹1</Text>
            <Text style={s.rupeeSub}>Hand-picked reads · one ₹1 book per order</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color="#fff" />
        </Pressable>
        <Text style={s.section}>Shop by genre</Text>
        <View style={s.grid}>
          {cats.map((c) => (
            <Pressable key={c.slug} onPress={() => router.push(`/category/${c.slug}`)} style={[s.tile, { width: tileW, backgroundColor: catColor(c.slug) }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.tileH} numberOfLines={2}>{c.label}</Text>
                <Text style={s.tileSub}>{c.count} books</Text>
                <Text style={s.tileTag} numberOfLines={2}>{CATEGORY_META[c.slug]?.tagline}</Text>
              </View>
              <Image alt="" source={c.cover} style={s.tileImg} contentFit="cover" cachePolicy="disk" />
            </Pressable>
          ))}
        </View>
      </Animated.ScrollView>
      <CartBar />
    </View>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  h1: { fontSize: 26, fontWeight: "800", color: C.ink, letterSpacing: -0.5 },
  search: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 14, height: 46 },
  searchTxt: { color: C.muted, fontSize: 15 },
  rupee: { backgroundColor: C.ink, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center" },
  rupeeH: { color: "#fff", fontSize: 20, fontWeight: "800" },
  rupeeSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 3 },
  section: { fontSize: 18, fontWeight: "800", color: C.ink, marginTop: 22, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { height: 128, borderRadius: 16, padding: 14, overflow: "hidden", flexDirection: "row" },
  tileH: { color: "#fff", fontSize: 16, fontWeight: "800" },
  tileSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", marginTop: 2 },
  tileTag: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 8, paddingRight: 40 },
  tileImg: { position: "absolute", right: -10, bottom: -14, width: 62, height: 90, borderRadius: 6, transform: [{ rotate: "12deg" }] },
});
