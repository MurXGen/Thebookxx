import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddButton from "@/components/AddButton";
import BagAddons from "@/components/BagAddons";
import BillSheet from "@/components/BillSheet";
import EtaStripe, { useEta } from "@/components/EtaStripe";
import OfferStrip from "@/components/OfferStrip";
import { useAboveTabBar } from "@/lib/navScroll";
import Rail from "@/components/Rail";

import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from "react-native-reanimated";
import { bagWindows } from "@/lib/eta";
import { bookmarkCharge, deliveryCharge, FREE_DELIVERY_AT, FREE_DELIVERY_AT_ONE_RUPEE } from "@/lib/pricing";
import { isOneRupee, type Book } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C, rupee } from "@/theme";

export default function Bag() {
  const insets = useSafeAreaInsets();
  const above = useAboveTabBar();
  const { cart, byId, catalog, subtotal, mrpTotal, cartCount, remove, pincode, offerDiscount, offerLabel, hasOneRupee, addons, flatDiscount, comboDiscount } = useStore();
  const [billOpen, setBillOpen] = useState(false);
  const fastEta = useEta({ faster: true });
  const lines = cart.map((l) => ({ ...l, b: byId.get(l.id) })).filter((l): l is { id: string; qty: number; b: Book } => !!l.b);

  const suggestions = useMemo(() => {
    const inBag = new Set(cart.map((l) => l.id));
    const pool = !hasOneRupee ? catalog.books.filter(isOneRupee) : catalog.books.filter((b) => b.cats.includes("bestseller") && !isOneRupee(b));
    return pool.filter((b) => !inBag.has(b.id) && b.stock > 0).slice(0, 16);
  }, [catalog, cart, hasOneRupee]);

  if (!lines.length)
    return (
      <View style={[s.empty, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="bag-handle-outline" size={64} color="#C9C9D0" />
        <Text style={s.emptyH}>Your bag is empty</Text>
        <Text style={s.emptySub}>Good books are waiting. Start with today’s bestsellers.</Text>
        <Pressable onPress={() => router.navigate("/")} style={s.emptyBtn}>
          <Text style={s.emptyBtnTxt}>Browse books</Text>
        </Pressable>
      </View>
    );

  const savings = mrpTotal - subtotal;
  const delivery = deliveryCharge(subtotal, addons.faster, hasOneRupee);
  const bmCharge = bookmarkCharge(addons.bookmarks, subtotal);
  const freeAt = hasOneRupee ? FREE_DELIVERY_AT_ONE_RUPEE : FREE_DELIVERY_AT;
  const toPay = subtotal - offerDiscount + delivery + bmCharge;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Text style={s.h1}>Bag</Text>
        <Text style={s.sub}>{cartCount} item{cartCount > 1 ? "s" : ""}</Text>
        {pincode ? <EtaStripe style={{ marginTop: 10 }} /> : null}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 220 }}>
        <OfferStrip />
        {savings > 0 ? (
          <View style={s.saveBanner}>
            <Text style={s.saveTxt}>🎉 You’re saving {rupee(savings + offerDiscount)} on this order</Text>
          </View>
        ) : null}

        <View style={s.block}>
          {lines.map(({ id, qty, b }) => (
            <Animated.View key={id} entering={FadeInRight.duration(260)} exiting={FadeOutLeft.duration(200)} layout={LinearTransition.springify().damping(18)} style={s.line}>
              <Pressable onPress={() => router.push(`/book/${id}`)}>
                <Image alt="" source={b.image} style={s.thumb} contentFit="cover" cachePolicy="disk" />
              </Pressable>
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text numberOfLines={2} style={s.name}>{b.name}</Text>
                <Text style={s.author} numberOfLines={1}>{b.author}</Text>
                <Pressable onPress={() => remove(id)} hitSlop={8}>
                  <Text style={s.remove}>Remove</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <AddButton id={id} compact />
                <Text style={s.linePrice}>{rupee(b.price * qty)}</Text>
                {b.mrp > b.price ? <Text style={s.lineMrp}>{rupee(b.mrp * qty)}</Text> : null}
              </View>
            </Animated.View>
          ))}
          <Pressable onPress={() => router.navigate("/")} style={s.addMore}>
            <Ionicons name="add" size={18} color={C.ink} />
            <Text style={s.addMoreTxt}>Add more books</Text>
          </Pressable>
        </View>

        <BagAddons fasterEta={bagWindows(fastEta.addr).fast} />

        <Rail title={!hasOneRupee ? "Add a ₹1 book" : "Complete your bag"} sub={!hasOneRupee ? "One ₹1 book per order" : undefined} books={suggestions} width={112} />

        <View style={[s.block, { padding: 16 }]}>
          <Text style={s.billH}>Bill details</Text>
          <Row k="Item total (MRP)" v={rupee(mrpTotal)} />
          {savings > 0 ? <Row k="Discount" v={`− ${rupee(savings)}`} green /> : null}
          {offerDiscount ? <Row k={offerLabel} v={`− ${rupee(offerDiscount)}`} green /> : null}
          <Row k={addons.faster ? "Delivery · Faster" : "Delivery"} v={delivery ? rupee(delivery) : "FREE"} green={!delivery} />
          {addons.bookmarks ? <Row k={`Bookmarks × ${addons.bookmarks}`} v={bmCharge ? rupee(bmCharge) : "FREE"} green={!bmCharge} /> : null}
          {delivery && !addons.faster && subtotal < freeAt ? <Text style={s.hint}>Add {rupee(freeAt - subtotal)} more for free delivery</Text> : null}
          <Row k="Cash on Delivery fee" v="If you pick COD" muted />
          <View style={s.hr} />
          <Row k="To pay" v={rupee(toPay)} bold />
        </View>

        <View style={s.policy}>
          <Ionicons name="shield-checkmark-outline" size={18} color={C.muted} />
          <Text style={s.policyTxt}>Original books · Cash on Delivery & UPI · 7-day easy returns</Text>
        </View>
      </ScrollView>

      <Animated.View style={[s.payBar, { paddingBottom: 12 }, above]}>
        <Pressable onPress={() => setBillOpen(true)} style={{ flex: 1 }} hitSlop={6}>
          <Text style={s.payTotal}>{rupee(toPay)}</Text>
          {mrpTotal - subtotal + offerDiscount > 0 ? <Text style={s.payHint}>You save {rupee(mrpTotal - subtotal + offerDiscount)}</Text> : null}
          <Text style={s.viewBill}>View bill ▴</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/checkout")} style={({ pressed }) => [s.payBtn, { opacity: pressed ? 0.9 : 1 }]}>
          <Text style={s.payBtnTxt}>Proceed to checkout</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
      </Animated.View>
      <BillSheet
        open={billOpen}
        onClose={() => setBillOpen(false)}
        b={{ mrp: mrpTotal, subtotal, flatDiscount, comboDiscount, delivery, faster: addons.faster, handling: subtotal > 1000, bookmarks: bmCharge, total: toPay }}
        cta="Proceed to checkout"
        onCta={() => router.push("/checkout")}
      />
    </View>
  );
}

function Row({ k, v, green, bold, muted }: { k: string; v: string; green?: boolean; bold?: boolean; muted?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
      <Text style={{ color: bold ? C.ink : C.ink2, fontWeight: bold ? "900" : "500", fontSize: bold ? 16 : 14 }}>{k}</Text>
      <Text style={{ color: green ? C.green : muted ? C.muted : C.ink, fontWeight: bold ? "900" : "700", fontSize: bold ? 16 : 14 }}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { color: C.muted, marginTop: 2, fontSize: 13 },
  saveBanner: { backgroundColor: C.greenSoft, paddingVertical: 10, alignItems: "center" },
  saveTxt: { color: C.green, fontWeight: "800" },
  block: { backgroundColor: "#fff", marginTop: 10 },
  line: { flexDirection: "row", padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  thumb: { width: 56, height: 80, borderRadius: 6, backgroundColor: C.bg },
  name: { fontSize: 14, fontWeight: "800", color: C.ink },
  author: { fontSize: 12, color: C.muted, marginTop: 2 },
  remove: { color: C.muted, fontSize: 12, fontWeight: "700", marginTop: 8, textDecorationLine: "underline" },
  linePrice: { fontWeight: "800", color: C.ink },
  lineMrp: { fontSize: 11, color: C.muted, textDecorationLine: "line-through", marginTop: -6 },
  addMore: { flexDirection: "row", alignItems: "center", gap: 6, padding: 14 },
  addMoreTxt: { fontWeight: "800", color: C.ink },
  unlock: { fontWeight: "800", color: C.ink2 },
  track: { height: 6, borderRadius: 3, backgroundColor: C.line, marginTop: 8, overflow: "hidden" },
  fill: { height: 6, backgroundColor: C.ink },
  hint: { fontSize: 11.5, color: C.brandDark, fontWeight: "700", marginTop: 4 },
  billH: { fontSize: 16, fontWeight: "800", color: C.ink },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginTop: 12 },
  policy: { flexDirection: "row", gap: 8, alignItems: "center", padding: 16 },
  policyTxt: { flex: 1, color: C.muted, fontSize: 12 },
  payBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line, elevation: 12 },
  payTotal: { fontSize: 18, fontWeight: "800", color: C.ink },
  viewBill: { fontSize: 11.5, color: C.ink2, fontWeight: "600", marginTop: 1, textDecorationLine: "underline" },
  payHint: { fontSize: 11, color: C.green, fontWeight: "700" },
  payBtn: { backgroundColor: C.green, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 6 },
  payBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  empty: { flex: 1, alignItems: "center", backgroundColor: "#fff", padding: 30 },
  emptyH: { fontSize: 20, fontWeight: "800", color: C.ink, marginTop: 16 },
  emptySub: { color: C.muted, textAlign: "center", marginTop: 6 },
  emptyBtn: { marginTop: 20, backgroundColor: C.ink, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnTxt: { color: "#fff", fontWeight: "800" },
});
