import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui-text";
import { onToast, type ToastMsg } from "@/lib/toast";
import { C } from "@/theme";

const KIND = {
  success: { icon: "checkmark" as const, bg: C.green },
  info: { icon: "information" as const, bg: C.ink },
  error: { icon: "alert" as const, bg: C.red },
};

// White card toast that drops in from the top with a light haptic tap.
export default function ToastHost() {
  const [t, setT] = useState<(ToastMsg & { key: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  useEffect(
    () =>
      onToast((m) => {
        if (Platform.OS !== "web") {
          if (m.kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          else if (m.kind === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        }
        setT({ ...m, key: Date.now() });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setT(null), m.title ? 2400 : 2200);
      }),
    [],
  );
  if (!t) return null;
  const k = KIND[t.kind];
  return (
    <View pointerEvents="none" style={[s.host, { top: insets.top + 8 }]}>
      <Animated.View key={t.key} entering={FadeInUp.duration(180)} exiting={FadeOut.duration(150)} style={s.card}>
        {t.image ? (
          <Image alt="" source={t.image} style={s.img} contentFit="cover" />
        ) : (
          <View style={[s.ic, { backgroundColor: k.bg }]}>
            <Ionicons name={k.icon} size={15} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {t.title ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Ionicons name="checkmark-circle" size={14} color={C.green} />
              <Text style={s.title}>{t.title}</Text>
            </View>
          ) : null}
          <Text style={t.title ? s.sub : s.msg} numberOfLines={2}>{t.message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  host: { position: "absolute", left: 12, right: 12, zIndex: 999, elevation: 30 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E4E4EA", shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  ic: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  img: { width: 30, height: 42, borderRadius: 4, backgroundColor: C.bg },
  title: { fontSize: 13.5, fontWeight: "600", color: C.ink },
  sub: { fontSize: 12.5, color: C.muted, marginTop: 1 },
  msg: { fontSize: 13.5, fontWeight: "500", color: C.ink, lineHeight: 19 },
});
