import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { Sheet } from "@/components/motion";
import { Text, TextInput } from "@/components/ui-text";
import EtaStripe from "@/components/EtaStripe";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C } from "@/theme";

export default function PincodeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pincode, setPincode } = useStore();
  const [v, setV] = useState(pincode);
  const valid = /^[1-9]\d{5}$/.test(v);
  return (
    <Sheet open={open} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.sheet}>
        <View style={s.grab} />
        <Text style={s.h}>Where should we deliver?</Text>
        <Text style={s.sub}>We’ll show when your books will arrive. Delivery across India, Cash on Delivery available.</Text>
        <TextInput
          value={v}
          onChangeText={(t) => setV(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter your 6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          style={[s.input, v ? s.inputFilled : null]}
          placeholderTextColor={C.muted}
        />
        {valid ? <EtaStripe pincode={v} style={{ marginTop: 10 }} /> : null}
        <Pressable
          disabled={!valid}
          onPress={() => {
            setPincode(v);
            toast(`Delivering to ${v}`);
            onClose();
          }}
          style={[s.btn, !valid && { backgroundColor: "#C9C9CF" }]}
        >
          <Text style={s.btnTxt}>Save pincode</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { backgroundColor: "#fff", padding: 20, paddingBottom: 32, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  grab: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 14 },
  h: { fontSize: 17, fontWeight: "700", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14, lineHeight: 18 },
  input: { borderWidth: 1, borderColor: "#D9D9E0", borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, fontWeight: "500", color: C.ink, backgroundColor: "#FAFAFB" },
  inputFilled: { fontSize: 16, fontWeight: "600", letterSpacing: 1.5, borderColor: C.ink, backgroundColor: "#fff" },
  btn: { marginTop: 12, backgroundColor: C.ink, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" },
  btnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
