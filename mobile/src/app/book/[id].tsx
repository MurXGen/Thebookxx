import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { goBack } from "@/components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddButton from "@/components/AddButton";
import BoughtTogether from "@/components/BoughtTogether";
import { ComboCard } from "@/components/ComboCard";
import EtaStripe from "@/components/EtaStripe";
import PincodeSheet from "@/components/PincodeSheet";
import { Price, Rating } from "@/components/BookCard";
import Rail from "@/components/Rail";
import { catLabel, isOneRupee, offPct } from "@/lib/catalog";
import { shareText } from "@/lib/share";
import { useStore } from "@/lib/store";
import { C, SITE } from "@/theme";

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { byId, catalog, markViewed, isWished, toggleWish, qtyOf, pincode, combos } = useStore();
  const b = byId.get(id || "");
  const [more, setMore] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    if (b) markViewed(b.id);
  }, [b, markViewed]);

  const similar = useMemo(() => {
    if (!b) return [];
    const main = b.cats.find((c) => !["trending", "bestseller", "set"].includes(c)) || b.cats[0];
    return catalog.books.filter((x) => x.id !== b.id && x.cats.includes(main) && !isOneRupee(x)).slice(0, 16);
  }, [b, catalog]);
  // Web PdpCombos order: pairs with this book → bundles with it → the author's other combos.
  const myCombos = useMemo(() => {
    if (!b) return [];
    const ok = (c: (typeof combos)[number]) => c.bookIds.every((x) => (byId.get(x)?.stock ?? 0) > 0);
    const withMe = combos.filter((c) => c.bookIds.includes(b.id) && ok(c));
    const pairs = withMe.filter((c) => c.pct && c.bookIds.length === 2);
    const sets = withMe.filter((c) => !c.pct);
    const author = combos.filter((c) => !c.bookIds.includes(b.id) && ok(c) && c.bookIds.every((x) => byId.get(x)?.author === b.author));
    return [...pairs, ...sets, ...author];
  }, [b, combos, byId]);
  const fbt = myCombos.find((c) => c.pct && c.bookIds.length === 2) || null;
  const byAuthor = useMemo(() => (b ? catalog.books.filter((x) => x.id !== b.id && x.author === b.author).slice(0, 12) : []), [b, catalog]);

  if (!b)
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={{ color: C.muted }}>This book isn’t available right now.</Text>
        <Pressable onPress={goBack} style={[s.buy, { marginTop: 16, paddingHorizontal: 24 }]}>
          <Text style={s.buyTxt}>Go back</Text>
        </Pressable>
      </View>
    );

  const off = offPct(b);
  const soldOut = b.stock <= 0;
  const wished = isWished(b.id);
  const inBag = qtyOf(b.id) > 0;
  const url = `${SITE}/books/${b.slug}`;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 190 }}>
        <View style={[s.top, { paddingTop: insets.top + 56 }]}>
          <Image alt="" source={b.image} style={s.cover} contentFit="cover" cachePolicy="disk" transition={150} />
        </View>
        <View style={s.card}>
          {b.cats.includes("bestseller") ? <Text style={s.tag}>★ BESTSELLER</Text> : null}
          <Text style={s.title}>{b.name}</Text>
          <Text style={s.author}>by {b.author}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
            <Rating b={b} />
            {b.reviews ? <Text style={s.meta}>{b.reviews} reviews</Text> : null}
            {b.stock > 0 && b.stock <= 5 ? <Text style={[s.meta, { color: C.red, fontWeight: "800" }]}>Only {b.stock} left</Text> : null}
          </View>
          <View style={s.priceRow}>
            <View>
              <Price b={b} size={24} />
              {off ? <Text style={s.save}>You save {off}% · Inclusive of all taxes</Text> : null}
            </View>
          </View>
          {pincode ? (
            <EtaStripe onPress={() => setPinOpen(true)} style={{ marginTop: 14 }} />
          ) : (
            <Pressable onPress={() => setPinOpen(true)} style={s.pinAsk}>
              <Ionicons name="location-outline" size={16} color={C.ink} />
              <Text style={s.pinAskTxt}>Check delivery date for your pincode</Text>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </Pressable>
          )}
          {isOneRupee(b) ? (
            <View style={s.note}>
              <Ionicons name="lock-open-outline" size={16} color={C.ink} />
              <Text style={s.noteTxt}>₹1 deal — one ₹1 book per order.</Text>
            </View>
          ) : null}
        </View>

        <View style={s.card}>
          <View style={s.facts}>
            {[
              { k: "Format", v: b.format || "Paperback" },
              { k: "Language", v: b.lang || "English" },
              { k: "Pages", v: b.pages || "—" },
            ].map((f) => (
              <View key={f.k} style={s.fact}>
                <Text style={s.factK}>{f.k}</Text>
                <Text style={s.factV}>{f.v}</Text>
              </View>
            ))}
          </View>
          <View style={s.perks}>
            {[
              { i: "cash-outline" as const, t: "Cash on Delivery" },
              { i: "refresh-outline" as const, t: "7-day returns" },
              { i: "shield-checkmark-outline" as const, t: "Original book" },
            ].map((p) => (
              <View key={p.t} style={s.perk}>
                <Ionicons name={p.i} size={20} color={C.ink} />
                <Text style={s.perkTxt}>{p.t}</Text>
              </View>
            ))}
          </View>
        </View>

        {b.desc ? (
          <View style={s.card}>
            <Text style={s.h}>About this book</Text>
            <Text style={s.desc} numberOfLines={more ? undefined : 5}>{b.desc}</Text>
            <Pressable onPress={() => setMore(!more)} hitSlop={8}>
              <Text style={s.more}>{more ? "Show less" : "Read more"}</Text>
            </Pressable>
            <View style={s.cats}>
              {b.cats.filter((c) => c !== "set").slice(0, 6).map((c) => (
                <Pressable key={c} onPress={() => router.push(`/category/${c}`)} style={s.catChip}>
                  <Text style={s.catChipTxt}>{catLabel(c)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {fbt ? <BoughtTogether combo={fbt} book={b} /> : null}

        {myCombos.length > (fbt ? 1 : 0) ? (
          <View style={s.comboBlock}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.h}>Combos with this book</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>Buy together and save more</Text>
              </View>
              <Pressable onPress={() => router.push("/combos")} hitSlop={8}>
                <Text style={{ color: C.brandDark, fontWeight: "600", fontSize: 13 }}>See all</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={myCombos.filter((c) => c.id !== fbt?.id).slice(0, 12)}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => <ComboCard c={item} width={240} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            />
          </View>
        ) : null}

        {byAuthor.length ? <Rail title={`More by ${b.author}`} books={byAuthor} /> : null}
        <Rail title="You may also like" books={similar} />
      </ScrollView>

      {/* Floating top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={goBack} style={s.round} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color={C.ink} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => shareText(`${b.name} by ${b.author} — ₹${b.price} on TheBookX\n${url}`)} style={s.round} accessibilityLabel="Share">
          <Ionicons name="share-social-outline" size={19} color={C.ink} />
        </Pressable>
        <Pressable onPress={() => toggleWish(b.id)} style={s.round} accessibilityLabel="Wishlist">
          <Ionicons name={wished ? "heart" : "heart-outline"} size={20} color={wished ? C.red : C.ink} />
        </Pressable>
      </View>

      {/* Sticky buy bar */}
      <View style={[s.buyBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Price b={b} size={18} />
          <Text style={s.meta}>{soldOut ? "Currently out of stock" : "Delivery across India"}</Text>
        </View>
        {inBag ? (
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <AddButton id={b.id} />
            <Pressable onPress={() => router.navigate("/bag")} style={[s.buy, { paddingHorizontal: 16 }]}>
              <Text style={s.buyTxt}>Go to bag</Text>
            </Pressable>
          </View>
        ) : (
          <AddButton id={b.id} soldOut={soldOut} />
        )}
      </View>
      <PincodeSheet open={pinOpen} onClose={() => setPinOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  comboBlock: { backgroundColor: "#fff", marginTop: 10, paddingVertical: 18 },
  pinAsk: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: C.line },
  pinAskTxt: { flex: 1, fontSize: 13, fontWeight: "600", color: C.ink },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  top: { backgroundColor: "#ECEAE6", alignItems: "center", paddingBottom: 24 },
  cover: { width: 190, height: 275, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
  card: { backgroundColor: "#fff", padding: 16, marginTop: 10 },
  tag: { color: C.brandDark, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: "800", color: C.ink, letterSpacing: -0.4, marginTop: 4 },
  author: { fontSize: 14, color: C.muted, marginTop: 4, fontWeight: "600" },
  meta: { fontSize: 12, color: C.muted },
  priceRow: { marginTop: 14, flexDirection: "row", alignItems: "center" },
  save: { color: C.green, fontWeight: "700", fontSize: 12, marginTop: 2 },
  note: { flexDirection: "row", gap: 8, marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: C.bg },
  noteTxt: { flex: 1, fontSize: 12.5, color: C.ink2 },
  facts: { flexDirection: "row" },
  fact: { flex: 1 },
  factK: { fontSize: 11, color: C.muted, fontWeight: "700", textTransform: "uppercase" },
  factV: { fontSize: 14, color: C.ink, fontWeight: "800", marginTop: 3 },
  perks: { flexDirection: "row", marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  perk: { flex: 1, alignItems: "center", gap: 5 },
  perkTxt: { fontSize: 11, fontWeight: "700", color: C.ink2 },
  h: { fontSize: 17, fontWeight: "800", color: C.ink, marginBottom: 8 },
  desc: { fontSize: 14, color: C.ink2, lineHeight: 21 },
  more: { color: C.ink, fontWeight: "800", marginTop: 6, textDecorationLine: "underline" },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  catChip: { backgroundColor: C.bg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  catChipTxt: { fontSize: 12, fontWeight: "700", color: C.ink2 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", gap: 10, paddingHorizontal: 14 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 3, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6 },
  buyBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line, elevation: 12 },
  buy: { backgroundColor: C.ink, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  buyTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
