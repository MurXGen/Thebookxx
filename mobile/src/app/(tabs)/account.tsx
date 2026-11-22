import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressScale } from "@/components/motion";
import PhoneGate from "@/components/PhoneGate";
import PincodeSheet from "@/components/PincodeSheet";
import { Text } from "@/components/ui-text";
import { isXmas, Snow, XmasTree } from "@/components/Xmas";
import { useHideNavOnScroll } from "@/lib/navScroll";
import { getPermission, loadPrefs } from "@/lib/notifications";
import { shareText } from "@/lib/share";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, SITE, WHATSAPP } from "@/theme";

const LOGO = require("@/assets/images/icon.png");
type IconName = keyof typeof Ionicons.glyphMap;

export default function Account() {
  const insets = useSafeAreaInsets();
  const { wishlist, pincode, cartCount, profile, signOut } = useStore();
  const [pin, setPin] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const onScroll = useHideNavOnScroll();

  useFocusEffect(
    useCallback(() => {
      (async () => setNotifOn((await loadPrefs()).enabled && (await getPermission()) === "granted"))();
    }, []),
  );

  const web = (path: string, title: string): Href => ({ pathname: "/web", params: { path, title } });
  const name = profile.name || (profile.phone ? "Reader" : "");

  const logout = () => {
    const go = () => {
      signOut();
      toast("You’re logged out", { kind: "info" });
    };
    if (Platform.OS === "web") {
      if (globalThis.confirm?.("Log out of TheBookX on this device?")) go();
    } else
      Alert.alert("Log out?", "Your bag and wishlist stay on this device.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: go },
      ]);
  };

  return (
    <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 130 }}>
      {/* Profile card */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <LinearGradient colors={["#1C1C1E", "#3A3A40"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            {isXmas() ? <Snow count={14} /> : null}
            <View style={s.heroRow}>
              <Image alt="" source={LOGO} style={s.avatarImg} />
              <View style={{ flex: 1 }}>
                <Text style={s.hi} numberOfLines={1}>
                  {profile.phone ? `Hi, ${name.split(" ")[0]}` : "Welcome to TheBookX"}
                </Text>
                <Text style={s.hiSub} numberOfLines={1}>
                  {profile.phone ? `+91 ${profile.phone}` : "Log in with your number to see orders"}
                </Text>
                {isXmas() ? <Text style={s.xmas}>🎄 Merry Christmas from TheBookX</Text> : null}
              </View>
              {isXmas() ? <XmasTree size={60} /> : null}
            </View>
            {profile.pincode || pincode ? (
              <Pressable onPress={() => setPin(true)} style={s.heroChip}>
                <Ionicons name="location" size={13} color="#fff" />
                <Text style={s.heroChipTxt} numberOfLines={1}>
                  Delivering to {profile.city ? `${profile.city} · ` : ""}{pincode || profile.pincode}
                </Text>
                <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.7)" />
              </Pressable>
            ) : null}
          </LinearGradient>
        </Animated.View>
      </View>

      {!profile.phone ? <PhoneGate title="Log in with your mobile number" sub="See your orders, track deliveries and check out faster." /> : null}

      {/* Quick tiles */}
      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={s.tiles}>
        <Tile icon="bag-handle" color="#16A34A" n={cartCount} label="In bag" onPress={() => router.navigate("/bag")} />
        <Tile icon="heart" color="#E11D48" n={wishlist.length} label="Wishlist" onPress={() => router.push("/wishlist")} />
        <Tile icon="cube" color="#2563EB" label="Orders" onPress={() => router.navigate("/orders")} />
      </Animated.View>

      {/* Refer banner */}
      <Animated.View entering={FadeInDown.delay(140).springify().damping(18)} style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <PressScale scaleTo={0.98} onPress={() => router.push(web("/refer", "Refer & earn"))}>
          <LinearGradient colors={["#FFF3E6", "#FFE4C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.refer}>
            <View style={s.referIc}>
              <Ionicons name="gift" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.referH}>Refer friends, earn wallet cash</Text>
              <Text style={s.referS}>Share your code · you both get rewards</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.brandDark} />
          </LinearGradient>
        </PressScale>
      </Animated.View>

      <Group title="Your account" delay={200}>
        <Row icon="cube-outline" tint="#2563EB" title="My orders" sub="Track, return or reorder" onPress={() => router.navigate("/orders")} />
        <Row icon="heart-outline" tint="#E11D48" title="Wishlist" right={wishlist.length ? String(wishlist.length) : undefined} onPress={() => router.push("/wishlist")} />
        <Row icon="wallet-outline" tint="#7C3AED" title="Wallet" sub="Rewards & refunds" onPress={() => router.push("/wallet")} />
        <Row icon="flash-outline" tint="#F59E0B" title="QuickReads" sub="Book summaries in minutes" onPress={() => router.push("/quickreads")} last />
      </Group>

      <Group title="Settings" delay={240}>
        <Row
          icon="notifications-outline"
          tint="#0EA5E9"
          title="Notifications"
          right={<Pill on={notifOn} />}
          onPress={() => router.push("/settings/notifications")}
        />
        <Row icon="location-outline" tint="#16A34A" title="Delivery pincode" right={pincode || "Add"} onPress={() => setPin(true)} last />
      </Group>

      <Group title="Help & info" delay={280}>
        <Row icon="logo-whatsapp" tint="#22C55E" title="Chat with us on WhatsApp" sub="Usually replies within minutes" onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi TheBookX, I need help with")}`)} />
        <Row icon="share-social-outline" tint="#FB8500" title="Share the app" onPress={() => shareText(`I buy my books on TheBookX — books from ₹1, Cash on Delivery. Get the app: https://github.com/MurXGen/Thebookxx/releases/latest/download/thebookx.apk`)} />
        <Row icon="information-circle-outline" tint="#64748B" title="About us" onPress={() => router.push(web("/about-us", "About us"))} last />
      </Group>

      <Group title="Policies" delay={320}>
        <Row icon="document-text-outline" tint="#64748B" title="Terms" onPress={() => router.push(web("/terms", "Terms"))} />
        <Row icon="lock-closed-outline" tint="#64748B" title="Privacy" onPress={() => router.push(web("/privacy", "Privacy"))} />
        <Row icon="return-down-back-outline" tint="#64748B" title="Refunds & returns" onPress={() => router.push(web("/refund", "Refunds"))} />
        <Row icon="car-outline" tint="#64748B" title="Shipping" onPress={() => router.push(web("/shipping", "Shipping"))} last />
      </Group>

      {profile.phone ? (
        <PressScale scaleTo={0.98} onPress={logout} style={s.logout}>
          <Ionicons name="log-out-outline" size={19} color={C.red} />
          <Text style={s.logoutTxt}>Log out</Text>
        </PressScale>
      ) : null}

      <View style={s.footer}>
        <Image alt="" source={LOGO} style={s.footLogo} />
        <Text style={s.ver}>TheBookX for Android · v{Constants.expoConfig?.version}</Text>
        <Text style={s.ver}>Made with ❤️ for readers across India</Text>
      </View>
      <PincodeSheet open={pin} onClose={() => setPin(false)} />
    </Animated.ScrollView>
  );
}

function Tile({ icon, color, n, label, onPress }: { icon: IconName; color: string; n?: number; label: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1 }}>
    <PressScale scaleTo={0.95} onPress={onPress} style={s.tile}>
      <View style={[s.tileIc, { backgroundColor: color + "16" }]}>
        <Ionicons name={icon} size={20} color={color} />
        {n ? (
          <View style={[s.tileBadge, { backgroundColor: color }]}>
            <Text style={s.tileBadgeTxt}>{n}</Text>
          </View>
        ) : null}
      </View>
      <Text style={s.tileLbl}>{label}</Text>
    </PressScale>
    </View>
  );
}

function Pill({ on }: { on: boolean }) {
  return (
    <View style={[s.pill, on ? { backgroundColor: C.greenSoft } : null]}>
      <View style={[s.pillDot, { backgroundColor: on ? C.green : "#B5B5BD" }]} />
      <Text style={[s.pillTxt, on ? { color: C.green } : null]}>{on ? "On" : "Off"}</Text>
    </View>
  );
}

function Group({ title, children, delay = 0 }: { title: string; children: ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={{ marginTop: 20, paddingHorizontal: 16 }}>
      <Text style={s.groupH}>{title}</Text>
      <View style={s.group}>{children}</View>
    </Animated.View>
  );
}

function Row({ icon, tint, title, sub, right, onPress, last }: { icon: IconName; tint: string; title: string; sub?: string; right?: ReactNode; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, !last && s.rowLine, pressed && { backgroundColor: "#F7F7F9" }]}>
      <View style={[s.rowIc, { backgroundColor: tint + "16" }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowT}>{title}</Text>
        {sub ? <Text style={s.rowS}>{sub}</Text> : null}
      </View>
      {typeof right === "string" ? <Text style={s.rowR}>{right}</Text> : right}
      <Ionicons name="chevron-forward" size={17} color="#B5B5BD" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 20, padding: 18, overflow: "hidden" },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarImg: { width: 58, height: 58, borderRadius: 16 },
  hi: { fontSize: 21, fontWeight: "700", color: "#fff" },
  hiSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  xmas: { fontSize: 12, color: "#FCA5A5", fontWeight: "600", marginTop: 4 },
  heroChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 14, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  heroChipTxt: { color: "#fff", fontSize: 12.5, fontWeight: "500", maxWidth: 240 },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  tile: { backgroundColor: "#fff", borderRadius: 16, paddingVertical: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.line },
  tileIc: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  tileBadge: { position: "absolute", top: -4, right: -6, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: "#fff" },
  tileBadgeTxt: { color: "#fff", fontSize: 10, fontWeight: "700", lineHeight: 12 },
  tileLbl: { fontSize: 12.5, fontWeight: "600", color: C.ink },
  refer: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#FBD5A8" },
  referIc: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.brand, alignItems: "center", justifyContent: "center" },
  referH: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  referS: { fontSize: 12, color: C.ink2, marginTop: 1 },
  groupH: { fontSize: 12, fontWeight: "600", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  group: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.line },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  rowIc: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowT: { fontSize: 14.5, fontWeight: "500", color: C.ink },
  rowS: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  rowR: { fontSize: 13, fontWeight: "600", color: C.muted },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillTxt: { fontSize: 11.5, fontWeight: "600", color: C.muted },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 22, height: 50, borderRadius: 14, borderWidth: 1, borderColor: "#F5C2C7", backgroundColor: "#fff" },
  logoutTxt: { color: C.red, fontSize: 15, fontWeight: "600" },
  footer: { alignItems: "center", marginTop: 24, gap: 4 },
  footLogo: { width: 34, height: 34, borderRadius: 9, marginBottom: 4, opacity: 0.9 },
  ver: { textAlign: "center", color: C.muted, fontSize: 11.5 },
});
