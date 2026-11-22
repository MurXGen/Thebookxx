import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/ui-text";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PressScale } from "@/components/motion";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C } from "@/theme";

// Asks for the reader's mobile number (the same key the website uses for
// orders, wallet and profile) when the app doesn't have it yet.
export default function PhoneGate({ title = "See your orders", sub = "Enter the mobile number you order with. We’ll show your orders, tracking and details." }: { title?: string; sub?: string }) {
  const { saveProfile } = useStore();
  const [v, setV] = useState("");
  const valid = /^[6-9]\d{9}$/.test(v);
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={s.card}>
      <View style={s.icon}>
        <Ionicons name="phone-portrait-outline" size={22} color={C.ink} />
      </View>
      <Text style={s.h}>{title}</Text>
      <Text style={s.sub}>{sub}</Text>
      <View style={[s.inputWrap, valid && { borderColor: C.ink }]}>
        <Text style={s.prefix}>+91</Text>
        <TextInput value={v} onChangeText={(t) => setV(t.replace(/\D/g, "").slice(-10))} placeholder="10-digit mobile number" placeholderTextColor={C.muted} keyboardType="phone-pad" maxLength={10} style={s.input} />
      </View>
      <PressScale
        disabled={!valid}
        onPress={() => {
          saveProfile({ phone: v });
          toast("Number saved");
        }}
        style={[s.btn, !valid && { backgroundColor: "#C9C9D0" }]}
      >
        <Text style={s.btnTxt}>Continue</Text>
      </PressScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.line },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  h: { fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 12 },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 19 },
  inputWrap: { flexDirection: "row", alignItems: "center", marginTop: 16, borderWidth: 1, borderColor: "#DCDCE2", borderRadius: 12, paddingHorizontal: 12 },
  prefix: { fontSize: 15, color: C.ink2, fontWeight: "600", marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: C.ink },
  btn: { marginTop: 12, backgroundColor: C.ink, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
