import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GridCard } from "@/components/BookCard";
import Animated, { FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { navHidden, useHideNavOnScroll } from "@/lib/navScroll";
import { Garland, isXmas, Snow, XmasPromo, XmasTree } from "@/components/Xmas";
import CartBar from "@/components/CartBar";
import UpdateBanner from "@/components/UpdateBanner";
import { ComboCard } from "@/components/ComboCard";
import { useEta } from "@/components/EtaStripe";
import { fmtCountdown } from "@/lib/eta";
import PincodeSheet from "@/components/PincodeSheet";
import Rail, { Block, SectionTitle } from "@/components/Rail";
import { categoriesOf, isOneRupee, type Book, type Combo } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

const LOGO = require("@/assets/images/icon.png");
const HINTS = ["Atomic Habits", "The Psychology of Money", "Ikigai", "thrillers", "₹1 books", "Robert Greene"];

const SORTS = [
  { key: "pop", label: "Popular" },
  { key: "low", label: "Price: Low → High" },
  { key: "high", label: "Price: High → Low" },
  { key: "rating", label: "Top rated" },
] as const;
const FILTERS = [
  { key: "under199", label: "Under ₹199" },
  { key: "bestseller", label: "Bestsellers" },
  { key: "fiction", label: "Fiction" },
  { key: "self-help", label: "Self help" },
  { key: "rated", label: "Rated 4.5+" },
] as const;

function Header({ onPin }: { onPin: () => void }) {
  const insets = useSafeAreaInsets();
  const { pincode, wishlist } = useStore();
  const [hint, setHint] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={[s.header, { paddingTop: isXmas() ? 0 : insets.top + 8 }]}>
      {isXmas() ? (
        <View style={{ marginHorizontal: -16, marginBottom: 10, paddingTop: insets.top, backgroundColor: "#B91C1C" }}>
          <XmasPromo />
        </View>
      ) : null}
      {isXmas() ? <Snow count={8} ink /> : null}
      <Collapse>
      <View style={[s.topRow, { paddingBottom: 12 }]}>
        <Image alt="" source={LOGO} style={s.logo} />
        <Pressable onPress={onPin} style={{ flex: 1 }} hitSlop={6}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="location" size={15} color={C.ink} />
            <Text style={s.deliver}>{pincode ? pincode : "Add pincode"}</Text>
            <Ionicons name="chevron-down" size={15} color={C.ink} />
          </View>
          <DeliverySub />
        </Pressable>
        <Pressable onPress={() => router.push("/wishlist")} style={s.iconBtn} hitSlop={8} accessibilityLabel="Wishlist">
          <Ionicons name="heart-outline" size={21} color={C.ink} />
          {wishlist.length ? <View style={s.dot} /> : null}
        </Pressable>
        <Pressable onPress={() => router.push("/account")} style={s.iconBtn} hitSlop={8} accessibilityLabel="Account">
          <Ionicons name="person-outline" size={20} color={C.ink} />
        </Pressable>
      </View>
      </Collapse>
      <Pressable onPress={() => router.push("/search")} style={s.search} accessibilityRole="search">
        <View style={s.hintBox}>
          <Text style={s.searchTxt}>Search for </Text>
          <Animated.View key={hint} entering={FadeInDown.duration(320)} exiting={FadeOutUp.duration(240)} style={{ flex: 1 }}>
            <Text style={[s.searchTxt, { color: C.ink2 }]} numberOfLines={1}>“{HINTS[hint]}”</Text>
          </Animated.View>
        </View>
        <Ionicons name="search" size={20} color={C.ink2} />
      </Pressable>
    </View>
  );
}

// "Get it Tue 24 – Sat 28 Nov · Mumbai" under the pincode (same ETA rules as the web).
function DeliverySub() {
  const { pincode } = useStore();
  const { eta, dates, place } = useEta();
  if (!pincode) return <Text style={s.deliverSub} numberOfLines={1}>Add a pincode to see delivery dates</Text>;
  return (
    <Text style={s.deliverSub} numberOfLines={1}>
      {eta.shipsToday ? <Text style={{ color: C.green, fontWeight: "600" }}>Order in {fmtCountdown(eta.msToCutoff)} · </Text> : null}
      Get it <Text style={{ color: C.ink, fontWeight: "600" }}>{dates}</Text>
      {place ? ` · ${place}` : ""}
    </Text>
  );
}

// Folds its content away while the reader scrolls down (navHidden → 1) and
// unfolds on scroll-up, so only the search bar stays pinned.
function Collapse({ children }: { children: React.ReactNode }) {
  const h = useSharedValue(0);
  const a = useAnimatedStyle(() => {
    const p = navHidden.get();
    if (!h.get()) return {};
    return { height: h.get() * (1 - p), opacity: 1 - p * 1.4, overflow: "hidden" };
  });
  return (
    <Animated.View style={a}>
      <View onLayout={(e) => h.set(e.nativeEvent.layout.height)}>{children}</View>
    </Animated.View>
  );
}

function CategoryCircles({ books }: { books: Book[] }) {
  const cats = useMemo(() => categoriesOf(books).slice(0, 16), [books]);
  const rows = [cats.filter((_, i) => i % 2 === 0), cats.filter((_, i) => i % 2 === 1)];
  return (
    <Block>
      <SectionTitle title="What's on your reading list?" href="/explore" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={{ gap: 14 }}>
          {rows.map((row, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12 }}>
              {row.map((c) => (
                <Pressable key={c.slug} onPress={() => router.push(`/category/${c.slug}`)} style={s.cat}>
                  <View style={s.catCircle}>
                    <Image alt="" source={c.cover} style={s.catImg} contentFit="cover" cachePolicy="disk" />
                  </View>
                  <Text style={s.catLabel} numberOfLines={1}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </Block>
  );
}

// Combos: 2-book pairs (10% off together) first, then the bigger bundles.
function ComboRail({ combos }: { combos: Combo[] }) {
  const picks = useMemo(() => {
    const pairs = combos.filter((c) => c.pct).slice(0, 8);
    const sets = combos.filter((c) => !c.pct).slice(0, 6);
    return [...pairs.slice(0, 4), ...sets.slice(0, 3), ...pairs.slice(4), ...sets.slice(3)];
  }, [combos]);
  if (!picks.length) return null;
  return (
    <Block>
      <SectionTitle title="Combos & bundles" sub="Buy together, save more · 10% off pairs" href="/combos" />
      <FlatList
        horizontal
        data={picks}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ComboCard c={item} width={250} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        initialNumToRender={3}
      />
    </Block>
  );
}

function Footer() {
  return (
    <View style={s.footer}>
      <Text style={s.footerBig}>Read more.{"\n"}Pay less.</Text>
      <View style={{ flexDirection: "row", gap: 16, marginTop: 14 }}>
        {[
          { i: "shield-checkmark-outline" as const, t: "Original books" },
          { i: "cash-outline" as const, t: "Cash on delivery" },
          { i: "refresh-outline" as const, t: "7-day returns" },
        ].map((x) => (
          <View key={x.t} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name={x.i} size={14} color="#A3A3AD" />
            <Text style={s.footerSmall}>{x.t}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.footerSmall, { marginTop: 10 }]}>Crafted with ❤️ for readers across India · TheBookX</Text>
    </View>
  );
}

export default function Home() {
  const { catalog, refreshing, refreshCatalog, recent, byId, combos } = useStore();
  const { width } = useWindowDimensions();
  const [pinOpen, setPinOpen] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("pop");
  const [filters, setFilters] = useState<string[]>([]);
  const books = catalog.books;

  const rails = useMemo(() => {
    const has = (c: string) => (b: Book) => b.cats.includes(c) && !isOneRupee(b);
    return {
      rupee: books.filter((b) => isOneRupee(b) && b.stock > 0),
      trending: books.filter(has("trending")),
      best: books.filter(has("bestseller")),
      fresh: [...books].reverse().filter((b) => !isOneRupee(b)).slice(0, 20),
      sets: books.filter(has("set")),
      fiction: books.filter(has("fiction")),
      kids: books.filter((b) => b.cats.some((c) => c === "children" || c === "graphic-novel")),
    };
  }, [books]);

  const recentBooks = useMemo(() => recent.map((id) => byId.get(id)).filter((b): b is Book => !!b), [recent, byId]);

  const grid = useMemo(() => {
    let list = books.filter((b) => !isOneRupee(b));
    for (const f of filters) {
      if (f === "under199") list = list.filter((b) => b.price < 199);
      else if (f === "rated") list = list.filter((b) => (b.rating || 0) >= 4.5);
      else list = list.filter((b) => b.cats.includes(f));
    }
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "pop") list = [...list].sort((a, b) => Number(b.cats.includes("bestseller")) - Number(a.cats.includes("bestseller")));
    return list.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
  }, [books, filters, sort]);

  const cardW = (width - 16 * 2 - 14) / 2;
  const onScroll = useHideNavOnScroll();

  const header = (
    <View>
      <UpdateBanner />
      {isXmas() ? <Garland style={{ marginBottom: -34 }} /> : null}
      {recentBooks.length ? <Rail title="Pick up where you left off" books={recentBooks} width={112} /> : null}
      <CategoryCircles books={books} />
      <Rail title="Trending now" sub="Hot right now" books={rails.trending} href="/category/trending" />
      <ComboRail combos={combos} />
      <Rail title="Books at ₹1" sub="Hand-picked reads · one ₹1 book per order" books={rails.rupee} href="/category/one-rupee" />
      <Rail title="Bestsellers" sub="What India is reading" books={rails.best} href="/category/bestseller" />
      <Rail title="Box sets & series" sub="Complete collections, one price" books={rails.sets} href="/category/set" width={150} />
      <Rail title="Just arrived" sub="Fresh on the shelf" books={rails.fresh} />
      <Rail title="Fiction you can't put down" books={rails.fiction} href="/category/fiction" />
      <Rail title="For young readers" books={rails.kids} href="/category/children" />
      <View style={s.allHead}>
        <SectionTitle title={`All books (${grid.length})`} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <Pressable
            onPress={() => setSort(SORTS[(SORTS.findIndex((x) => x.key === sort) + 1) % SORTS.length].key)}
            style={[s.chip, s.chipOn]}
          >
            <Ionicons name="swap-vertical" size={13} color="#fff" />
            <Text style={[s.chipTxt, { color: "#fff" }]}>{SORTS.find((x) => x.key === sort)?.label}</Text>
          </Pressable>
          {FILTERS.map((f) => {
            const on = filters.includes(f.key);
            return (
              <Pressable key={f.key} onPress={() => setFilters((xs) => (on ? xs.filter((x) => x !== f.key) : [...xs, f.key]))} style={[s.chip, on && s.chipSel]}>
                <Text style={[s.chipTxt, on && { color: C.ink }]}>{f.label}</Text>
                {on ? <Ionicons name="close" size={13} color={C.ink} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header onPin={() => setPinOpen(true)} />
      <Animated.FlatList
        onScroll={onScroll}
        scrollEventThrottle={16}
        data={grid}
        keyExtractor={(b: Book) => b.id}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 18, backgroundColor: "#fff" }}
        renderItem={({ item }: { item: Book }) => <GridCard b={item} width={cardW} />}
        initialNumToRender={6}
        windowSize={7}
        maxToRenderPerBatch={8}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshCatalog} tintColor={C.ink} />}
        ListEmptyComponent={<Text style={s.empty}>No books match these filters.</Text>}
        ListFooterComponent={<Footer />}
      />
      <CartBar />
      <PincodeSheet open={pinOpen} onClose={() => setPinOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10 },
  deliver: { fontSize: 17, fontWeight: "800", color: C.ink },
  deliverSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  search: { marginTop: 0, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E2E8", borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchTxt: { color: C.muted, fontSize: 14.5 },
  hintBox: { flex: 1, flexDirection: "row", alignItems: "center", height: 22, overflow: "hidden" },
  cat: { width: 76, alignItems: "center" },
  catCircle: { width: 70, height: 70, borderRadius: 35, overflow: "hidden", backgroundColor: C.bg, borderWidth: 1, borderColor: "#E4E4EA" },
  catImg: { width: "100%", height: "100%" },
  catLabel: { marginTop: 6, fontSize: 12, fontWeight: "700", color: C.ink2 },
  allHead: { marginTop: 10, backgroundColor: "#fff", paddingTop: 18, paddingBottom: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#DADAE0", backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipSel: { backgroundColor: C.brandSoft, borderColor: C.brand },
  chipTxt: { fontSize: 12.5, fontWeight: "700", color: C.ink2 },
  empty: { textAlign: "center", color: C.muted, paddingVertical: 30, backgroundColor: "#fff" },
  footer: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 250 },
  footerBig: { fontSize: 40, lineHeight: 44, fontWeight: "800", color: "#C9C9D0", letterSpacing: -1 },
  footerSmall: { fontSize: 11.5, color: "#A3A3AD", fontWeight: "600" },
});
