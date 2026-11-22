import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Fill, Sheet } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bestUnlockedFlat, getCartOffers, nextOffer, type Offer } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { confetti } from "@/lib/confetti";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

// Progress through the reward ladder: one segment per tier, each filling as the
// bag grows; a node per milestone that turns green once reached.
function Ladder({ offers, amount }: { offers: Offer[]; amount: number }) {
  return (
    <View>
      <View style={s.ladder}>
        {offers.map((o, i) => {
          const pct = Math.max(0, Math.min(1, (amount - o.min) / (o.target - o.min)));
          const done = amount >= o.target;
          return (
            <View key={o.target} style={s.seg}>
              <View style={s.track}>
                <Fill pct={pct} color={C.green} />
              </View>
              <View style={[s.node, done && s.nodeOn, i === offers.length - 1 && { right: -2 }]}>
                {done ? <Ionicons name="checkmark" size={10} color="#fff" /> : null}
              </View>
            </View>
          );
        })}
      </View>
      <View style={s.labels}>
        {offers.map((o) => (
          <Text key={o.target} style={[s.label, amount >= o.target && { color: C.green }]} numberOfLines={1}>
            {o.short}
          </Text>
        ))}
      </View>
    </View>
  );
}

function useMilestoneCelebration(amount: number, hasOneRupee: boolean, ready: boolean) {
  const reached = getCartOffers(hasOneRupee).filter((o) => amount >= o.target);
  const count = reached.length;
  const last = reached[reached.length - 1];
  const prev = useRef<number | null>(null);
  useEffect(() => {
    // Until the saved bag has loaded, the count jumps from 0 — that's not a new unlock.
    if (!ready) return;
    if (prev.current !== null && count > prev.current && last) {
      toast(`You unlocked ${last.reward} on this order`, { title: "🎉 Reward unlocked", kind: "success" });
      confetti(last.type === "flat");
    }
    prev.current = count;
  }, [count, last, ready]);
}

export function OfferSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { subtotal, hasOneRupee, appliedOffer, applyOffer } = useStore();
  const offers = getCartOffers(hasOneRupee);
  return (
    <Sheet open={open} onClose={onClose} style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.grab} />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={s.sheetH}>🎁 Unlock more rewards</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={C.ink} />
          </Pressable>
        </View>
        <Text style={s.sheetSub}>Your bag: <Text style={{ fontWeight: "800", color: C.ink }}>{rupee(subtotal)}</Text></Text>
        <ScrollView style={{ maxHeight: 420 }}>
          {offers.map((o, i) => {
            const done = subtotal >= o.target;
            const active = subtotal >= o.min && subtotal < o.target;
            const pct = Math.max(0, Math.min(1, (subtotal - o.min) / (o.target - o.min)));
            const isApplied = o.type === "flat" && appliedOffer === o.value;
            return (
              <View key={o.target} style={s.tier}>
                <View style={{ alignItems: "center" }}>
                  <View style={[s.tierDot, done && s.nodeOn, active && { borderColor: C.ink }]}>
                    <Ionicons name={done ? "checkmark" : o.type === "flat" ? "pricetag" : "car"} size={13} color={done ? "#fff" : active ? C.ink : C.muted} />
                  </View>
                  {i < offers.length - 1 ? <View style={[s.vline, done && { backgroundColor: C.green }]} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: 18 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[s.tierH, !done && !active && { color: C.muted }]}>{o.reward}</Text>
                    <Text style={s.tierAt}>on {rupee(o.target)}+</Text>
                  </View>
                  {done ? (
                    o.type === "flat" ? (
                      isApplied ? (
                        <Text style={s.tierOk}>✓ Applied to your bag</Text>
                      ) : (
                        <Pressable
                          onPress={() => {
                            applyOffer(o.value || 0);
                            toast(`${o.reward} applied`);
                          }}
                          style={s.applyBtn}
                        >
                          <Text style={s.applyTxt}>Apply {o.reward}</Text>
                        </Pressable>
                      )
                    ) : (
                      <Text style={s.tierOk}>✓ Unlocked</Text>
                    )
                  ) : (
                    <>
                      <Text style={s.tierLeft}>Add {rupee(o.target - subtotal)} more</Text>
                      {active ? (
                        <View style={[s.track, { marginTop: 6 }]}>
                          <Fill pct={pct} color={C.green} />
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={() => {
            onClose();
            router.navigate("/");
          }}
          style={s.cta}
        >
          <Text style={s.ctaTxt}>Add more books</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
    </Sheet>
  );
}

// The stripe: next reward message, milestone ladder, bag thumbnails, Avail CTA.
export default function OfferStrip({ docked = false }: { docked?: boolean }) {
  const { subtotal, hasOneRupee, appliedOffer, applyOffer, cart, byId, ready } = useStore();
  const [open, setOpen] = useState(false);
  useMilestoneCelebration(subtotal, hasOneRupee, ready);
  const offers = getCartOffers(hasOneRupee);
  const next = nextOffer(subtotal, hasOneRupee);
  const best = bestUnlockedFlat(subtotal, hasOneRupee);
  const canApply = best && appliedOffer !== best.value;
  const thumbs = cart.slice(0, 3).map((l) => byId.get(l.id)?.image).filter(Boolean) as string[];

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[s.strip, docked && s.stripDocked]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.msg} numberOfLines={2}>
              {next ? (
                <>
                  Add <Text style={s.amt}>{rupee(next.target - subtotal)}</Text> more for <Text style={s.reward}>{next.reward}</Text>
                </>
              ) : (
                <Text style={s.reward}>🎉 You’ve unlocked every offer!</Text>
              )}
            </Text>
            {canApply ? (
              <Pressable
                onPress={() => {
                  applyOffer(best.value || 0);
                  toast(`${best.reward} applied to your bag`);
                }}
                style={s.avail}
                hitSlop={6}
              >
                <Text style={s.availTxt}>Avail {best.reward}</Text>
              </Pressable>
            ) : best ? (
              <Text style={s.applied}>✓ {best.reward}</Text>
            ) : (
              <Text style={s.seeAll}>See all</Text>
            )}
          </View>
          <View style={{ marginTop: 10 }}>
            <Ladder offers={offers} amount={subtotal} />
          </View>
        </View>
        {!docked && thumbs.length ? (
          <View style={s.thumbs}>
            {thumbs.map((t, i) => (
              <Image key={t + i} alt="" source={t} style={[s.thumb, { marginLeft: i ? -14 : 0, zIndex: 3 - i }]} contentFit="cover" />
            ))}
          </View>
        ) : null}
      </Pressable>
      <OfferSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const s = StyleSheet.create({
  strip: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", padding: 14 },
  stripDocked: { paddingVertical: 10, paddingHorizontal: 16 },
  msg: { flex: 1, fontSize: 13, color: C.ink2, fontWeight: "600" },
  amt: { fontWeight: "800", color: C.ink },
  reward: { fontWeight: "800", color: C.green },
  avail: { backgroundColor: C.green, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  availTxt: { color: "#fff", fontWeight: "800", fontSize: 11 },
  applied: { color: C.green, fontWeight: "800", fontSize: 11 },
  seeAll: { color: C.muted, fontWeight: "800", fontSize: 11, textDecorationLine: "underline" },
  ladder: { flexDirection: "row", alignItems: "center", paddingRight: 6 },
  seg: { flex: 1, justifyContent: "center" },
  track: { height: 5, borderRadius: 3, backgroundColor: "#E6E6EC", overflow: "hidden" },
  fill: { height: 5, borderRadius: 3, backgroundColor: C.green },
  node: { position: "absolute", right: -6, width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", borderWidth: 2, borderColor: "#D4D4DA", alignItems: "center", justifyContent: "center" },
  nodeOn: { backgroundColor: C.green, borderColor: C.green },
  labels: { flexDirection: "row", marginTop: 5 },
  label: { flex: 1, textAlign: "right", fontSize: 9.5, fontWeight: "800", color: C.muted, paddingRight: 0 },
  thumbs: { flexDirection: "row" },
  thumb: { width: 32, height: 46, borderRadius: 5, borderWidth: 2, borderColor: "#fff", backgroundColor: C.bg },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  grab: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 14 },
  sheetH: { flex: 1, fontSize: 19, fontWeight: "800", color: C.ink },
  sheetSub: { color: C.muted, marginTop: 4, marginBottom: 16 },
  tier: { flexDirection: "row", gap: 12 },
  tierDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#D4D4DA", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  vline: { width: 2, flex: 1, backgroundColor: "#E6E6EC", marginVertical: 2 },
  tierH: { fontSize: 15, fontWeight: "800", color: C.ink },
  tierAt: { marginLeft: 8, fontSize: 12, color: C.muted, fontWeight: "600" },
  tierOk: { color: C.green, fontWeight: "800", marginTop: 3, fontSize: 12.5 },
  tierLeft: { color: C.ink2, marginTop: 3, fontSize: 12.5 },
  applyBtn: { alignSelf: "flex-start", marginTop: 6, backgroundColor: C.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  applyTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  cta: { marginTop: 8, backgroundColor: C.ink, borderRadius: 12, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
