import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/ui-text";
import { goBack } from "@/components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RowCard } from "@/components/BookCard";
import CartBar from "@/components/CartBar";
import { categoriesOf, searchBooks, searchCombos } from "@/lib/catalog";
import { ComboCard } from "@/components/ComboCard";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

const POPULAR = ["Atomic Habits", "Psychology of Money", "Ikigai", "48 Laws of Power", "Colleen Hoover", "Freida McFadden"];

export default function Search() {
  const insets = useSafeAreaInsets();
  const { catalog, combos, byId } = useStore();
  const [q, setQ] = useState("");
  const results = useMemo(() => searchBooks(catalog.books, q).slice(0, 60), [catalog, q]);
  const comboHits = useMemo(() => (q.trim().length >= 3 ? searchCombos(combos, byId, q).slice(0, 10) : []), [combos, byId, q]);
  const cats = useMemo(() => categoriesOf(catalog.books).slice(0, 10), [catalog]);
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goBack} hitSlop={10} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={C.ink} />
        </Pressable>
        <View style={s.inputWrap}>
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Search books, authors, genres" placeholderTextColor={C.muted} style={s.input} returnKeyType="search" />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </Pressable>
          ) : (
            <Ionicons name="search" size={18} color={C.muted} />
          )}
        </View>
      </View>
      {q.trim() ? (
        <FlatList
          data={results}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <RowCard b={item} />}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              {comboHits.length ? (
                <View style={{ paddingTop: 12 }}>
                  <Text style={s.count}>Combos · {comboHits.length}</Text>
                  <FlatList
                    horizontal
                    data={comboHits}
                    keyExtractor={(c) => c.id}
                    renderItem={({ item }) => <ComboCard c={item} width={240} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 8, paddingBottom: 4 }}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              ) : null}
              <Text style={s.count}>{results.length ? `${results.length} book${results.length > 1 ? "s" : ""}` : ""}</Text>
            </View>
          }
          ListEmptyComponent={<Text style={s.empty}>No books found for “{q}”. Try another spelling or an author name.</Text>}
          ListFooterComponent={<View style={{ height: 170 }} />}
        />
      ) : (
        <View style={{ padding: 16 }}>
          <Text style={s.h}>Popular searches</Text>
          <View style={s.wrap}>
            {POPULAR.map((p) => (
              <Pressable key={p} onPress={() => setQ(p)} style={s.chip}>
                <Ionicons name="trending-up" size={14} color={C.ink2} />
                <Text style={s.chipTxt}>{p}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[s.h, { marginTop: 22 }]}>Browse genres</Text>
          <View style={s.wrap}>
            {cats.map((c) => (
              <Pressable key={c.slug} onPress={() => router.push(`/category/${c.slug}`)} style={s.chip}>
                <Text style={s.chipTxt}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      <CartBar safeBottom />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, fontSize: 15, color: C.ink },
  count: { paddingHorizontal: 16, paddingTop: 12, color: C.muted, fontWeight: "700", fontSize: 12 },
  empty: { padding: 30, textAlign: "center", color: C.muted },
  h: { fontSize: 15, fontWeight: "800", color: C.ink, marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipTxt: { fontSize: 13, color: C.ink2, fontWeight: "600" },
});
