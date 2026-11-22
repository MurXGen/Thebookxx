import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { goBack } from "@/components/BackButton";
import { GridCard, RowCard } from "@/components/BookCard";
import CartBar from "@/components/CartBar";
import { Text } from "@/components/ui-text";
import { catColor, catLabel, CATEGORY_META, isOneRupee, type Book } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

const SORTS = { pop: "Popular", low: "Price: low", high: "Price: high" } as const;

export default function Category() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { catalog } = useStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [grid, setGrid] = useState(true);
  const [sort, setSort] = useState<keyof typeof SORTS>("pop");
  const rupeeMode = slug === "one-rupee";
  const title = rupeeMode ? "Books at ₹1" : catLabel(slug || "");
  const tagline = rupeeMode ? "Hand-picked reads · one ₹1 book per order" : CATEGORY_META[slug || ""]?.tagline || "Handpicked reads at the best prices";
  const color = rupeeMode ? C.ink : catColor(slug || "");

  const books = useMemo(() => {
    let l = rupeeMode ? catalog.books.filter(isOneRupee) : catalog.books.filter((b) => b.cats.includes(slug || "") && !isOneRupee(b));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
  }, [catalog, slug, rupeeMode, sort]);
  const cardW = (width - 32 - 14) / 2;

  // Collapsing header: the banner title scrolls away and a compact title
  // fades/slides into the top bar.
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const barBg = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [20, 90], [0, 1], Extrapolation.CLAMP) }));
  const barTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [60, 110], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [60, 110], [10, 0], Extrapolation.CLAMP) }],
  }));
  const heroFade = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 90], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [0, 120], [0, -24], Extrapolation.CLAMP) }],
  }));

  const barH = insets.top + 56;
  const head = (
    <View>
      <View style={[s.hero, { backgroundColor: color, paddingTop: barH + 4 }]}>
        <Animated.View style={heroFade}>
          <Animated.View entering={FadeInDown.duration(380)}>
            <Text style={s.heroH}>{title}</Text>
            <Text style={s.heroSub}>{tagline}</Text>
            <View style={s.countPill}>
              <Ionicons name="book-outline" size={12} color="#fff" />
              <Text style={s.countTxt}>{books.length} books</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
      <View style={s.tools}>
        <Pressable onPress={() => setSort(sort === "pop" ? "low" : sort === "low" ? "high" : "pop")} style={s.tool}>
          <Ionicons name="swap-vertical" size={14} color={C.ink} />
          <Text style={s.toolTxt}>{SORTS[sort]}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setGrid(!grid)} style={s.tool} accessibilityLabel="Toggle layout">
          <Ionicons name={grid ? "list" : "grid-outline"} size={15} color={C.ink} />
          <Text style={s.toolTxt}>{grid ? "List" : "Grid"}</Text>
        </Pressable>
      </View>
    </View>
  );

  const render = ({ item }: { item: Book }) => (grid ? <GridCard b={item} width={cardW} /> : <RowCard b={item} />);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.FlatList
        key={grid ? "grid" : "list"}
        data={books}
        numColumns={grid ? 2 : 1}
        keyExtractor={(b: Book) => b.id}
        ListHeaderComponent={head}
        columnWrapperStyle={grid ? { paddingHorizontal: 16, gap: 14, marginBottom: 20 } : undefined}
        renderItem={render}
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialNumToRender={6}
        ListFooterComponent={<View style={{ height: 180 }} />}
      />

      <View style={[s.bar, { height: barH, paddingTop: insets.top }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color }, barBg]} />
        <Pressable onPress={goBack} hitSlop={10} style={s.back} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color="#fff" />
        </Pressable>
        <Animated.View style={[{ flex: 1 }, barTitle]}>
          <Text style={s.barTitle} numberOfLines={1}>{title}</Text>
          <Text style={s.barSub} numberOfLines={1}>{books.length} books</Text>
        </Animated.View>
        <Pressable onPress={() => router.push("/search")} hitSlop={10} style={s.back} accessibilityLabel="Search">
          <Ionicons name="search" size={19} color="#fff" />
        </Pressable>
      </View>
      <CartBar safeBottom />
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 22 },
  heroH: { color: "#fff", fontSize: 26, fontWeight: "700", letterSpacing: -0.4 },
  heroSub: { color: "rgba(255,255,255,0.82)", fontSize: 13.5, marginTop: 4 },
  countPill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 12, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  countTxt: { color: "#fff", fontSize: 12, fontWeight: "500" },
  tools: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  tool: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  toolTxt: { fontSize: 12.5, fontWeight: "500", color: C.ink },
  bar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  barTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  barSub: { color: "rgba(255,255,255,0.75)", fontSize: 11.5 },
});
