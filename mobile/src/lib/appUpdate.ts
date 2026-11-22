import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { API } from "@/theme";

// Two kinds of updates:
// 1. Over-the-air (EAS Update): JS/screens/text. expo-updates downloads them in
//    the background on launch; we also check when the app comes back to the
//    foreground. A downloaded update runs on next launch, or right away if the
//    reader taps "Restart" on the banner.
// 2. A new APK (native changes): the website's /api/app/version says which APK
//    version is latest; older installs get a banner linking to the download.

export type ApkInfo = { version: string; url: string; notes?: string };

const DISMISS_KEY = "tbx_update_dismissed";

// "1.10.0" > "1.9.2"
export function newer(a: string, b: string) {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  }
  return false;
}

export const installedVersion = () => Constants.nativeAppVersion || Constants.expoConfig?.version || "0.0.0";

async function fetchLatestApk(): Promise<ApkInfo | null> {
  try {
    const r = await fetch(`${API}/api/app/version`, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    const j = (await r.json()) as Partial<ApkInfo>;
    return j.version && j.url ? { version: j.version, url: j.url, notes: j.notes } : null;
  } catch {
    return null;
  }
}

async function checkOta() {
  if (!Updates.isEnabled || __DEV__) return;
  try {
    const res = await Updates.checkForUpdateAsync();
    if (res.isAvailable) await Updates.fetchUpdateAsync();
  } catch {}
}

export type UpdateState = { kind: "ota" } | { kind: "apk"; info: ApkInfo } | null;

export function useAppUpdate() {
  const { isUpdatePending } = Updates.useUpdates();
  const [apk, setApk] = useState<ApkInfo | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    let alive = true;
    const run = async () => {
      const [info, d] = await Promise.all([fetchLatestApk(), AsyncStorage.getItem(DISMISS_KEY).catch(() => null)]);
      if (!alive) return;
      setDismissed(d);
      if (info && newer(info.version, installedVersion())) setApk(info);
    };
    run();
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active") {
        checkOta();
        run();
      }
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  let state: UpdateState = null;
  if (apk && dismissed !== `apk:${apk.version}`) state = { kind: "apk", info: apk };
  else if (isUpdatePending && dismissed !== "ota") state = { kind: "ota" };

  const dismiss = () => {
    const k = state?.kind === "apk" ? `apk:${state.info.version}` : "ota";
    setDismissed(k);
    AsyncStorage.setItem(DISMISS_KEY, k).catch(() => {});
  };
  const restart = () => Updates.reloadAsync().catch(() => {});
  return { state, dismiss, restart };
}
