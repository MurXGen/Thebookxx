import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import AnimatedTabBar from "@/components/AnimatedTabBar";
import { showNav, TAB_H } from "@/lib/navScroll";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT } from "@/components/ui-text";
import { useStore } from "@/lib/store";
import { C } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (on: IconName, off: IconName) =>
  function TabIcon({ focused, color }: { focused: boolean; color: import("react-native").ColorValue }) {
    return <Ionicons name={focused ? on : off} size={23} color={color as string} />;
  };

export default function TabsLayout() {
  const { cartCount } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenListeners={{ tabPress: showNav, focus: showNav }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: "#9A9AA3",
        tabBarLabelStyle: { fontSize: 11, fontFamily: FONT.medium },
        tabBarStyle: { borderTopColor: C.line, paddingTop: 6, height: TAB_H + insets.bottom, backgroundColor: "#fff" },
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen name="explore" options={{ title: "Explore", tabBarIcon: icon("grid", "grid-outline") }} />
      <Tabs.Screen
        name="bag"
        options={{
          title: "Bag",
          tabBarIcon: icon("bag-handle", "bag-handle-outline"),
          tabBarBadge: cartCount ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: C.brand, fontSize: 10, fontFamily: FONT.semibold },
        }}
      />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: icon("cube", "cube-outline") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-circle", "person-circle-outline") }} />
    </Tabs>
  );
}
