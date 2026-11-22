import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressScale, Sheet } from "@/components/motion";
import { Text } from "@/components/ui-text";
import { detectInstalledUpiApps, UPI_APPS, upiAppByKey, type UpiApp } from "@/lib/upi";
import { C } from "@/theme";

export function useInstalledUpiApps() {
  const [installed, setInstalled] = useState<string[] | null>(null);
  useEffect(() => {
    detectInstalledUpiApps().then(setInstalled);
  }, []);
  // Detected → only the apps on this phone; otherwise every supported app.
  const apps: UpiApp[] = installed ? UPI_APPS.filter((a) => installed.includes(a.key)) : [...UPI_APPS];
  return { apps, detected: !!installed };
}

function AppMark({ a, size = 30 }: { a: UpiApp; size?: number }) {
  return (
    <View style={[s.mark, { width: size, height: size, borderRadius: size / 2, backgroundColor: a.color }]}>
      <Text style={[s.markTxt, { fontSize: size * 0.42 }]}>{a.label[0]}</Text>
    </View>
  );
}

// "Pay using" dropdown: tap → sheet of the UPI apps on this phone → pick one.
export default function UpiAppPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const insets = useSafeAreaInsets();
  const { apps, detected } = useInstalledUpiApps();
  const [open, setOpen] = useState(false);
  const sel = upiAppByKey(value);
  return (
    <>
      <PressScale scaleTo={0.98} onPress={() => setOpen(true)} style={[s.drop, sel && { borderColor: sel.color }]}>
        {sel ? (
          <AppMark a={sel} size={26} />
        ) : (
          <View style={[s.mark, { width: 26, height: 26, borderRadius: 13, backgroundColor: C.ink }]}>
            <Ionicons name="qr-code-outline" size={14} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.dropK}>Pay using</Text>
          <Text style={s.dropV} numberOfLines={1}>{sel ? sel.label : "Choose your UPI app"}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={C.ink2} />
      </PressScale>

      <Sheet open={open} onClose={() => setOpen(false)} style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.head}>
          <Text style={s.h}>{detected ? "UPI apps on your phone" : "Choose your UPI app"}</Text>
          <Pressable onPress={() => setOpen(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={C.ink} />
          </Pressable>
        </View>
        <Text style={s.sub}>We’ll copy our UPI ID and open the app. Not installed? We’ll take you to the Play Store.</Text>
        <View style={{ gap: 8, marginTop: 14 }}>
          {apps.map((a, i) => {
            const on = a.key === value;
            return (
              <Animated.View key={a.key} entering={FadeInDown.delay(i * 40)}>
                <Pressable
                  onPress={() => {
                    onChange(a.key);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [s.opt, on && { borderColor: a.color, backgroundColor: a.color + "10" }, pressed && { opacity: 0.85 }]}
                >
                  <AppMark a={a} />
                  <Text style={s.optT}>{a.label}</Text>
                  {detected ? <Text style={s.tag}>Installed</Text> : null}
                  <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={20} color={on ? a.color : "#C9C9D0"} />
                </Pressable>
              </Animated.View>
            );
          })}
          <Pressable
            onPress={() => {
              onChange("");
              setOpen(false);
            }}
            style={({ pressed }) => [s.opt, !value && { borderColor: C.ink, backgroundColor: "#F7F7F9" }, pressed && { opacity: 0.85 }]}
          >
            <View style={[s.mark, { width: 30, height: 30, borderRadius: 15, backgroundColor: C.ink }]}>
              <Ionicons name="qr-code-outline" size={15} color="#fff" />
            </View>
            <Text style={s.optT}>Any other UPI app · scan QR</Text>
            <Ionicons name={!value ? "radio-button-on" : "radio-button-off"} size={20} color={!value ? C.ink : "#C9C9D0"} />
          </Pressable>
        </View>
      </Sheet>
    </>
  );
}

const s = StyleSheet.create({
  drop: { flexDirection: "row", alignItems: "center", gap: 10, height: 54, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, backgroundColor: "#fff" },
  dropK: { fontSize: 11, color: C.muted },
  dropV: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  mark: { alignItems: "center", justifyContent: "center" },
  markTxt: { color: "#fff", fontWeight: "700" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  head: { flexDirection: "row", alignItems: "center" },
  h: { flex: 1, fontSize: 17, fontWeight: "700", color: C.ink },
  sub: { fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 18 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.line },
  optT: { flex: 1, fontSize: 14.5, fontWeight: "500", color: C.ink },
  tag: { fontSize: 10.5, fontWeight: "700", color: C.green, backgroundColor: C.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, overflow: "hidden" },
});
