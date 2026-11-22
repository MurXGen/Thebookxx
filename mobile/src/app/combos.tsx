import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import CartBar from "@/components/CartBar";
import { ComboCard } from "@/components/ComboCard";
import { Text } from "@/components/ui-text";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

export default function Combos() {
  const { combos } = useStore();
  const { width } = useWindowDimensions();
  const cats = useMemo(() => ["All", ...new Set(combos.map((c) => c.category).filter(Boolean))], [combos]);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? combos : combos.filter((c) => c.category === cat);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: "Combos & bundles" }} />
      <View style={{ backgroundColor: "#fff" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }}>
          {cats.map((k) => (
            <Pressable key={k} onPress={() => setCat(k)} style={[s.chip, cat === k && s.chipOn]}>
              <Text style={[s.chipTxt, cat === k && { color: "#fff" }]}>{k}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 180 }}
        renderItem={({ item }) => <ComboCard c={item} width={width - 32} />}
        initialNumToRender={5}
      />
      <CartBar safeBottom />
    </View>
  );
}

const s = StyleSheet.create({
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fff" },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipTxt: { fontSize: 12.5, fontWeight: "500", color: C.ink2 },
});
