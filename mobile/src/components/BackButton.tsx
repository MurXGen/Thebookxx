import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable } from "react-native";

// Back that always works: pops when there's history, else goes Home (deep
// links, notification taps and web reloads open a page with no history).
export const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

export default function BackButton({ tintColor = "#1C1C1E" }: { tintColor?: string }) {
  return (
    <Pressable onPress={goBack} hitSlop={12} style={{ paddingRight: 12, paddingVertical: 4 }} accessibilityRole="button" accessibilityLabel="Go back">
      <Ionicons name="arrow-back" size={23} color={tintColor} />
    </Pressable>
  );
}
