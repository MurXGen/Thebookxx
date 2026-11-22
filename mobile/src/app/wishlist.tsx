import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { RowCard } from "@/components/BookCard";
import CartBar from "@/components/CartBar";
import type { Book } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

export default function Wishlist() {
  const { wishlist, byId } = useStore();
  const books = wishlist.map((id) => byId.get(id)).filter((b): b is Book => !!b);
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => <RowCard b={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="heart-outline" size={56} color="#C9C9D0" />
            <Text style={s.h}>No saved books yet</Text>
            <Text style={s.sub}>Tap the ♡ on any book to save it here.</Text>
            <Pressable onPress={() => router.navigate("/")} style={s.btn}>
              <Text style={s.btnTxt}>Find books</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={<View style={{ height: 170 }} />}
      />
      <CartBar safeBottom />
    </View>
  );
}

const s = StyleSheet.create({
  empty: { alignItems: "center", padding: 40, marginTop: 40 },
  h: { fontSize: 18, fontWeight: "800", color: C.ink, marginTop: 14 },
  sub: { color: C.muted, marginTop: 4 },
  btn: { marginTop: 18, backgroundColor: C.ink, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  btnTxt: { color: "#fff", fontWeight: "800" },
});
