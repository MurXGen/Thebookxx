import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { useAppUpdate } from "@/lib/appUpdate";
import { C } from "@/theme";

// Quiet card at the top of Home: "update ready → restart" (over-the-air) or
// "new version → download" (a new APK on the website).
export default function UpdateBanner() {
  const { state, dismiss, restart } = useAppUpdate();
  if (!state) return null;
  const apk = state.kind === "apk";
  return (
    <View style={s.card}>
      <View style={s.ic}>
        <Ionicons name={apk ? "download-outline" : "refresh"} size={17} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{apk ? `New version ${state.info.version} is out` : "App updated"}</Text>
        <Text style={s.sub} numberOfLines={2}>
          {apk ? state.info.notes || "Download and install it over this one — your bag and orders stay." : "Restart to get the latest improvements."}
        </Text>
      </View>
      <Pressable onPress={() => (apk ? Linking.openURL(state.info.url).catch(() => {}) : restart())} style={s.btn} hitSlop={6}>
        <Text style={s.btnTxt}>{apk ? "Update" : "Restart"}</Text>
      </Pressable>
      <Pressable onPress={dismiss} hitSlop={10} accessibilityLabel="Dismiss">
        <Ionicons name="close" size={16} color={C.muted} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E4E4EA" },
  ic: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 13.5, fontWeight: "600", color: C.ink },
  sub: { fontSize: 12, color: C.muted, marginTop: 1, lineHeight: 16 },
  btn: { backgroundColor: C.ink, borderRadius: 10, paddingHorizontal: 12, height: 32, justifyContent: "center" },
  btnTxt: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
});
