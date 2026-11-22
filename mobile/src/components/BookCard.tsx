import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import AddButton from "@/components/AddButton";
import { PressScale } from "@/components/motion";
import { offPct, type Book } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C, rupee } from "@/theme";

export function Price({ b, size = 14 }: { b: Book; size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
      <Text style={{ fontSize: size, fontWeight: "800", color: C.ink }}>{rupee(b.price)}</Text>
      {b.mrp > b.price ? <Text style={{ fontSize: size - 3, color: C.muted, textDecorationLine: "line-through" }}>{rupee(b.mrp)}</Text> : null}
    </View>
  );
}

export function Rating({ b }: { b: Book }) {
  if (!b.rating) return null;
  return (
    <View style={s.rating}>
      <Ionicons name="star" size={9} color="#fff" />
      <Text style={s.ratingTxt}>{b.rating.toFixed(1)}</Text>
    </View>
  );
}

function Heart({ id }: { id: string }) {
  const { isWished, toggleWish } = useStore();
  const on = isWished(id);
  return (
    <Pressable hitSlop={10} onPress={() => toggleWish(id)} style={s.heart} accessibilityLabel={on ? "Remove from wishlist" : "Add to wishlist"}>
      <Ionicons name={on ? "heart" : "heart-outline"} size={16} color={on ? C.red : "#fff"} />
    </Pressable>
  );
}

// Rail / grid card (Swiggy Instamart style): ADD sits on the cover's
// bottom-right corner; discount badge top-left; price leads the text block.
function BookCardInner({ b, width = 132 }: { b: Book; width?: number }) {
  const off = offPct(b);
  const soldOut = b.stock <= 0;
  const h = Math.round(width * 1.4);
  return (
    <PressScale onPress={() => router.push(`/book/${b.id}`)} style={{ width }} accessibilityLabel={`${b.name} by ${b.author}, ₹${b.price}`}>
      <View style={{ width, height: h }}>
        <View style={[s.coverWrap, { width, height: h }]}>
          <Image alt="" source={b.image} style={s.cover} contentFit="cover" transition={150} cachePolicy="disk" recyclingKey={b.id} />
          {soldOut ? <View style={s.dim} /> : null}
        </View>
        {off >= 10 || b.price === 1 ? (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{b.price === 1 ? "₹1 DEAL" : `${off}% OFF`}</Text>
          </View>
        ) : null}
        <Heart id={b.id} />
        <View style={s.addCorner}>
          <AddButton id={b.id} compact soldOut={soldOut} />
        </View>
      </View>
      <View style={s.info}>
        <Price b={b} />
        <Text numberOfLines={2} style={s.title}>{b.name}</Text>
        <Text numberOfLines={1} style={s.author}>{b.author}</Text>
        {b.rating ? (
          <View style={{ marginTop: 5, flexDirection: "row" }}>
            <Rating b={b} />
          </View>
        ) : null}
      </View>
    </PressScale>
  );
}
export const BookCard = memo(BookCardInner);

// Two-column grid tile for listings.
function GridCardInner({ b, width }: { b: Book; width: number }) {
  return <BookCardInner b={b} width={width} />;
}
export const GridCard = memo(GridCardInner);

// List row (search results, wishlist, category list view).
function RowCardInner({ b }: { b: Book }) {
  const soldOut = b.stock <= 0;
  const off = offPct(b);
  return (
    <PressScale scaleTo={0.985} onPress={() => router.push(`/book/${b.id}`)} style={s.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        {b.cats.includes("bestseller") ? <Text style={s.tag}>★ Bestseller</Text> : null}
        <Text numberOfLines={2} style={[s.title, { fontSize: 15, marginTop: 2 }]}>{b.name}</Text>
        <Text numberOfLines={1} style={s.author}>{b.author}</Text>
        <View style={[s.metaRow, { justifyContent: "flex-start", gap: 8, marginTop: 6 }]}>
          <Price b={b} size={15} />
          {off >= 10 ? <Text style={s.offTxt}>{off}% off</Text> : null}
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" }}>
          <Rating b={b} />
          {b.format ? <Text style={s.chipTxt}>{b.format}</Text> : null}
          {b.stock > 0 && b.stock <= 5 ? <Text style={[s.chipTxt, { color: C.red }]}>Only {b.stock} left</Text> : null}
        </View>
      </View>
      <View style={{ width: 104, alignItems: "center" }}>
        <View style={[s.coverWrap, { width: 104, height: 140 }]}>
          <Image alt="" source={b.image} style={s.cover} contentFit="cover" transition={150} cachePolicy="disk" recyclingKey={b.id} />
          <Heart id={b.id} />
        </View>
        <View style={{ marginTop: -18 }}>
          <AddButton id={b.id} compact soldOut={soldOut} />
        </View>
      </View>
    </PressScale>
  );
}
export const RowCard = memo(RowCardInner);

const s = StyleSheet.create({
  coverWrap: { borderRadius: 12, overflow: "hidden", backgroundColor: "#F2F2F4", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E4E4EA" },
  cover: { width: "100%", height: "100%" },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(255,255,255,0.55)" },
  badge: { position: "absolute", left: 0, top: 0, backgroundColor: C.brand, paddingHorizontal: 7, paddingVertical: 3, borderTopLeftRadius: 12, borderBottomRightRadius: 10 },
  badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  addCorner: { position: "absolute", right: 6, bottom: -14 },
  info: { marginTop: 18 },
  heart: { position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  title: { marginTop: 3, fontSize: 13, fontWeight: "700", color: C.ink, lineHeight: 17 },
  author: { fontSize: 12, color: C.muted, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  rating: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: C.green, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  ratingTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  row: { flexDirection: "row", paddingVertical: 16, paddingHorizontal: 16, backgroundColor: C.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  tag: { color: C.brandDark, fontSize: 11, fontWeight: "800" },
  offTxt: { color: C.green, fontSize: 12, fontWeight: "800" },
  chipTxt: { fontSize: 11, color: C.muted, fontWeight: "600" },
});
