import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { etaRangeFor, fmtCountdown, fmtEtaRange, getDeliveryEta, lookupPincode, type PinInfo } from "@/lib/eta";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

// "Order within 2h 14m · Get it Wed 26 – Mon 1 Dec   4–9 days" — same rules as
// the website's delivery stripe. Uses the saved pincode unless one is passed.
export function useEta({ pincode, faster = false, state, city }: { pincode?: string; faster?: boolean; state?: string; city?: string } = {}) {
  const store = useStore();
  const pin = pincode ?? store.pincode;
  const [info, setInfo] = useState<PinInfo | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let live = true;
    if (/^\d{6}$/.test(pin || "")) lookupPincode(pin!).then((r) => live && setInfo(r));
    return () => {
      live = false;
    };
  }, [pin]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const where = { pincode: pin || "", state: state || info?.state || "", city: city || info?.city || "" };
  const eta = getDeliveryEta({ range: etaRangeFor({ ...where, faster }), now });
  return { eta, dates: fmtEtaRange(eta.from, eta.to), place: info?.ok ? info.city : "", pin, addr: where };
}

export default function EtaStripe({ faster = false, pincode, onPress, style }: { faster?: boolean; pincode?: string; onPress?: () => void; style?: object }) {
  const { eta, dates, place, pin } = useEta({ pincode, faster });
  const body = (
    <View style={[s.wrap, eta.shipsToday && s.live, style]}>
      <Ionicons name={faster ? "flash" : "car-outline"} size={17} color={eta.shipsToday ? C.green : C.ink2} />
      <View style={{ flex: 1 }}>
        <Text style={s.tx} numberOfLines={1}>
          Get it <Text style={s.b}>{dates}</Text>
        </Text>
        <Text style={s.where} numberOfLines={1}>
          {[pin ? `${place ? `${place} ` : ""}${pin}` : "", `${eta.days[0]}–${eta.days[1]} days`].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <View style={[s.badge, eta.shipsToday && s.badgeLive]}>
        <Text style={[s.badgeTxt, eta.shipsToday && { color: "#fff" }]}>{eta.shipsToday ? `Order in ${fmtCountdown(eta.msToCutoff)}` : "Order now"}</Text>
      </View>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F6F6F8", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  live: { backgroundColor: C.greenSoft },
  tx: { fontSize: 13, color: C.ink2 },
  b: { fontWeight: "700", color: C.ink },
  where: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line },
  badgeLive: { backgroundColor: C.green, borderColor: C.green },
  badgeTxt: { fontSize: 10.5, fontWeight: "700", color: C.ink2 },
});
