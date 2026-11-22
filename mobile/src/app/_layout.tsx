import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ScreenHeader";
import ConfettiHost from "@/components/ConfettiHost";
import ToastHost from "@/components/ToastHost";
import { FONT } from "@/components/ui-text";
import { initNotifications } from "@/lib/notifications";
import { StoreProvider, useStore } from "@/lib/store";
import { useNotificationPlanner } from "@/lib/useNotificationPlanner";
import { C } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});
initNotifications();

function Gate({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useStore();
  useNotificationPlanner();
  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsReady]);
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontFamily: FONT.semibold, fontSize: 17, color: C.ink },
        headerTintColor: C.ink,
        contentStyle: { backgroundColor: C.bg },
        animation: "slide_from_right",
        header: ({ options }) => <ScreenHeader options={options as never} />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="category/[slug]" options={{ title: "" }} />
      <Stack.Screen name="search" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="wishlist" options={{ title: "Wishlist" }} />
      <Stack.Screen name="wallet" options={{ title: "Wallet" }} />
      <Stack.Screen name="quickreads" options={{ title: "QuickReads" }} />
      <Stack.Screen name="quickread/[id]" options={{ title: "QuickRead" }} />
      <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
      <Stack.Screen name="combos" options={{ title: "Combos & bundles" }} />
      <Stack.Screen name="combo/[slug]" options={{ title: "Combo" }} />
      <Stack.Screen name="order/[id]" options={{ title: "Order details" }} />
      <Stack.Screen name="pay/[id]" options={{ title: "Complete payment", gestureEnabled: false }} />
      <Stack.Screen name="web" options={{ title: "" }} />
      <Stack.Screen name="settings/notifications" options={{ title: "Notification preferences" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const fontsReady = fontsLoaded || !!fontError;
  if (!fontsReady) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Gate fontsReady={fontsReady} />
          <ConfettiHost />
          <ToastHost />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
