import { Stack, useLocalSearchParams } from "expo-router";
import SiteWebView from "@/components/SiteWebView";

export default function Web() {
  const { path, title } = useLocalSearchParams<{ path: string; title?: string }>();
  const safe = typeof path === "string" && path.startsWith("/") ? path : "/";
  return (
    <>
      <Stack.Screen options={{ title: title || "" }} />
      <SiteWebView path={safe} />
    </>
  );
}
