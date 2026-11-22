import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { goBack } from "@/components/BackButton";
import { Text } from "@/components/ui-text";
import { C } from "@/theme";

type Opts = {
  title?: string;
  headerTitle?: string | ((p: { children: string; tintColor?: string }) => ReactNode);
  headerBackVisible?: boolean;
  headerRight?: (p: { tintColor?: string; canGoBack: boolean }) => ReactNode;
};

// One header for every inner screen: 16 px side padding, a round back button,
// title (and optional subtitle via headerTitle) vertically centred.
export default function ScreenHeader({ options }: { options: Opts }) {
  const insets = useSafeAreaInsets();
  const title = typeof options.headerTitle === "string" ? options.headerTitle : options.title || "";
  const custom = typeof options.headerTitle === "function" ? options.headerTitle({ children: title }) : null;
  const showBack = options.headerBackVisible !== false;
  return (
    <View style={[s.bar, { paddingTop: insets.top }]}>
      <View style={s.row}>
        {showBack ? (
          <Pressable onPress={goBack} hitSlop={10} style={({ pressed }) => [s.back, pressed && { backgroundColor: "#E9E9EE" }]} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={21} color={C.ink} />
          </Pressable>
        ) : null}
        <Animated.View key={title} entering={FadeIn.duration(200)} style={{ flex: 1 }}>
          {custom ?? (
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </Animated.View>
        {options.headerRight ? <View>{options.headerRight({ canGoBack: true })}</View> : null}
      </View>
    </View>
  );
}

export function HeaderTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <View>
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      {sub ? <Text style={s.sub} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  row: { height: 58, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "600", color: C.ink, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: C.muted, marginTop: 1 },
});
