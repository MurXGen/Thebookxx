import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CheckoutSteps from "@/components/CheckoutSteps";
import { useInstalledUpiApps } from "@/components/UpiAppPicker";
import { HeaderTitle } from "@/components/ScreenHeader";
import { PressScale } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { confetti } from "@/lib/confetti";
import { confirmUpiOrder, markPaymentPending, orderStatus, resetToUnconfirmed, switchToCod, UPI_ID } from "@/lib/orders";
import { useStore } from "@/lib/store";
import { openUpiApp, upiAppByKey, UPI_APPS } from "@/lib/upi";
import { toast } from "@/lib/toast";
import { C, rupee, SITE } from "@/theme";

// Mirrors the website's UPI flow (AddressModal → UpiPayToCard / UpiAppLaunchRow / UpiAppPayModal):
//  await (2 s "Generating secure QR…") → counting (30 s, polls every 5 s)
//  → ready ("I've paid, verify status") → rechecking (3 s) → success | failed | pending.
//  Tapping a UPI app copies the UPI ID, opens the app and starts a 5-minute
//  verify countdown (polls every 5 s); at 4:00 the order is confirmed.
const QR = `${SITE}/books/uskillbook.png`;
const APPS = UPI_APPS;
const VERIFY_SECONDS = 300;
const AUTO_CONFIRM_LEFT = 60;

type Phase = "await" | "counting" | "ready" | "rechecking" | "verifying" | "success" | "failed";


export default function Pay() {
  const p = useLocalSearchParams<{ id: string; app?: string; adv?: string; amount: string; codTotal?: string; codFee?: string; codDelivery?: string; codLabel?: string; name?: string; phone?: string; codOk?: string }>();
  const id = p.id || "";
  const total = Number(p.amount) || 0;
  const codTotal = Number(p.codTotal) || 0;
  const insets = useSafeAreaInsets();
  const { clearCart, applyOffer, cart, byId } = useStore();
  const items = cart.map((l) => ({ name: byId.get(l.id)?.name || "", qty: l.qty })).filter((x) => x.name);

  const [phase, setPhase] = useState<Phase>("await");
  const [count, setCount] = useState(30);
  const [left, setLeft] = useState(VERIFY_SECONDS);
  const [app, setApp] = useState("your UPI app");
  const [more, setMore] = useState(false);
  const detectedApps = useInstalledUpiApps();
  const [copied, setCopied] = useState(false);
  const done = useRef(false);
  const autoDone = useRef(false);

  const copy = (quiet = false) => {
    Clipboard.setStringAsync(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (!quiet) toast(`Paste it in your UPI app and pay ${rupee(total)}.`, { title: "UPI ID copied", kind: "success" });
  };

  const finish = (pending: boolean) => {
    if (done.current) return;
    done.current = true;
    clearCart();
    applyOffer(0);
    router.replace({ pathname: "/order/[id]", params: { id, placed: pending ? "pending" : "1" } });
  };
  const success = () => {
    if (done.current) return;
    setPhase("success");
    confetti(true);
    setTimeout(() => finish(false), 1900);
  };
  const check = async () => {
    if (done.current || !id) return null;
    const r = await orderStatus(id);
    if (r.confirmed) success();
    else if (r.failed) setPhase("failed");
    return r;
  };

  // Open: copy the UPI ID (like the website) and reveal the QR after 2 s.
  // An app picked at checkout opens right away (website: "Open <app>").
  useEffect(() => {
    copy(true);
    const chosen = upiAppByKey(p.app);
    if (chosen) {
      const t0 = setTimeout(() => launch(chosen), 600);
      return () => clearTimeout(t0);
    }
    const t = setTimeout(() => {
      setCount(30);
      setPhase("counting");
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 30 s counter after the QR appears, polling every 5 s.
  useEffect(() => {
    if (phase !== "counting") return;
    check();
    const tick = setInterval(() => setCount((c) => (c <= 1 ? 0 : c - 1)), 1000);
    const poll = setInterval(check, 5000);
    const to = setTimeout(() => setPhase((ph) => (ph === "counting" ? "ready" : ph)), 30500);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // After opening a UPI app: 5-minute verify countdown; confirmed at 4:00.
  useEffect(() => {
    if (phase !== "verifying") return;
    check();
    const tick = setInterval(() => setLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    const poll = setInterval(check, 5000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (phase !== "verifying" || autoDone.current || left > AUTO_CONFIRM_LEFT) return;
    autoDone.current = true;
    confirmUpiOrder(id).then(success);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  // Android back → the bag (the order stays Unconfirmed, like closing the web modal).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (phase !== "success") router.replace("/bag");
      return true;
    });
    return () => sub.remove();
  }, [phase]);

  async function launch(a: (typeof APPS)[number] | null) {
    copy(true);
    setApp(a ? a.label : "your UPI app");
    setLeft(VERIFY_SECONDS);
    autoDone.current = false;
    setPhase("verifying");
    toast(`Paste the UPI ID and pay ${rupee(total)}`, { title: `UPI ID copied · opening ${a ? a.label : "your app"}`, kind: "success" });
    if (a) {
      const how = await openUpiApp(a);
      if (how === "store") toast(`Install ${a.label} from the Play Store, then come back and pay`, { title: `${a.label} isn’t installed`, kind: "info" });
    }
  }


  // "I've paid, verify status": 3 s check → success / failed / payment pending.
  const iPaid = async () => {
    if (phase === "rechecking") return;
    setPhase("rechecking");
    const t0 = Date.now();
    const r = await orderStatus(id);
    await new Promise((res) => setTimeout(res, Math.max(0, 3000 - (Date.now() - t0))));
    if (r.confirmed) return success();
    if (r.failed) return setPhase("failed");
    await markPaymentPending(id);
    finish(true);
  };

  const toCod = async () => {
    if (!codTotal) return;
    try {
      await switchToCod({ orderId: id, total: codTotal, codFee: Number(p.codFee) || 0, delivery: Number(p.codDelivery) || 0, deliveryLabel: p.codLabel || "", name: p.name || "", phone: p.phone || "" });
      confetti(true);
      finish(false);
    } catch {
      toast("Couldn’t switch to Cash on Delivery. Try again.", { kind: "error" });
    }
  };

  const tryAgain = async () => {
    await resetToUnconfirmed(id);
    setCount(30);
    setPhase("counting");
  };

  const codAllowed = p.codOk !== "0" && codTotal > 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  // ── Success / failed screens ──
  if (phase === "success" || phase === "failed") {
    const failed = phase === "failed";
    return (
      <ScrollView style={s.wrap} contentContainerStyle={[s.center, { flexGrow: 1, paddingTop: insets.top + 30 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Animated.View entering={ZoomIn.springify().damping(12)} style={[s.resIc, { backgroundColor: failed ? C.red : C.green }]}>
          <Ionicons name={failed ? "alert" : "checkmark"} size={44} color="#fff" />
        </Animated.View>
        {failed ? (
          <Animated.View entering={FadeInDown.delay(120)} style={{ alignItems: "center", alignSelf: "stretch" }}>
            <Text style={s.kicker}>Your payment didn’t go through</Text>
            <Text style={s.resH}>Don’t worry, we won’t let your books wait!</Text>
            <View style={s.pfSteps}>
              <View style={s.pfStep}>
                <View style={[s.pfDot, { backgroundColor: C.green }]} />
                <Text style={[s.pfTxt, { fontWeight: "600", color: C.ink }]}>Place your order now</Text>
              </View>
              <View style={s.pfStep}>
                <View style={s.pfDot} />
                <Text style={s.pfTxt}>Pay by cash or UPI when your books arrive</Text>
              </View>
            </View>
            <View style={s.pfSum}>
              <Text style={s.pfSumH}>{items.reduce((n, it) => n + it.qty, 0)} items{p.name ? ` · ${p.name}` : ""}</Text>
              <Text style={s.pfSumS} numberOfLines={2}>
                {items.slice(0, 3).map((i) => i.name).join(", ")}
                {items.length > 3 ? ` +${items.length - 3} more` : ""}
              </Text>
            </View>
            {codAllowed ? (
              <PressScale onPress={toCod} style={s.primary}>
                <Text style={s.primaryTxt}>Order now & pay {rupee(codTotal)} later</Text>
              </PressScale>
            ) : null}
            <PressScale onPress={tryAgain} style={s.secondary}>
              <Ionicons name="refresh" size={15} color={C.ink} />
              <Text style={s.secondaryTxt}>Try paying online again · {rupee(total)}</Text>
            </PressScale>
            <Pressable onPress={() => router.replace("/bag")} hitSlop={8}>
              <Text style={s.skip}>Don’t place order</Text>
            </Pressable>
            {codAllowed && codTotal > total ? <Text style={s.note}>Pay on delivery ships Standard and includes the COD fee.</Text> : null}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(120)} style={{ alignItems: "center" }}>
            <Text style={s.resH}>Payment confirmed</Text>
            <Text style={s.resS}>Thank you! Taking you to your order…</Text>
          </Animated.View>
        )}
      </ScrollView>
    );
  }

  // ── After opening a UPI app: verifying countdown ──
  if (phase === "verifying") {
    return (
      <View style={s.wrap}>
        <Stack.Screen options={{ title: "Verifying payment", headerBackVisible: false }} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 200 }}>
          <Animated.View entering={FadeIn} style={{ alignItems: "center" }}>
            <Pulse />
            <Text style={s.verH}>Checking your payment</Text>
            <Text style={s.verS}>Paid in {app}? Come back here — we confirm it automatically.</Text>
            <Text style={s.timer}>{mm}:{ss}</Text>
          </Animated.View>
          <View style={s.howCard}>
            {[`Open ${app}`, "Paste the UPI ID (already copied) or scan the QR", `Enter ${rupee(total)} & pay`, "Come back — we verify it"].map((t, i) => (
              <Animated.View key={t} entering={FadeInDown.delay(i * 80)} style={s.howRow}>
                <View style={s.howN}>
                  <Text style={s.howNTxt}>{i + 1}</Text>
                </View>
                <Text style={s.howTxt}>{t}</Text>
              </Animated.View>
            ))}
          </View>
          <IdRow copied={copied} onCopy={() => copy()} />
          {left <= VERIFY_SECONDS - 30 ? (
            <Animated.View entering={FadeInDown} style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={s.cap}>Or scan this QR from another phone</Text>
              <Image alt="TheBookX UPI QR" source={QR} style={s.qrSmall} contentFit="contain" />
            </Animated.View>
          ) : null}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <PressScale onPress={iPaid} style={s.verify}>
            <Ionicons name="shield-checkmark-outline" size={16} color={C.ink} />
            <Text style={s.verifyTxt}>I’ve paid, verify status</Text>
          </PressScale>
          <View style={s.links}>
            <Pressable onPress={() => launch(APPS.find((a) => a.label === app) || null)} hitSlop={6}>
              <Text style={s.link}>Open {app} again</Text>
            </Pressable>
            {codAllowed ? (
              <>
                <Text style={s.dotSep}>·</Text>
                <Pressable onPress={toCod} hitSlop={6}>
                  <Text style={s.link}>Pay on delivery instead</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  // ── Scan & pay ──
  return (
    <View style={s.wrap}>
      <Stack.Screen
        options={{
          headerTitle: () => <HeaderTitle title="Scan & pay" sub={p.adv ? `UPI · ${rupee(total)} advance now · ${rupee(Number(p.adv))} at delivery` : `UPI · To pay ${rupee(total)}`} />,
        }}
      />
      <CheckoutSteps at={2} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 280 }}>
        <Animated.View entering={FadeInDown.springify().damping(18)} style={s.payCard}>
          <View style={s.payTop}>
            <Text style={s.payK}>{p.adv ? "Advance to TheBookX" : "Pay to TheBookX"}</Text>
            <Text style={s.payAmt}>{rupee(total)}</Text>
          </View>
          <View style={s.qrBox}>
            <Image alt="TheBookX UPI QR" source={QR} style={[s.qr, phase === "await" && { opacity: 0.15 }]} contentFit="contain" />
            {phase === "await" ? (
              <View style={[StyleSheet.absoluteFill, s.center]}>
                <ActivityIndicator color={C.ink} />
                <Text style={s.gen}>Generating secure QR…</Text>
              </View>
            ) : (
              <ScanLine />
            )}
          </View>
          <Text style={s.scanTxt}>{phase === "await" ? "Hang tight — preparing your QR" : "Scan from another phone, or pay with an app below"}</Text>
          <IdRow copied={copied} onCopy={() => copy()} />
          {phase !== "await" ? (
            <View style={s.status}>
              <View style={s.statusDot} />
              <Text style={s.statusTxt}>Waiting for your payment…</Text>
            </View>
          ) : null}
        </Animated.View>
        <View style={s.trust}>
          <Text style={s.trustTxt}>🔒 256-bit encrypted</Text>
          <Text style={s.trustTxt}>📦 Tracked end-to-end</Text>
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        {phase !== "await" ? (
          <Animated.View entering={FadeInDown}>
            <Text style={s.cap}>Pay with your UPI app</Text>
            <View style={s.chips}>
              {(detectedApps.detected ? detectedApps.apps : APPS.filter((a) => !a.more || more)).map((a) => (
                <PressScale key={a.key} scaleTo={0.94} onPress={() => launch(a)} style={s.chip}>
                  <Text style={s.chipTxt}>{a.label}</Text>
                  <Ionicons name="arrow-forward" size={13} color={C.ink} />
                </PressScale>
              ))}
              {more ? (
                <PressScale scaleTo={0.94} onPress={() => launch(null)} style={s.chip}>
                  <Ionicons name="phone-portrait-outline" size={13} color={C.ink} />
                  <Text style={s.chipTxt}>Any other UPI app</Text>
                </PressScale>
              ) : null}
            </View>
            {!more && !detectedApps.detected ? (
              <Pressable onPress={() => setMore(true)} hitSlop={6} style={{ alignSelf: "center" }}>
                <Text style={s.moreTxt}>More UPI apps ▾</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
        {phase === "await" || phase === "counting" ? (
          <View style={[s.verify, { opacity: 0.85 }]}>
            <ActivityIndicator size="small" color={C.ink} />
            <Text style={s.verifyTxt}>{phase === "await" ? "Preparing secure QR…" : `Checking for your payment… ${count}s`}</Text>
          </View>
        ) : (
          <PressScale onPress={iPaid} disabled={phase === "rechecking"} style={s.verify}>
            {phase === "rechecking" ? <ActivityIndicator size="small" color={C.ink} /> : <Ionicons name="shield-checkmark-outline" size={16} color={C.ink} />}
            <Text style={s.verifyTxt}>{phase === "rechecking" ? "Checking payment status…" : "I’ve paid, verify status"}</Text>
          </PressScale>
        )}
        {codAllowed ? (
          <Pressable onPress={toCod} hitSlop={6} style={{ alignSelf: "center", marginTop: 10 }}>
            <Text style={s.link}>Pay on delivery instead · {rupee(codTotal)}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function IdRow({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <View style={s.idRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.idK}>UPI ID</Text>
        <Text selectable style={s.idV}>{UPI_ID}</Text>
      </View>
      <PressScale scaleTo={0.9} onPress={onCopy} style={[s.copyBtn, copied && { backgroundColor: C.green, borderColor: C.green }]}>
        <Ionicons name={copied ? "checkmark" : "copy-outline"} size={15} color={copied ? "#fff" : C.ink} />
        <Text style={[s.copyTxt, copied && { color: "#fff" }]}>{copied ? "Copied" : "Copy"}</Text>
      </PressScale>
    </View>
  );
}

function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withRepeat(withTiming(1, { duration: 1800 }), -1, true));
  }, [y]);
  const a = useAnimatedStyle(() => ({ top: `${8 + y.get() * 84}%` }));
  return <Animated.View pointerEvents="none" style={[s.scan, a]} />;
}

function Pulse() {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withRepeat(withTiming(1, { duration: 1400 }), -1, false));
  }, [v]);
  const ring = useAnimatedStyle(() => ({ opacity: 1 - v.get(), transform: [{ scale: 1 + v.get() * 0.8 }] }));
  return (
    <View style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center", marginTop: 6 }}>
      <Animated.View style={[s.pulseRing, ring]} />
      <View style={s.pulseCore}>
        <Ionicons name="shield-checkmark" size={32} color="#fff" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  hT: { fontSize: 16, fontWeight: "600", color: C.ink },
  hS: { fontSize: 11.5, color: C.muted },
  payCard: { backgroundColor: "#fff", borderRadius: 18, padding: 18, alignItems: "center", borderWidth: 1, borderColor: C.line },
  payTop: { flexDirection: "row", alignSelf: "stretch", alignItems: "center", justifyContent: "space-between" },
  payK: { fontSize: 13, color: C.ink2, fontWeight: "500" },
  payAmt: { fontSize: 24, fontWeight: "700", color: C.ink },
  qrBox: { marginTop: 14, width: 230, height: 270, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line },
  qr: { width: "100%", height: "100%" },
  scan: { position: "absolute", left: 10, right: 10, height: 2, backgroundColor: C.green, opacity: 0.7 },
  gen: { marginTop: 8, fontSize: 12.5, color: C.ink2 },
  scanTxt: { marginTop: 10, fontSize: 12.5, color: C.muted, textAlign: "center" },
  idRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: C.bg },
  idK: { fontSize: 11, color: C.muted },
  idV: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff", borderRadius: 9, paddingHorizontal: 10, height: 34 },
  copyTxt: { fontSize: 12.5, fontWeight: "600", color: C.ink },
  status: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },
  statusTxt: { fontSize: 12.5, color: C.ink2 },
  trust: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 14 },
  trustTxt: { fontSize: 11.5, color: C.muted },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  cap: { fontSize: 12, color: C.muted, fontWeight: "500", marginBottom: 8, textAlign: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, height: 38, backgroundColor: "#fff" },
  chipTxt: { fontSize: 13, fontWeight: "600", color: C.ink },
  moreTxt: { fontSize: 12, color: C.ink2, marginTop: 8, fontWeight: "500" },
  verify: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.ink, backgroundColor: "#fff" },
  verifyTxt: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  links: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 10 },
  link: { fontSize: 12.5, color: C.ink2, fontWeight: "500", textDecorationLine: "underline" },
  dotSep: { color: C.muted },
  verH: { fontSize: 19, fontWeight: "700", color: C.ink, marginTop: 14 },
  verS: { fontSize: 13, color: C.muted, textAlign: "center", marginTop: 4, lineHeight: 19 },
  timer: { fontSize: 34, fontWeight: "700", color: C.ink, marginTop: 10, letterSpacing: 1 },
  howCard: { marginTop: 18, backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 10 },
  howRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  howN: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
  howNTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  howTxt: { flex: 1, fontSize: 13, color: C.ink2 },
  qrSmall: { width: 170, height: 200, marginTop: 6, borderRadius: 10, backgroundColor: "#fff" },
  pulseRing: { position: "absolute", width: 84, height: 84, borderRadius: 42, backgroundColor: C.green },
  pulseCore: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  resIc: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  kicker: { fontSize: 12.5, color: C.red, fontWeight: "600", marginTop: 16 },
  resH: { fontSize: 20, fontWeight: "700", color: C.ink, textAlign: "center", marginTop: 8 },
  resS: { fontSize: 13.5, color: C.muted, marginTop: 6 },
  pfSteps: { alignSelf: "stretch", marginTop: 18, gap: 10, padding: 14, borderRadius: 12, backgroundColor: "#fff" },
  pfStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  pfDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#D4D4DA" },
  pfTxt: { fontSize: 13, color: C.ink2 },
  pfSum: { alignSelf: "stretch", marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: "#fff" },
  pfSumH: { fontSize: 13, fontWeight: "600", color: C.ink },
  pfSumS: { fontSize: 12, color: C.muted, marginTop: 2 },
  primary: { alignSelf: "stretch", marginTop: 16, height: 50, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  primaryTxt: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondary: { alignSelf: "stretch", flexDirection: "row", gap: 6, marginTop: 10, height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.ink, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  secondaryTxt: { color: C.ink, fontWeight: "600", fontSize: 14 },
  skip: { marginTop: 14, fontSize: 13, color: C.muted, textDecorationLine: "underline" },
  note: { marginTop: 10, fontSize: 11.5, color: C.muted, textAlign: "center" },
});
