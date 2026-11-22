import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sheet } from "@/components/motion";
import { Text, TextInput } from "@/components/ui-text";
import { couponAmt, fetchCoupons, type Coupon } from "@/lib/coupons";
import { C } from "@/theme";

// Website's coupon sheet: type a code, or pick from "Available coupons · 1 offer per order".
type Reward = { label: string; amount: number; active: boolean };
export default function CouponSheet({
  open, onClose, cartValue, applied, applying, error, onApply, onRemove, reward, unlocked, onUseReward, onRemoveReward, onApplyReward,
}: {
  open: boolean; onClose: () => void; cartValue: number; applied: Coupon | null; applying: boolean; error: string; onApply: (code: string) => void; onRemove: () => void;
  reward: Reward | null; unlocked: { reward: string; value?: number } | null; onUseReward: () => void; onRemoveReward: () => void; onApplyReward: (v: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [list, setList] = useState<Coupon[] | null>(null);
  useEffect(() => {
    if (!open) return;
    let live = true;
    fetchCoupons(cartValue).then((c) => live && setList(c));
    return () => {
      live = false;
    };
  }, [open, cartValue]);
  const sorted = [...(list || [])].sort((a, b) => Number(!(a.status === "active" && a.usable)) - Number(!(b.status === "active" && b.usable)));
  return (
    <Sheet open={open} onClose={onClose} style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
      <View style={s.head}>
        <Ionicons name="pricetags-outline" size={18} color={C.ink} />
        <Text style={s.h}>Coupons & offers</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={22} color={C.ink} />
        </Pressable>
      </View>
      <View style={[s.inputRow, !!error && { borderColor: C.red }]}>
        <TextInput value={code} onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ""))} placeholder="Enter coupon code" placeholderTextColor="#A3A3AD" autoCapitalize="characters" style={s.input} />
        <Pressable onPress={() => code && onApply(code)} disabled={!code || applying} style={s.applyBtn} hitSlop={6}>
          {applying ? <ActivityIndicator size="small" color={C.brandDark} /> : <Text style={[s.applyTxt, !code && { color: "#C9C9D0" }]}>APPLY</Text>}
        </Pressable>
      </View>
      {error ? <Text style={s.err}>{error}</Text> : null}

      {/* Your cart reward — only one offer per order (website's cpx "cart reward") */}
      {reward || (unlocked && !applied) ? (
        <>
          <Text style={s.lbl}>Your cart reward</Text>
          {reward ? (
            <View style={[s.reward, reward.active && s.rewardOn]}>
              <View style={[s.rIc, reward.active && { backgroundColor: C.green }]}>
                <Ionicons name={reward.active ? "checkmark" : "gift"} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rH}>{reward.label || `₹${reward.amount} OFF`}</Text>
                <Text style={[s.rS, reward.active && { color: C.green }]}>{reward.active ? "Applied to this order" : applied ? "Replaced by your coupon" : "Not applied"}</Text>
              </View>
              {reward.active ? (
                <Pressable onPress={onRemoveReward} hitSlop={8}>
                  <Text style={[s.act, { color: C.muted }]}>REMOVE</Text>
                </Pressable>
              ) : (
                <Pressable onPress={onUseReward} hitSlop={8}>
                  <Text style={s.act}>USE</Text>
                </Pressable>
              )}
            </View>
          ) : unlocked ? (
            <View style={s.reward}>
              <View style={s.rIc}>
                <Ionicons name="gift" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rH}>{unlocked.reward} unlocked 🎁</Text>
                <Text style={s.rS}>Save ₹{unlocked.value} on this order</Text>
              </View>
              <Pressable onPress={() => onApplyReward(unlocked.value || 0)} hitSlop={8}>
                <Text style={s.act}>APPLY</Text>
              </Pressable>
            </View>
          ) : null}
          {reward?.active ? <Text style={s.rNote}>Applying a coupon replaces this reward — 1 offer per order.</Text> : null}
        </>
      ) : null}

      <Text style={s.lbl}>
        Available coupons <Text style={{ color: C.muted, fontWeight: "400" }}>· 1 offer per order</Text>
      </Text>
      <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: 10, paddingBottom: 6 }}>
        {list === null ? (
          <View style={s.empty}>
            <ActivityIndicator color={C.ink} />
            <Text style={s.emptyTxt}>Finding coupons for you…</Text>
          </View>
        ) : !sorted.length ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No coupons right now</Text>
          </View>
        ) : (
          sorted.map((c, i) => {
            const off = c.status !== "active" || !c.usable;
            const isApplied = applied?.code === c.code;
            return (
              <Animated.View key={c.code} entering={FadeInDown.delay(i * 50)} style={[s.ticket, off && { opacity: 0.55 }, isApplied && s.ticketOn]}>
                <View style={[s.stub, isApplied && { backgroundColor: C.green }]}>
                  <Text style={s.stubAmt}>{couponAmt(c)}</Text>
                  <Text style={s.stubOff}>OFF</Text>
                </View>
                <View style={s.notchTop} />
                <View style={s.notchBot} />
                <View style={{ flex: 1, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={s.code}>{c.code}</Text>
                    {isApplied ? (
                      <Pressable onPress={onRemove} hitSlop={8}>
                        <Text style={[s.act, { color: C.muted }]}>REMOVE</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => onApply(c.code)} disabled={off || applying} hitSlop={8}>
                        <Text style={[s.act, off && { color: "#C9C9D0" }]}>APPLY</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={s.title} numberOfLines={2}>{c.title}</Text>
                  <Text style={[s.status, isApplied ? { color: C.green } : off ? { color: C.red } : null]}>
                    {isApplied ? "✓ Applied to this order" : c.status !== "active" ? "Expired" : !c.usable && c.reason ? c.reason : `Save ${couponAmt(c)} on this order`}
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  h: { flex: 1, fontSize: 17, fontWeight: "700", color: C.ink },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 14, borderWidth: 1, borderColor: "#DCDCE2", borderRadius: 12, paddingLeft: 14, paddingRight: 6 },
  input: { flex: 1, height: 48, fontSize: 15, fontWeight: "600", letterSpacing: 1, color: C.ink },
  applyBtn: { paddingHorizontal: 12, height: 36, justifyContent: "center" },
  applyTxt: { color: C.brandDark, fontWeight: "700", fontSize: 13.5 },
  err: { color: C.red, fontSize: 12, marginTop: 6 },
  lbl: { fontSize: 13.5, fontWeight: "600", color: C.ink, marginTop: 18, marginBottom: 10 },
  empty: { alignItems: "center", padding: 24, gap: 8, borderRadius: 12, backgroundColor: C.bg },
  emptyTxt: { color: C.muted, fontSize: 13 },
  reward: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff" },
  rewardOn: { borderColor: C.green, backgroundColor: "#F4FBF7" },
  rIc: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.brand, alignItems: "center", justifyContent: "center" },
  rH: { fontSize: 14, fontWeight: "600", color: C.ink },
  rS: { fontSize: 12, color: C.muted, marginTop: 1 },
  rNote: { fontSize: 11.5, color: C.muted, marginTop: 6 },
  ticket: { flexDirection: "row", borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff", overflow: "hidden" },
  ticketOn: { borderColor: C.green, backgroundColor: "#F4FBF7" },
  stub: { width: 66, backgroundColor: C.brand, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  stubAmt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  stubOff: { color: "rgba(255,255,255,0.85)", fontSize: 10.5, fontWeight: "700", letterSpacing: 1 },
  notchTop: { position: "absolute", left: 58, top: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line },
  notchBot: { position: "absolute", left: 58, bottom: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line },
  code: { flex: 1, fontSize: 14.5, fontWeight: "700", color: C.ink, letterSpacing: 0.6 },
  act: { fontSize: 12.5, fontWeight: "700", color: C.brandDark },
  title: { fontSize: 12.5, color: C.ink2, marginTop: 3 },
  status: { fontSize: 11.5, color: C.muted, marginTop: 4, fontWeight: "500" },
});
