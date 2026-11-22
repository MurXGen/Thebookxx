import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import type { ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { BookCard } from "@/components/BookCard";
import { Appear } from "@/components/motion";
import type { Book } from "@/lib/catalog";
import { C } from "@/theme";

export function SectionTitle({ title, sub, href }: { title: string; sub?: string; href?: Href }) {
  return (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
      </View>
      {href ? (
        <Pressable onPress={() => router.push(href)} hitSlop={10} style={s.seeAll}>
          <Text style={s.seeAllTxt}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={C.brandDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Block({ children }: { children: ReactNode }) {
  return <Appear style={s.wrap}>{children}</Appear>;
}

export default function Rail({ title, sub, books, href, width = 128, extra }: { title: string; sub?: string; books: Book[]; href?: Href; width?: number; extra?: ReactNode }) {
  if (!books.length) return null;
  return (
    <Appear style={s.wrap}>
      <SectionTitle title={title} sub={sub} href={href} />
      {extra}
      <FlatList
        horizontal
        data={books.slice(0, 20)}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => <BookCard b={item} width={width} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
        initialNumToRender={4}
        windowSize={5}
      />
    </Appear>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 10, backgroundColor: "#fff", paddingVertical: 18 },
  head: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "800", color: C.ink, letterSpacing: -0.3 },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllTxt: { color: C.brandDark, fontWeight: "800", fontSize: 13 },
});
