import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";
import { Linking, Platform } from "react-native";

// Same app list as the website (src/utils/upiApps.js).
export const UPI_APPS = [
  { key: "gpay", label: "Google Pay", pkg: "com.google.android.apps.nbu.paisa.user", scheme: "tez://", color: "#1A73E8", more: false },
  { key: "phonepe", label: "PhonePe", pkg: "com.phonepe.app", scheme: "phonepe://", color: "#5F259F", more: false },
  { key: "paytm", label: "Paytm", pkg: "net.one97.paytm", scheme: "paytmmp://", color: "#00BAF2", more: false },
  { key: "bhim", label: "BHIM", pkg: "in.org.npci.upiapp", scheme: "bhim://", color: "#F47920", more: true },
  { key: "cred", label: "CRED", pkg: "com.dreamplug.androidapp", scheme: "credpay://", color: "#1C1C1E", more: true },
  { key: "whatsapp", label: "WhatsApp Pay", pkg: "com.whatsapp", scheme: "whatsapp://", color: "#25D366", more: true },
] as const;
export type UpiApp = (typeof UPI_APPS)[number];
export const upiAppByKey = (k?: string | null) => UPI_APPS.find((a) => a.key === k) || null;

// Open the UPI app; if it isn't installed, open its Play Store page
// (website: intent:// with a Play Store fallback URL).
export async function openUpiApp(app: UpiApp) {
  const play = `https://play.google.com/store/apps/details?id=${app.pkg}`;
  if (Platform.OS === "android") {
    try {
      await IntentLauncher.openApplication(app.pkg);
      return "opened";
    } catch {
      try {
        await Linking.openURL(`market://details?id=${app.pkg}`);
      } catch {
        Linking.openURL(play).catch(() => {});
      }
      return "store";
    }
  }
  Linking.openURL(play).catch(() => {});
  return "store";
}

const PREF = "tbx_pref_upi";
export const savePreferredUpi = (k: string) => AsyncStorage.setItem(PREF, k).catch(() => {});
export const loadPreferredUpi = async () => {
  try {
    return (await AsyncStorage.getItem(PREF)) || "";
  } catch {
    return "";
  }
};

// Which UPI apps are on this phone. Needs the <queries> from
// plugins/withUpiQueries (real APK). Returns null when we can't tell
// (Expo Go / web / nothing detected) so the caller shows every app.
export async function detectInstalledUpiApps(): Promise<string[] | null> {
  if (Platform.OS !== "android") return null;
  try {
    const hits = await Promise.all(UPI_APPS.map(async (a) => ((await Linking.canOpenURL(a.scheme).catch(() => false)) ? a.key : "")));
    const found = hits.filter(Boolean);
    return found.length ? found : null;
  } catch {
    return null;
  }
}
