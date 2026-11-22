import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, FadeInRight, FadeOut, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEta } from "@/components/EtaStripe";
import { BookmarkAddon, ToggleAddon } from "@/components/AddonRows";
import { PressScale } from "@/components/motion";
import OfferStrip from "@/components/OfferStrip";
import { Text, TextInput } from "@/components/ui-text";
import type { Book } from "@/lib/catalog";
import { checkoutWindows, lookupPincode } from "@/lib/eta";
import BillSheet from "@/components/BillSheet";
import UpiAppPicker from "@/components/UpiAppPicker";
import { loadPreferredUpi, savePreferredUpi, upiAppByKey } from "@/lib/upi";
import CouponSheet from "@/components/CouponSheet";
import { couponOff, validateCoupon, type Coupon } from "@/lib/coupons";
import CheckoutSteps from "@/components/CheckoutSteps";
import { HeaderTitle } from "@/components/ScreenHeader";
import { Sheet } from "@/components/motion";
import { confetti } from "@/lib/confetti";
import { ADVANCE_AMOUNT, newOrderId, placeOrder, type Bill, type PayMethod } from "@/lib/orders";
import { bestUnlockedFlat, bookmarkCharge, COD_FASTER_MAX_BOOKS, COD_MAX_ORDER, codFee, deliveryCharge, deliveryLabel, encodeAddons, freeBookmarksFor, giftWrapCharge, MAX_BOOKMARKS } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

// Same flow and fields as the website checkout (src/components/UI/AddressModal):
//   Bag → Address (pincode → city/state auto-fill → full address; receiver
//   name, mobile, optional alternate number & email) → Payment.
// Orders are written to the same sheet columns via /api/order-write and the
// team gets the same Telegram message (see lib/orders.ts).

type Form = { pincode: string; city: string; state: string; address: string; name: string; phone: string; altPhone: string; email: string };

export default function CheckoutScreen() {
  const { ready } = useStore();
  return ready ? <Checkout /> : <ActivityIndicator style={{ marginTop: 60 }} color={C.ink} />;
}

function Checkout() {
  const insets = useSafeAreaInsets();
  const { cart, byId, subtotal, mrpTotal, offerDiscount, offerLabel, hasOneRupee, flatDiscount, comboDiscount, appliedOffer, profile, saveProfile, clearCart, applyOffer, pincode, addons, setAddons } = useStore();
  const lines = cart.map((l) => ({ book: byId.get(l.id), qty: l.qty })).filter((l): l is { book: Book; qty: number } => !!l.book);

  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState<Form>(() => ({
    pincode: profile.pincode || pincode,
    city: profile.city,
    state: profile.state,
    address: profile.address,
    name: profile.name,
    phone: profile.phone,
    altPhone: "",
    email: profile.email,
  }));
  const [showAlt, setShowAlt] = useState(false);
  const [locEdit, setLocEdit] = useState(false);
  const [pinState, setPinState] = useState<"idle" | "loading" | "ok" | "bad">("idle");
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [faster, setFasterState] = useState(addons.faster);
  const [pay, setPayState] = useState<PayMethod>("ADV"); // website default: Pay in two parts
  const [bookmarks, setBookmarksState] = useState(addons.bookmarks);
  const [gift, setGift] = useState(addons.gift);
  const [giftNote, setGiftNote] = useState(addons.giftNote);
  const [codSheet, setCodSheet] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponErr, setCouponErr] = useState("");
  // Website rule: 1 offer per order. The cart reward (achievement ₹-off +
  // combo discount) is active unless a coupon is applied or it's removed.
  const [offerOptedOut, setOfferOptedOut] = useState(false);
  // UPI app picked at checkout (remembered like the website's tbx_pref_upi).
  const [upiApp, setUpiApp] = useState("");
  useEffect(() => {
    loadPreferredUpi().then((k) => k && setUpiApp(k));
  }, []);
  const [placing, setPlacing] = useState<"" | PayMethod>("");
  const bookCount = lines.reduce((n, l) => n + l.qty, 0);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const set = (k: keyof Form) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const touch = (k: keyof Form) => () => setTouched((t) => ({ ...t, [k]: true }));

  const pinReady = /^[1-9]\d{5}$/.test(f.pincode);

  // Pincode → city & state (India Post), like the website.
  useEffect(() => {
    if (!pinReady) return;
    let live = true;
    lookupPincode(f.pincode).then((r) => {
      if (!live) return;
      if (r.ok) {
        setPinState("ok");
        setF((x) => ({ ...x, city: r.city || x.city, state: r.state || x.state }));
      } else setPinState(r.ok === false ? "bad" : "idle");
    });
    return () => {
      live = false;
    };
  }, [f.pincode, pinReady]);

  // Android back on the payment step returns to the address step.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step === 2) {
        setStep(1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step]);

  const locLocked = pinState === "ok" && !!f.city && !!f.state && !locEdit;
  const std = useEta({ pincode: f.pincode, state: f.state, city: f.city });
  const fast = useEta({ pincode: f.pincode, state: f.state, city: f.city, faster: true });

  const errors: Partial<Record<keyof Form, string>> = {
    pincode: !pinReady ? "Enter a valid 6-digit pincode" : pinState === "bad" ? "We couldn’t find this pincode" : "",
    city: !f.city.trim() ? "Enter your city" : "",
    state: !f.state.trim() ? "Please select your state" : "",
    address: f.address.trim().length < 10 ? "Add house no., street and a landmark" : "",
    name: f.name.trim().length < 2 ? "Enter the receiver’s name" : "",
    phone: !/^[6-9]\d{9}$/.test(f.phone) ? "Enter a valid 10-digit mobile number" : "",
    altPhone: f.altPhone && !/^[6-9]\d{9}$/.test(f.altPhone) ? "Enter a valid 10-digit number" : "",
    email: f.email && !/^\S+@\S+\.\S+$/.test(f.email) ? "Check your email" : "",
  };
  const err = (k: keyof Form) => (touched[k] ? errors[k] : "");
  const addressValid = Object.values(errors).every((e) => !e);

  // Same bill maths as the website checkout: items − offers + delivery + add-ons (+ COD fee).
  const billFor = (method: PayMethod, fast: boolean): Bill => {
    const delivery = deliveryCharge(subtotal, fast, hasOneRupee);
    const bmCharge = bookmarkCharge(bookmarks, subtotal);
    const gCharge = gift ? giftWrapCharge(subtotal) : 0;
    // Website rule: the coupon replaces the cart offer (flat + combo) when it saves more.
    const preCoupon = subtotal + delivery + bmCharge + gCharge;
    const offerActive = !coupon && !offerOptedOut;
    const cp = couponOff(coupon, preCoupon, subtotal);
    const couponOn = !!coupon && cp.off > 0;
    const base = preCoupon - (offerActive ? offerDiscount : couponOn ? cp.off : 0);
    const fee = method === "COD" ? codFee(base) : 0;
    return {
      mrp: mrpTotal,
      subtotal,
      offerDiscount: offerActive ? offerDiscount : 0,
      offerLabel: offerActive ? offerLabel : "",
      coupon: couponOn && coupon ? coupon.code : "",
      couponDiscount: couponOn ? cp.off : 0,
      delivery,
      deliveryLabel: deliveryLabel(subtotal, fast, hasOneRupee),
      codFee: fee,
      bookmarks,
      bookmarkFree: Math.min(bookmarks, freeBookmarksFor(subtotal)),
      bookmarkCharge: bmCharge,
      gift,
      giftNote: gift ? giftNote.trim() : "",
      giftCharge: gift ? giftWrapCharge(subtotal) : 0,
      addonsField: encodeAddons(gift, bookmarks, subtotal, gift ? giftNote : ""),
      total: base + fee,
    };
  };
  const bill = billFor(pay, faster);
  const codFastOk = bookCount <= COD_FASTER_MAX_BOOKS;
  const codBlocked = billFor("COD", faster && codFastOk).total >= COD_MAX_ORDER;

  // Website rules: COD caps bookmarks at 1, COD + Faster only for 1–2 books.
  const setPay = (m: PayMethod) => {
    if (m === "COD") {
      if (codBlocked) return toast(`Cash on Delivery isn’t available on orders of ${rupee(COD_MAX_ORDER)}+. Pay via UPI.`, { kind: "info" });
      if (faster && !codFastOk) {
        setFasterState(false);
        toast("Faster delivery with COD is for 1–2 books — switched to Standard", { kind: "info" });
      }
      if (bookmarks > 1) setBookmarksState(1);
    }
    setPayState(m);
  };
  const setFaster = (v: boolean) => {
    if (v && pay === "COD" && !codFastOk) {
      toast("Faster delivery with COD is for 1–2 books. Pay via UPI for Faster.", { kind: "info" });
      return;
    }
    setFasterState(v);
    setAddons({ faster: v });
  };
  const setBookmarks = (n: number) => {
    const cap = pay === "COD" ? 1 : MAX_BOOKMARKS;
    if (n > cap) return toast(pay === "COD" ? "1 bookmark on Cash on Delivery orders" : `Up to ${MAX_BOOKMARKS} bookmarks per order`, { kind: "info" });
    setBookmarksState(Math.max(0, n));
    setAddons({ bookmarks: Math.max(0, n) });
  };
  const toggleGift = () => {
    const v = !gift;
    setGift(v);
    setAddons({ gift: v });
    if (v) confetti(false);
  };

  const applyCode = async (code: string) => {
    setCouponBusy(true);
    setCouponErr("");
    const r = await validateCoupon(code, subtotal - offerDiscount);
    setCouponBusy(false);
    if (!r.ok || !r.coupon) return setCouponErr(r.reason || "This code can’t be used");
    // 1 offer per order: the coupon replaces the cart reward (like the website).
    const delivery = deliveryCharge(subtotal, faster, hasOneRupee);
    const pre = subtotal + delivery + bookmarkCharge(bookmarks, subtotal) + (gift ? giftWrapCharge(subtotal) : 0);
    const cp = couponOff(r.coupon, pre, subtotal);
    if (cp.short) return setCouponErr(`Add ${rupee(cp.short)} more to use ${r.coupon.code}`);
    setCoupon(r.coupon);
    setCouponOpen(false);
    confetti(true);
    toast(
      offerDiscount > 0
        ? cp.off < offerDiscount
          ? `It replaces your ${offerLabel} (${rupee(offerDiscount)}). Tap USE on the reward to switch back.`
          : `Replaces your cart reward · you save ${rupee(cp.off)}`
        : `You save ${rupee(cp.off)} on this order`,
      { title: `Coupon ${r.coupon.code} applied 🎉`, kind: "success" },
    );
  };

  const toPayment = () => {
    setTouched({ pincode: true, city: true, state: true, address: true, name: true, phone: true, altPhone: true, email: true });
    if (!addressValid) {
      toast("Please complete the highlighted details");
      return;
    }
    saveProfile({ name: f.name.trim(), phone: f.phone, email: f.email.trim(), pincode: f.pincode, city: f.city.trim(), state: f.state.trim(), address: f.address.trim() });
    setStep(2);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  // Place order: COD first confirms the handling fee (website's "Confirm Cash
  // on Delivery" sheet); UPI writes an Unconfirmed order and opens Scan & pay.
  const submit = () => {
    if (!lines.length || busy) return;
    if (pay === "COD") setCodSheet(true);
    else place(pay);
  };

  const place = async (method: PayMethod) => {
    setCodSheet(false);
    setBusy(true);
    setPlacing(method);
    const fast = method === "COD" ? faster && codFastOk : faster;
    const b = billFor(method, fast);
    const cod = billFor("COD", false);
    const orderId = newOrderId();
    const prof = { name: f.name.trim(), phone: f.phone, email: f.email.trim(), pincode: f.pincode, city: f.city.trim(), state: f.state.trim(), address: f.address.trim() };
    const t0 = Date.now();
    try {
      const appSel = method !== "COD" ? upiAppByKey(upiApp) : null;
      if (appSel) savePreferredUpi(appSel.key);
      await placeOrder({ orderId, profile: prof, altPhone: f.altPhone, lines, bill: b, payment: method, faster: fast, paymentLabel: appSel ? `${appSel.label} (UPI)` : "" });
      await new Promise((r) => setTimeout(r, Math.max(0, 1400 - (Date.now() - t0))));
      if (method === "COD") {
        clearCart();
        applyOffer(0);
        router.replace({ pathname: "/order/[id]", params: { id: orderId, placed: "1" } });
      } else {
        router.replace({
          pathname: "/pay/[id]",
          params: { id: orderId, app: appSel?.key || "", adv: method === "ADV" ? String(Math.max(0, b.total - ADVANCE_AMOUNT)) : "", amount: String(method === "ADV" ? Math.min(ADVANCE_AMOUNT, b.total) : b.total), codTotal: String(cod.total), codFee: String(cod.codFee), codDelivery: String(cod.delivery), codLabel: cod.deliveryLabel, name: prof.name, phone: prof.phone, codOk: codBlocked ? "0" : "1" },
        });
      }
    } catch {
      setPlacing("");
      toast("Couldn’t place the order. Check your internet and try again.", { kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  if (!lines.length)
    return (
      <View style={s.empty}>
        <Text style={{ color: C.muted }}>Your bag is empty.</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerTitle: () => <HeaderTitle title={step === 1 ? "Delivery address" : "Payment"} sub={step === 1 ? `${bookCount} item${bookCount > 1 ? "s" : ""} · ${rupee(subtotal - offerDiscount)}` : `To pay ${rupee(bill.total)}`} /> }} />
      <CheckoutSteps at={step} />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <Animated.View key="addr" entering={FadeIn.duration(220)}>
            {/* Where should we deliver? */}
            <View style={s.card}>
              <SecTitle icon="location-outline" title="Where should we deliver?" />
              <Field
                label="Pincode"
                required
                value={f.pincode}
                onChangeText={(v) => {
                  setPinState(/^[1-9]\d{5}$/.test(v) ? "loading" : "idle");
                  setLocEdit(false);
                  set("pincode")(v.replace(/\D/g, "").slice(0, 6));
                }}
                onBlur={touch("pincode")}
                placeholder="Enter 6 digit pincode"
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="postal-code"
                error={err("pincode") || (pinState === "bad" ? errors.pincode : "")}
                right={pinState === "loading" ? <ActivityIndicator size="small" color={C.muted} /> : pinState === "ok" ? <Ionicons name="checkmark-circle" size={18} color={C.green} /> : null}
              />
              {pinReady ? (
                locLocked ? (
                  <Animated.View entering={FadeInDown.duration(260)} style={s.locked}>
                    <Ionicons name="checkmark-circle" size={15} color={C.green} />
                    <Text style={s.lockedTxt}>
                      Delivering to <Text style={{ fontWeight: "700", color: C.ink }}>{f.city}, {f.state}</Text>
                    </Text>
                    <Pressable onPress={() => setLocEdit(true)} hitSlop={8}>
                      <Text style={s.edit}>Edit</Text>
                    </Pressable>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInDown.duration(260)} style={s.row2}>
                    <Field style={{ flex: 1 }} label="City / District" value={f.city} onChangeText={set("city")} onBlur={touch("city")} placeholder="Enter your city" error={err("city")} />
                    <Field style={{ flex: 1 }} label="State" value={f.state} onChangeText={set("state")} onBlur={touch("state")} placeholder={pinState === "loading" ? "Fetching…" : "Type your state"} error={err("state")} />
                  </Animated.View>
                )
              ) : null}
              {pinReady ? (
                <Animated.View entering={FadeInDown.delay(60).duration(260)}>
                  <Field
                    label="Full address — House no, Street, Landmark"
                    required
                    value={f.address}
                    onChangeText={set("address")}
                    onBlur={touch("address")}
                    placeholder="e.g. 12/A, Green Residency, 2nd floor, MG Road, near City Mall"
                    autoComplete="street-address"
                    multiline
                    error={err("address")}
                  />
                </Animated.View>
              ) : null}
              {pinReady ? <EtaLine dates={std.dates} shipsToday={std.eta.shipsToday} /> : null}
            </View>

            {/* Who's receiving it? */}
            {pinReady ? (
              <Animated.View entering={FadeInDown.delay(120).duration(300)} style={s.card}>
                <SecTitle icon="person-outline" title="Who’s receiving it?" />
                <Field label="Name" required value={f.name} onChangeText={(v) => set("name")(v.replace(/[^A-Za-z .']/g, ""))} onBlur={touch("name")} placeholder="Receiver's full name" autoComplete="name" autoCapitalize="words" error={err("name")} />
                <Field label="Mobile" required value={f.phone} onChangeText={(v) => set("phone")(v.replace(/\D/g, "").slice(-10))} onBlur={touch("phone")} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} prefix="+91" autoComplete="tel" error={err("phone")} />
                {showAlt || f.altPhone ? (
                  <Animated.View entering={FadeInDown.duration(220)}>
                    <Field label="Alternate number" optional value={f.altPhone} onChangeText={(v) => set("altPhone")(v.replace(/\D/g, "").slice(-10))} onBlur={touch("altPhone")} placeholder="Second number for delivery" keyboardType="phone-pad" maxLength={10} prefix="+91" error={err("altPhone")} autoFocus={!f.altPhone} />
                  </Animated.View>
                ) : (
                  <Pressable onPress={() => setShowAlt(true)} style={s.addAlt} hitSlop={6}>
                    <Ionicons name="call-outline" size={13} color={C.ink2} />
                    <Text style={s.addAltTxt}>Add alternate number</Text>
                  </Pressable>
                )}
                <Field label="Email" optional value={f.email} onChangeText={set("email")} onBlur={touch("email")} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={err("email")} />
              </Animated.View>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View key="pay" entering={FadeInRight.duration(260)} exiting={FadeOut.duration(120)}>
            {/* Delivering to — summary with change */}
            <View style={s.card}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <Ionicons name="location" size={18} color={C.ink} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.toName}>{f.name} · +91 {f.phone}</Text>
                  <Text style={s.toAddr} numberOfLines={2}>{f.address}, {f.city}, {f.state} – {f.pincode}</Text>
                </View>
                <Pressable onPress={() => setStep(1)} hitSlop={8}>
                  <Text style={s.edit}>Change</Text>
                </Pressable>
              </View>
            </View>

            <View style={s.card}>
              <SecTitle icon="car-outline" title="Delivery speed" />
              <Option on={!faster} onPress={() => setFaster(false)} title="Standard" sub={`Arrives in ${checkoutWindows(std.addr).std}`} right={deliveryCharge(subtotal, false, hasOneRupee) ? rupee(deliveryCharge(subtotal, false, hasOneRupee)) : "FREE"} rightGreen={!deliveryCharge(subtotal, false, hasOneRupee)} />
              <FasterOption on={faster} onPress={() => setFaster(true)} sub={`Arrives in ${checkoutWindows(std.addr).fast} · jumps the queue`} right={rupee(deliveryCharge(subtotal, true, hasOneRupee))} />
            </View>

            <View style={s.card}>
              <SecTitle icon="sparkles-outline" title="Add-ons" />
              <View style={{ gap: 10, marginTop: 12 }}>
                <ToggleAddon kind="gift" title="Gift wrap" price={`+${rupee(giftWrapCharge(subtotal))}`} sub="Wrapped with a ribbon · add a personal note" on={gift} onToggle={toggleGift} />
                <BookmarkAddon
                  count={bookmarks}
                  max={pay === "COD" ? 1 : MAX_BOOKMARKS}
                  free={!bill.bookmarkCharge}
                  price={bill.bookmarkCharge ? `+${rupee(bill.bookmarkCharge)}` : `${freeBookmarksFor(subtotal)} FREE`}
                  sub={pay === "COD" ? "1 bookmark on Cash on Delivery orders" : `${freeBookmarksFor(subtotal)} free with this order · then ₹9 each`}
                  onChange={setBookmarks}
                />
              </View>
              {gift ? (
                <Animated.View entering={FadeInDown.duration(220)}>
                  <Field label="Gift note" optional value={giftNote} onChangeText={(v) => { setGiftNote(v.slice(0, 160)); setAddons({ giftNote: v.slice(0, 160) }); }} placeholder="Write a short note to include with the gift…" multiline />
                </Animated.View>
              ) : null}
            </View>

            <View style={{ marginTop: 10 }}>
              <OfferStrip />
            </View>

            <View style={s.card}>
              <SecTitle icon="pricetags-outline" title="Offers & coupons" />
              <PressScale scaleTo={0.985} onPress={() => { setCouponErr(""); setCouponOpen(true); }} style={[s.cpRow, bill.coupon || bill.offerDiscount ? s.cpRowOn : null]}>
                <View style={[s.cpIc, bill.coupon || bill.offerDiscount ? { backgroundColor: C.green } : null]}>
                  <Ionicons name={bill.coupon || bill.offerDiscount ? "checkmark" : "pricetag"} size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  {bill.coupon ? (
                    <>
                      <Text style={s.cpH}>{bill.coupon} applied</Text>
                      <Text style={[s.cpS, { color: C.green }]}>You save {rupee(bill.couponDiscount)} · replaces the cart reward</Text>
                    </>
                  ) : bill.offerDiscount ? (
                    <>
                      <Text style={s.cpH}>{bill.offerLabel} applied</Text>
                      <Text style={[s.cpS, { color: C.green }]}>Your cart reward · 1 offer per order · tap to see coupons</Text>
                    </>
                  ) : (
                    <>
                      <Text style={s.cpH}>Apply coupon</Text>
                      <Text style={s.cpS}>1 offer per order</Text>
                    </>
                  )}
                </View>
                {coupon ? (
                  <Pressable onPress={() => { setCoupon(null); setOfferOptedOut(false); toast("Coupon removed · cart reward back on", { kind: "info" }); }} hitSlop={8}>
                    <Text style={s.cpRemove}>REMOVE</Text>
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#B5B5BD" />
                )}
              </PressScale>
            </View>

            <View style={s.card}>
              <SecTitle icon="wallet-outline" title="Pay with" />
              <PayCard
                on={pay === "UPI"}
                onPress={() => setPay("UPI")}
                title="Pay Online"
                perks={[{ t: "Free bookmark", tone: "good", icon: "bookmark" }, { t: "No COD fee", tone: "good", icon: "cash-outline" }]}
                price={rupee(billFor("UPI", faster).total)}
                strike={codBlocked ? undefined : rupee(billFor("COD", faster && codFastOk).total)}
              />
              {billFor("UPI", faster).total > ADVANCE_AMOUNT ? (
                <PayCard
                  on={pay === "ADV"}
                  onPress={() => setPay("ADV")}
                  title="Pay in two parts"
                  tag="Popular"
                  perks={[{ t: "Free bookmark", tone: "good", icon: "bookmark" }, { t: "Rest at delivery", tone: "info", icon: "car-outline" }]}
                  price={rupee(ADVANCE_AMOUNT)}
                  priceNote="now"
                >
                  {pay === "ADV" ? (
                    <Animated.View entering={FadeInDown.duration(200)} style={s.split}>
                      <View style={[s.splitSeg, s.splitOn]}>
                        <Text style={s.splitV}>{rupee(ADVANCE_AMOUNT)}</Text>
                        <Text style={s.splitK}>now · UPI</Text>
                      </View>
                      <Text style={s.splitPlus}>+</Text>
                      <View style={s.splitSeg}>
                        <Text style={s.splitV}>{rupee(Math.max(0, billFor("ADV", faster).total - ADVANCE_AMOUNT))}</Text>
                        <Text style={s.splitK}>at delivery</Text>
                      </View>
                    </Animated.View>
                  ) : null}
                </PayCard>
              ) : null}
              {pay !== "COD" ? (
                <Animated.View entering={FadeInDown.duration(220)} style={s.appBox}>
                  <UpiAppPicker value={upiApp} onChange={setUpiApp} />
                  <Text style={s.appHint}>
                    {upiApp ? `We’ll copy our UPI ID and open ${upiAppByKey(upiApp)?.label}. Not installed? We’ll take you to the Play Store.` : "Pick an app to open it straight away, or pay by scanning our QR."}
                  </Text>
                </Animated.View>
              ) : null}
              <PayCard
                on={pay === "COD"}
                onPress={() => setPay("COD")}
                title="Cash on Delivery"
                cod
                disabled={codBlocked}
                perks={
                  codBlocked
                    ? [{ t: `Not available on orders of ${rupee(COD_MAX_ORDER)}+ · Pay ${rupee(ADVANCE_AMOUNT)} now instead`, tone: "bad" }]
                    : faster && !codFastOk
                      ? [{ t: "Standard delivery only on 3+ books", tone: "bad" }]
                      : [{ t: `+${rupee(billFor("COD", faster && codFastOk).codFee)} COD fees`, tone: "bad", icon: "cash-outline" }, { t: "1 bookmark max", tone: "muted", icon: "bookmark-outline" }]
                }
                price={codBlocked ? undefined : rupee(billFor("COD", faster && codFastOk).total)}
              />
            </View>

            <View style={s.card}>
              <SecTitle icon="book-outline" title={`Items (${lines.reduce((n, l) => n + l.qty, 0)})`} />
              {lines.map(({ book, qty }) => (
                <View key={book.id} style={s.item}>
                  <Image alt="" source={book.image} style={s.thumb} contentFit="cover" />
                  <Text style={s.itemName} numberOfLines={2}>{book.name}{qty > 1 ? `  ×${qty}` : ""}</Text>
                  <Text style={s.itemPrice}>{rupee(book.price * qty)}</Text>
                </View>
              ))}
            </View>

            <View style={s.card}>
              <SecTitle icon="receipt-outline" title="Bill details" />
              <Line k="Item total (MRP)" v={rupee(bill.mrp)} />
              {bill.mrp > bill.subtotal ? <Line k="Discount on MRP" v={`− ${rupee(bill.mrp - bill.subtotal)}`} green /> : null}
              {bill.offerDiscount ? <Line k={bill.offerLabel} v={`− ${rupee(bill.offerDiscount)}`} green /> : null}
              {bill.couponDiscount ? <Line k={`Coupon (${bill.coupon})`} v={`− ${rupee(bill.couponDiscount)}`} green /> : null}
              <Line k={bill.deliveryLabel} v={bill.delivery ? rupee(bill.delivery) : "FREE"} green={!bill.delivery} />
              {bill.gift ? <Line k="Gift wrap" v={rupee(bill.giftCharge)} /> : null}
              {bill.bookmarks ? <Line k={`Bookmarks × ${bill.bookmarks}`} v={bill.bookmarkCharge ? rupee(bill.bookmarkCharge) : "FREE"} green={!bill.bookmarkCharge} /> : null}
              {bill.codFee ? <Line k="COD handling fee" v={rupee(bill.codFee)} /> : null}
              <View style={s.hr} />
              <Line k="To pay" v={rupee(bill.total)} bold />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable onPress={() => setBillOpen(true)} style={{ flex: 1 }} hitSlop={6}>
          <Text style={s.barTotal}>{rupee(step === 1 ? subtotal - offerDiscount : pay === "ADV" ? Math.min(ADVANCE_AMOUNT, bill.total) : bill.total)}</Text>
          <Text style={s.barSub}>{step === 1 ? "Delivery & fees on next step" : pay === "COD" ? "Cash on Delivery" : pay === "ADV" ? "Rest at delivery" : "Pay via UPI"} · <Text style={{ textDecorationLine: "underline", color: C.ink2, fontWeight: "600" }}>View bill ▴</Text></Text>
        </Pressable>
        <PressScale onPress={step === 1 ? toPayment : submit} disabled={busy} style={[s.placeBtn, busy && { opacity: 0.7 }]}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.placeTxt} numberOfLines={1}>{step === 1 ? "Continue to payment" : pay === "COD" ? "Place order" : pay === "ADV" ? `Pay ${rupee(ADVANCE_AMOUNT)}${upiApp ? ` via ${upiAppByKey(upiApp)?.label}` : " now"}` : upiApp ? `Pay via ${upiAppByKey(upiApp)?.label}` : `Pay ${rupee(bill.total)}`}</Text>
          )}
        </PressScale>
      </View>
      <Sheet open={codSheet} onClose={() => setCodSheet(false)} style={[s.sheet, { paddingBottom: insets.bottom + 18 }]}>
        <Text style={s.sheetH}>Confirm Cash on Delivery</Text>
        <View style={s.feeHero}>
          <View style={s.feeIc}><Ionicons name="wallet" size={20} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.feeT}>{rupee(billFor("COD", faster && codFastOk).codFee)} COD handling fee will be added</Text>
            <Text style={s.feeS}>Collected at the door, along with your order.</Text>
          </View>
        </View>
        <View style={s.cmp}>
          <View style={s.cmpRow}>
            <View style={{ flex: 1 }}><Text style={[s.cmpH, { color: C.green }]}>Pay UPI now</Text><Text style={s.cmpS}>Instant · No extra charges</Text></View>
            <Text style={[s.cmpAmt, { color: C.green }]}>{rupee(billFor("UPI", faster).total)}</Text>
          </View>
          <View style={s.hr} />
          <View style={s.cmpRow}>
            <View style={{ flex: 1 }}><Text style={s.cmpH}>Cash on Delivery</Text><Text style={[s.cmpS, { color: C.brandDark }]}>Includes {rupee(billFor("COD", faster && codFastOk).codFee)} handling fee</Text></View>
            <Text style={s.cmpAmt}>{rupee(billFor("COD", faster && codFastOk).total)}</Text>
          </View>
        </View>
        <PressScale onPress={() => { setPayState("UPI"); place("UPI"); }} style={[s.sheetBtn, { backgroundColor: C.green }]}>
          <Text style={s.sheetBtnTxt}>Pay {rupee(billFor("UPI", faster).total)} via UPI</Text>
        </PressScale>
        <PressScale onPress={() => place("COD")} style={[s.sheetBtn, s.sheetBtn2]}>
          <Text style={[s.sheetBtnTxt, { color: C.ink }]}>Pay at door · incl. {rupee(billFor("COD", faster && codFastOk).codFee)} fee</Text>
        </PressScale>
        <Text style={s.sheetNote}>UPI works with Google Pay, PhonePe, Paytm & BHIM</Text>
      </Sheet>
      <BillSheet
        open={billOpen}
        onClose={() => setBillOpen(false)}
        b={{ mrp: bill.mrp, subtotal, flatDiscount: bill.offerDiscount ? flatDiscount : 0, comboDiscount: bill.offerDiscount ? comboDiscount : 0, coupon: bill.coupon ? { code: bill.coupon, off: bill.couponDiscount } : undefined, delivery: bill.delivery, faster, handling: subtotal > 1000, gift: bill.gift ? bill.giftCharge : 0, bookmarks: bill.bookmarkCharge, codFee: bill.codFee, total: bill.total }}
      />
      <CouponSheet
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        cartValue={subtotal - offerDiscount}
        applied={coupon}
        applying={couponBusy}
        error={couponErr}
        onApply={applyCode}
        onRemove={() => {
          setCoupon(null);
          setOfferOptedOut(false);
        }}
        reward={offerDiscount > 0 ? { label: offerLabel, amount: offerDiscount, active: !coupon && !offerOptedOut } : null}
        unlocked={!coupon && !appliedOffer ? bestUnlockedFlat(subtotal, hasOneRupee) : null}
        onUseReward={() => {
          setCoupon(null);
          setOfferOptedOut(false);
          toast(`${offerLabel || "Cart reward"} applied`, { kind: "success" });
        }}
        onRemoveReward={() => setOfferOptedOut(true)}
        onApplyReward={(v) => {
          applyOffer(v);
          setOfferOptedOut(false);
          confetti(false);
          toast(`₹${v} OFF applied to your order`, { title: "Reward applied 🎁", kind: "success" });
        }}
      />
      {placing ? <PlacingOverlay method={placing} /> : null}
    </KeyboardAvoidingView>
  );
}

// Full-screen "Placing your order…" like the website (also before Scan & pay).
function PlacingOverlay({ method }: { method: PayMethod }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={[StyleSheet.absoluteFill, s.placing]}>
      <Animated.View entering={FadeInDown.springify()} style={s.placingIc}>
        <Ionicons name={method === "COD" ? "cube" : "shield-checkmark"} size={34} color="#fff" />
      </Animated.View>
      <ActivityIndicator color={C.ink} style={{ marginTop: 22 }} />
      <Text style={s.placingH}>{method === "COD" ? "Placing your order…" : "Preparing secure payment…"}</Text>
      <Text style={s.placingS}>Please don’t close the app</Text>
    </Animated.View>
  );
}

function SecTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={s.secHead}>
      <View style={s.secIc}>
        <Ionicons name={icon} size={15} color={C.ink} />
      </View>
      <Text style={s.secTitle}>{title}</Text>
    </View>
  );
}

function EtaLine({ dates, shipsToday }: { dates: string; shipsToday: boolean }) {
  return (
    <View style={[s.eta, shipsToday && { backgroundColor: C.greenSoft }]}>
      <Ionicons name="car-outline" size={15} color={shipsToday ? C.green : C.ink2} />
      <Text style={s.etaTxt}>
        Get it <Text style={{ fontWeight: "700", color: C.ink }}>{dates}</Text>
      </Text>
    </View>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string; error?: string; prefix?: string; right?: ReactNode; required?: boolean; optional?: boolean; style?: object };
function Field({ label, error, prefix, right, required, optional, style, ...rest }: FieldProps) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ marginTop: 12 }, style]}>
      <Text style={s.label}>
        {label}
        {required ? <Text style={{ color: C.red }}> *</Text> : null}
        {optional ? <Text style={s.opt2}> (optional)</Text> : null}
      </Text>
      <View style={[s.inputWrap, focus && { borderColor: C.ink }, !!error && { borderColor: C.red }]}>
        {prefix ? <Text style={s.prefix}>{prefix}</Text> : null}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocus(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            rest.onBlur?.(e);
          }}
          style={[s.input, rest.multiline && { minHeight: 76, textAlignVertical: "top", paddingTop: 12 }]}
          placeholderTextColor="#A3A3AD"
        />
        {right}
      </View>
      {error ? <Text style={s.err}>{error}</Text> : null}
    </View>
  );
}

// Faster delivery card: ⚡ beside the title; when picked, a glowing green
// border pulses and a light sweep runs across the card.
function FasterOption({ on, onPress, sub, right }: { on: boolean; onPress: () => void; sub: string; right: string }) {
  const glow = useSharedValue(0);
  const sweep = useSharedValue(0);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (on) {
      glow.set(withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.35, { duration: 900 })), -1, false));
      sweep.set(0);
      sweep.set(withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), withDelay(900, withTiming(1, { duration: 0 }))), -1, false));
    } else {
      glow.set(withTiming(0, { duration: 200 }));
      sweep.set(0);
    }
  }, [on, glow, sweep]);
  const border = useAnimatedStyle(() => ({
    borderColor: on ? interpolateColor(glow.get(), [0, 1], ["#86E0B3", C.green]) : C.line,
    shadowOpacity: on ? 0.15 + glow.get() * 0.35 : 0,
    shadowRadius: 6 + glow.get() * 10,
  }));
  const shine = useAnimatedStyle(() => ({ transform: [{ translateX: -120 + sweep.get() * (w + 240) }, { skewX: "-20deg" }] }));
  const bolt = useAnimatedStyle(() => ({ transform: [{ scale: on ? 1 + glow.get() * 0.18 : 1 }] }));
  return (
    <PressScale scaleTo={0.98} onPress={onPress}>
      <Animated.View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.opt, s.fastCard, on && s.fastOn, border]}>
        {on ? (
          <Animated.View pointerEvents="none" style={[s.shine, shine]}>
            <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.75)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
        ) : null}
        <View style={[s.radio, on && { borderColor: C.green }]}>{on ? <View style={[s.radioDot, { backgroundColor: C.green }]} /> : null}</View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={s.optTitle}>Faster</Text>
            <Animated.View style={bolt}>
              <Ionicons name="flash" size={15} color={on ? "#F59E0B" : "#C9A227"} />
            </Animated.View>
            {on ? <Text style={s.fastBadge}>Priority</Text> : null}
          </View>
          <Text style={s.optSub}>{sub}</Text>
        </View>
        <Text style={[s.optRight, on && { color: C.green }]}>{right}</Text>
      </Animated.View>
    </PressScale>
  );
}

type Perk = { t: string; tone: "good" | "info" | "bad" | "muted"; icon?: keyof typeof Ionicons.glyphMap };
const PERK = { good: { bg: C.greenSoft, fg: C.green }, info: { bg: "#EFF6FF", fg: "#2563EB" }, bad: { bg: "#FEF2F2", fg: C.red }, muted: { bg: C.bg, fg: C.muted } };

// Website payment cards: title, perk badges (what you get / miss / pay extra), price column.
function PayCard({ on, onPress, title, tag, perks, price, strike, priceNote, disabled, children }: { on: boolean; onPress: () => void; title: string; tag?: string; perks: Perk[]; price?: string; strike?: string; priceNote?: string; cod?: boolean; disabled?: boolean; children?: ReactNode }) {
  return (
    <PressScale scaleTo={0.985} onPress={onPress}>
      <View style={[s.payCard, on && s.payCardOn, disabled && { opacity: 0.6 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[s.radio, on && { borderColor: C.green }]}>{on ? <View style={[s.radioDot, { backgroundColor: C.green }]} /> : null}</View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.optTitle}>{title}</Text>
              {tag ? <Text style={s.payTag}>{tag}</Text> : null}
            </View>
            <View style={s.perks}>
              {perks.map((p) => (
                <View key={p.t} style={[s.perk, { backgroundColor: PERK[p.tone].bg }]}>
                  {p.icon ? <Ionicons name={p.icon} size={11} color={PERK[p.tone].fg} /> : null}
                  <Text style={[s.perkTxt, { color: PERK[p.tone].fg }]}>{p.t}</Text>
                </View>
              ))}
            </View>
          </View>
          {price ? (
            <View style={{ alignItems: "flex-end" }}>
              {strike ? <Text style={s.payStrike}>{strike}</Text> : null}
              <Text style={[s.payPrice, on && { color: C.green }]}>{price}</Text>
              {priceNote ? <Text style={s.payNote}>{priceNote}</Text> : null}
            </View>
          ) : null}
        </View>
        {children}
      </View>
    </PressScale>
  );
}

function Option({ on, onPress, title, sub, right, rightGreen, badge, icon }: { on: boolean; onPress: () => void; title: string; sub: string; right?: string; rightGreen?: boolean; badge?: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <PressScale scaleTo={0.98} onPress={onPress} style={[s.opt, on && s.optOn]}>
      <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
      {icon ? <Ionicons name={icon} size={19} color={C.ink2} /> : null}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={s.optTitle}>{title}</Text>
          {badge ? <Text style={s.badge}>{badge}</Text> : null}
        </View>
        <Text style={s.optSub}>{sub}</Text>
      </View>
      {right ? <Text style={[s.optRight, rightGreen && { color: C.green }]}>{right}</Text> : null}
    </PressScale>
  );
}

function Line({ k, v, green, bold }: { k: string; v: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
      <Text style={{ color: bold ? C.ink : C.ink2, fontWeight: bold ? "700" : "400", fontSize: bold ? 16 : 14 }}>{k}</Text>
      <Text style={{ color: green ? C.green : C.ink, fontWeight: bold ? "700" : "500", fontSize: bold ? 16 : 14 }}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  steps: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  stepLine: { flex: 1, height: 2, backgroundColor: C.line, marginHorizontal: 8 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E6E6EC", alignItems: "center", justifyContent: "center", marginRight: 6 },
  stepOn: { backgroundColor: C.ink },
  stepDone: { backgroundColor: C.green },
  stepNum: { fontSize: 11, color: C.muted, fontWeight: "600" },
  stepName: { fontSize: 12.5, color: C.muted },
  card: { backgroundColor: "#fff", marginTop: 10, padding: 16 },
  secHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  secIc: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  secTitle: { fontSize: 15.5, fontWeight: "600", color: C.ink },
  row2: { flexDirection: "row", gap: 10 },
  label: { fontSize: 12.5, fontWeight: "500", color: C.ink2, marginBottom: 6 },
  opt2: { fontSize: 11, color: C.muted },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DCDCE2", borderRadius: 10, paddingHorizontal: 12, backgroundColor: "#fff" },
  prefix: { fontSize: 14.5, color: C.ink2, marginRight: 8, fontWeight: "500" },
  input: { flex: 1, height: 46, fontSize: 14.5, color: C.ink },
  err: { color: C.red, fontSize: 12, marginTop: 4 },
  locked: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: C.greenSoft },
  lockedTxt: { flex: 1, fontSize: 13, color: C.ink2 },
  edit: { fontSize: 13, fontWeight: "600", color: C.brandDark },
  addAlt: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10, alignSelf: "flex-start" },
  addAltTxt: { fontSize: 12.5, fontWeight: "500", color: C.ink2, textDecorationLine: "underline" },
  eta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: "#F6F6F8" },
  etaTxt: { fontSize: 12.5, color: C.ink2 },
  toName: { fontSize: 14, fontWeight: "600", color: C.ink },
  toAddr: { fontSize: 12.5, color: C.ink2, marginTop: 2, lineHeight: 18 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.line },
  optOn: { borderColor: C.ink, backgroundColor: "#FAFAFB" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#C9C9D0", alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: C.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink },
  optTitle: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  optSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  optRight: { fontSize: 14, fontWeight: "600", color: C.ink },
  badge: { fontSize: 10, fontWeight: "600", color: C.green, backgroundColor: C.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  thumb: { width: 36, height: 52, borderRadius: 4, backgroundColor: C.bg },
  itemName: { flex: 1, fontSize: 13.5, color: C.ink },
  itemPrice: { fontSize: 14, fontWeight: "600", color: C.ink },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginTop: 12 },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line, elevation: 12 },
  barTotal: { fontSize: 18, fontWeight: "700", color: C.ink },
  barSub: { fontSize: 11.5, color: C.muted },
  fastCard: { overflow: "hidden", shadowColor: C.green, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  fastOn: { borderWidth: 1.5, backgroundColor: "#F2FBF6" },
  shine: { position: "absolute", top: -10, bottom: -10, width: 90 },
  fastBadge: { fontSize: 10, fontWeight: "700", color: C.green, backgroundColor: C.greenSoft, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, overflow: "hidden" },
  payCard: { marginTop: 10, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: "#fff" },
  payCardOn: { borderColor: C.green, backgroundColor: "#F6FCF8" },
  payTag: { fontSize: 10, fontWeight: "700", color: "#fff", backgroundColor: C.brand, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, overflow: "hidden" },
  perks: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  perk: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  perkTxt: { fontSize: 11, fontWeight: "600" },
  payStrike: { fontSize: 11.5, color: C.muted, textDecorationLine: "line-through" },
  payPrice: { fontSize: 16, fontWeight: "700", color: C.ink },
  payNote: { fontSize: 11, color: C.muted },
  split: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  splitSeg: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff" },
  splitOn: { borderColor: C.green, backgroundColor: C.greenSoft },
  splitV: { fontSize: 15, fontWeight: "700", color: C.ink },
  splitK: { fontSize: 11, color: C.muted },
  splitPlus: { fontSize: 16, color: C.muted, fontWeight: "600" },
  appBox: { marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: C.bg },
  appHint: { fontSize: 11.5, color: C.muted, marginTop: 8, lineHeight: 16 },
  cpRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: "#F5B97A", backgroundColor: "#FFFAF3" },
  cpRowOn: { borderStyle: "solid", borderColor: C.green, backgroundColor: "#F4FBF7" },
  cpIc: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.brand, alignItems: "center", justifyContent: "center" },
  cpH: { fontSize: 14, fontWeight: "600", color: C.ink },
  cpS: { fontSize: 12, color: C.muted, marginTop: 1 },
  cpRemove: { fontSize: 12, fontWeight: "700", color: C.muted },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  sheetH: { fontSize: 17, fontWeight: "700", color: C.ink },
  feeHero: { flexDirection: "row", gap: 12, alignItems: "center", marginTop: 14, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.brand, backgroundColor: C.brandSoft },
  feeIc: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.brand, alignItems: "center", justifyContent: "center" },
  feeT: { fontSize: 14, fontWeight: "700", color: C.ink },
  feeS: { fontSize: 12, color: C.ink2, marginTop: 2 },
  cmp: { marginTop: 12, padding: 14, borderRadius: 10, backgroundColor: C.bg },
  cmpRow: { flexDirection: "row", alignItems: "center" },
  cmpH: { fontSize: 14, fontWeight: "600", color: C.ink },
  cmpS: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  cmpAmt: { fontSize: 17, fontWeight: "700", color: C.ink },
  sheetBtn: { marginTop: 12, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sheetBtn2: { backgroundColor: "#fff", borderWidth: 1, borderColor: C.ink },
  sheetBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 15 },
  sheetNote: { textAlign: "center", fontSize: 11.5, color: C.muted, marginTop: 10 },
  placing: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center", zIndex: 50 },
  placingIc: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
  placingH: { fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 14 },
  placingS: { fontSize: 12.5, color: C.muted, marginTop: 4 },
  placeBtn: { backgroundColor: C.green, borderRadius: 12, height: 50, minWidth: 180, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  placeTxt: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
