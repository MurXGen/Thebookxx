import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import PhoneGate from "@/components/PhoneGate";
import { Text } from "@/components/ui-text";
import { useStore } from "@/lib/store";
import { computeWalletLedger, fetchWalletEntries, fmtDate, fmtDateTime, WALLET_TTL_DAYS, type Ledger } from "@/lib/wallet";
import { C, rupee } from "@/theme";

const FILTERS = [
  { k: "all", label: "All" },
  { k: "credit", label: "Credited" },
  { k: "debit", label: "Used" },
] as const;

export default function Wallet() {
  const { profile } = useStore();
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["k"]>("all");
  const [how, setHow] = useState(false);

  const load = useCallback(async () => {
    if (!profile.phone) return;
    setError(false);
    try {
      setLedger(computeWalletLedger(await fetchWalletEntries(profile.phone)));
    } catch {
      setError(true);
    }
  }, [profile.phone]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const list = (ledger?.history || []).filter((h) => !h.locked).filter((h) => filter === "all" || h.type === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      {/* Balance card */}
      <Animated.View entering={FadeInDown.springify().damping(18)}>
        <LinearGradient colors={["#0F5132", "#1BA672"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.coinBig}>
            <Ionicons name="wallet" size={26} color="#0F5132" />
          </View>
          <Text style={s.heroK}>Wallet balance</Text>
          {profile.phone && !ledger && !error ? (
            <ActivityIndicator color="#fff" style={{ alignSelf: "flex-start", marginTop: 10 }} />
          ) : (
            <Animated.View key={ledger?.balance ?? -1} entering={FadeIn.duration(300)}>
              <Text style={s.heroV}>{rupee(ledger?.balance || 0)}</Text>
            </Animated.View>
          )}
          <Text style={s.heroS}>{profile.phone ? `+91 ${profile.phone} · use it on any order` : "Log in to see your balance"}</Text>
          <Pressable onPress={() => setHow(!how)} style={s.howBtn} hitSlop={6}>
            <Text style={s.howTxt}>How the wallet works</Text>
            <Ionicons name={how ? "chevron-up" : "chevron-down"} size={14} color="#fff" />
          </Pressable>
          {how ? (
            <Animated.View entering={FadeInDown.duration(220)} style={s.benefits}>
              {[
                { i: "checkmark-circle" as const, t: "Use on any order — no minimum" },
                { i: "time" as const, t: `Valid for ${WALLET_TTL_DAYS} days from credit` },
                { i: "gift" as const, t: "Earn coins with scratch cards at checkout" },
              ].map((b) => (
                <View key={b.t} style={s.benefit}>
                  <Ionicons name={b.i} size={15} color="#BBF7D0" />
                  <Text style={s.benefitTxt}>{b.t}</Text>
                </View>
              ))}
            </Animated.View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      {!profile.phone ? <PhoneGate title="See your wallet" sub="Enter your mobile number to see your wallet balance and history." /> : null}

      {ledger && ledger.expiringSoon > 0 && ledger.expiringDate ? (
        <Animated.View entering={FadeInDown.delay(80)} style={s.warn}>
          <Ionicons name="warning" size={17} color="#B45309" />
          <Text style={s.warnTxt}>
            <Text style={{ fontWeight: "700" }}>{rupee(ledger.expiringSoon)}</Text> will expire on <Text style={{ fontWeight: "700" }}>{fmtDate(ledger.expiringDate)}</Text>. Use it before then so you don’t lose it.
          </Text>
        </Animated.View>
      ) : null}
      {ledger && ledger.expiredTotal > 0 ? (
        <Text style={s.expired}>{rupee(ledger.expiredTotal)} in older coins expired unused (coins last {WALLET_TTL_DAYS} days).</Text>
      ) : null}

      {error ? (
        <View style={s.empty}>
          <Ionicons name="cloud-offline-outline" size={40} color="#C9C9D0" />
          <Text style={s.emptyTxt}>Couldn’t load your wallet. Pull down to retry.</Text>
        </View>
      ) : ledger && ledger.history.filter((h) => !h.locked).length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="gift-outline" size={40} color={C.brand} />
          <Text style={s.emptyTxt}>No wallet activity yet. Earn coins with scratch cards at checkout!</Text>
          <PressScale onPress={() => router.navigate("/")} style={s.emptyBtn}>
            <Text style={s.emptyBtnTxt}>Shop books</Text>
          </PressScale>
        </View>
      ) : ledger ? (
        <View style={{ marginTop: 18 }}>
          <Text style={s.h2}>Transaction history</Text>
          <View style={s.chips}>
            {FILTERS.map((f) => (
              <Pressable key={f.k} onPress={() => setFilter(f.k)} style={[s.chip, filter === f.k && s.chipOn]}>
                <Text style={[s.chipTxt, filter === f.k && { color: "#fff" }]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.list}>
            {list.map((h, i) => {
              const cr = h.type === "credit";
              return (
                <Animated.View key={`${h.date.getTime()}-${i}`} entering={FadeInDown.delay(Math.min(i, 8) * 40)} style={[s.txn, i < list.length - 1 && s.txnLine, h.pending && { opacity: 0.75 }]}>
                  <View style={[s.txnIc, { backgroundColor: cr ? C.greenSoft : "#FEE2E2" }]}>
                    <Ionicons name={cr ? "arrow-down" : "arrow-up"} size={17} color={cr ? C.green : C.red} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={s.txnT} numberOfLines={2}>{h.reason || (cr ? "Reward credited" : "Used on order")}</Text>
                      {h.pending ? <Text style={s.pend}>Pending</Text> : null}
                    </View>
                    <Text style={s.txnD}>{h.pending ? "Applied — deducts once the order is confirmed" : fmtDateTime(h.date)}</Text>
                    {cr && h.expires ? (
                      <Text style={[s.txnExp, (h.expiredAmount || 0) > 0 && { color: C.red }]}>
                        {(h.expiredAmount || 0) > 0
                          ? (h.expiredAmount || 0) >= Math.abs(h.amount)
                            ? `Expired on ${fmtDate(h.expires)}`
                            : `${rupee(h.expiredAmount || 0)} expired on ${fmtDate(h.expires)}`
                          : h.expired || h.remaining === 0
                            ? "Used"
                            : `${rupee(h.remaining || 0)} left · expires ${fmtDate(h.expires)}`}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[s.amt, { color: cr ? C.green : C.ink }]}>
                    {cr ? "+" : "−"}
                    {rupee(Math.abs(h.amount))}
                  </Text>
                </Animated.View>
              );
            })}
            {!list.length ? <Text style={[s.emptyTxt, { padding: 18 }]}>Nothing here yet.</Text> : null}
          </View>
        </View>
      ) : null}

      <Text style={s.foot}>Coins expire {WALLET_TTL_DAYS} days after they are credited.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 20, padding: 20, overflow: "hidden" },
  coinBig: { position: "absolute", right: 18, top: 18, width: 48, height: 48, borderRadius: 24, backgroundColor: "#BBF7D0", alignItems: "center", justifyContent: "center" },
  heroK: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
  heroV: { color: "#fff", fontSize: 38, fontWeight: "700", marginTop: 4, letterSpacing: -0.5 },
  heroS: { color: "rgba(255,255,255,0.75)", fontSize: 12.5, marginTop: 2 },
  howBtn: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 14, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  howTxt: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
  benefits: { marginTop: 12, gap: 8 },
  benefit: { flexDirection: "row", alignItems: "center", gap: 8 },
  benefitTxt: { color: "#fff", fontSize: 13 },
  warn: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A" },
  warnTxt: { flex: 1, fontSize: 13, color: "#78350F", lineHeight: 19 },
  expired: { fontSize: 12, color: C.muted, marginTop: 10 },
  h2: { fontSize: 16, fontWeight: "700", color: C.ink },
  chips: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fff" },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipTxt: { fontSize: 12.5, fontWeight: "600", color: C.ink2 },
  list: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: "hidden" },
  txn: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  txnLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  txnIc: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txnT: { flexShrink: 1, fontSize: 14, fontWeight: "600", color: C.ink },
  txnD: { fontSize: 12, color: C.muted, marginTop: 2 },
  txnExp: { fontSize: 11.5, color: C.green, marginTop: 3, fontWeight: "500" },
  pend: { fontSize: 10, fontWeight: "700", color: "#B45309", backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, overflow: "hidden" },
  amt: { fontSize: 15, fontWeight: "700" },
  empty: { alignItems: "center", gap: 10, padding: 28, marginTop: 16, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: C.line },
  emptyTxt: { color: C.muted, textAlign: "center", fontSize: 13.5, lineHeight: 19 },
  emptyBtn: { marginTop: 6, backgroundColor: C.ink, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  emptyBtnTxt: { color: "#fff", fontWeight: "600" },
  foot: { textAlign: "center", fontSize: 11.5, color: C.muted, marginTop: 18 },
});
